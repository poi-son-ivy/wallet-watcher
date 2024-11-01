import type { NextApiRequest, NextApiResponse } from 'next';
import { AlchemyUtils } from "@/pages/api/lib/AlchemyUtils";
import {BaseScanUtils} from "@/pages/api/lib/BaseScanUtils";
import {WalletTransaction} from "@/pages/api/types/types";
import {SQLiteUtils} from "@/pages/api/lib/SQLiteUtils";

let events: WalletTransaction[] = [];
let clients: { res: NextApiResponse }[] = []; // Array to store connected clients for SSE

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            // Check that the content type is correct for a GraphQL request
            console.log(req.headers['content-type']);
            if (req.headers['content-type'] !== 'application/json; charset=utf-8') {
                return res.status(400).json({ error: 'Invalid content-type, expected application/json' });
            }

            console.log(`Webhook ID: ${req.body.webhookId}`);
            console.log(`id: ${req.body.id}`);
            console.log(`createdAt: ${req.body.createdAt}`);
            console.log(`type: ${req.body.type}`);

            const walletTransactionData = JSON.parse(JSON.stringify(req.body.event));

            walletTransactionData.activity.reduce(async (promiseChain:any, activity:any, index:any) => {
                await promiseChain;
                const fromAddress = await AlchemyUtils.resolveENS(activity.fromAddress) || 'None';
                const toAddress = await AlchemyUtils.resolveENS(activity.toAddress) || 'None';
                const newFromEthBalance = await BaseScanUtils.getEthBalance(fromAddress);
                const newToEthBalance = await BaseScanUtils.getEthBalance(toAddress);

                const walletTransaction:WalletTransaction = {
                    fromAddress: fromAddress,
                    toAddress: toAddress,
                    blockNum: activity.blockNum,
                    hash: activity.hash,
                    value: activity.value,
                    asset: activity.asset,
                    newToEthBalance: newFromEthBalance,
                    newFromEthBalance: newToEthBalance,
                    category: activity.category,
                    rawContract: {
                        address: activity.rawContract.address,
                        rawValue: activity.rawContract.rawValue,
                        decimals: activity.rawContract.decimals,
                    },
                };
                events.push(walletTransaction);
                // Notify all connected clients
                clients.forEach(client => {
                    console.log("Sending event to client");
                    client.res.write(`data: ${JSON.stringify(walletTransaction)}\n\n`);
                });

                await SQLiteUtils.insertTransaction(walletTransaction);

                console.log("===== Wallet Transaction =====");
                console.log(`  From Address       : ${walletTransaction.fromAddress}`);
                console.log(`  To Address         : ${walletTransaction.toAddress}`);
                console.log(`  Block Number       : ${walletTransaction.blockNum ?? 'None'}`);
                console.log(`  Transaction Hash   : ${walletTransaction.hash ?? 'None'}`);
                console.log(`  Value              : ${walletTransaction.value ?? 'None'}`);
                console.log(`  Asset              : ${walletTransaction.asset ?? 'None'}`);
                console.log(`  New To Eth Balance : ${walletTransaction.newToEthBalance ?? 'None'}`);
                console.log(`  New From Eth Balance: ${walletTransaction.newFromEthBalance ?? 'None'}`);
                console.log(`  Category           : ${walletTransaction.category ?? 'None'}`);
                console.log("  Raw Contract Info:");
                console.log(`    - Address        : ${walletTransaction.rawContract?.address ?? 'None'}`);
                console.log(`    - Value          : ${walletTransaction.rawContract?.rawValue ?? 'None'}`);
                console.log(`    - Decimals       : ${walletTransaction.rawContract?.decimals ?? 'None'}`);

                console.log("===================================");

            }, Promise.resolve());

            // Check if the client accepts SSE
            if (req.headers.accept && req.headers.accept === 'text/event-stream') {
                // Set SSE headers
                res.setHeader('Content-Type', 'text/event-stream');
                res.setHeader('Cache-Control', 'no-cache');
                res.setHeader('Connection', 'keep-alive');
            }

            const event = `data: hi\n\n`;
            res.write(event);
            res.status(200).json({ message: 'Parsed walletTransaction, thank you!' });

        } catch (error) {
            console.error('Error processing GraphQL webhook:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } else if (req.method === 'GET') {
        console.log("New SSE connection request");
        // Handle SSE connection
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();

        // Add the client to the list of clients
        const client = { res };
        clients.push(client);
        console.log("Client added to SSE clients list");

        // Send an initial message to keep the connection open and active
        res.write(`data: ${JSON.stringify({ message: 'Connection established, waiting for events...' })}\n\n`);

        console.log("Sent initial connection msg");

        // Send initial data to client
        try {
            const currentTransactions = await SQLiteUtils.getAllTransactions();
            console.log("Sending initial transaction data to client");
            res.write(`data: ${JSON.stringify(currentTransactions)}\n\n`);
        } catch (error) {
            console.error("Error fetching initial transactions:", error);
        }

        events.forEach(event => {
            console.log("Sending existing event to client:", event);
            res.write(`data: ${JSON.stringify(event)}\n\n`);
        });

        // Send a keep-alive signal every 15 seconds
        const keepAliveInterval = setInterval(() => {
            console.log("Sending keep-alive signal to client");
            res.write(`:\n\n`); // SSE comment to keep connection alive
        }, 5000);

        // Remove client on connection close and clear interval
        req.on('close', () => {
            console.log("Client disconnected from SSE");
            clearInterval(keepAliveInterval);
            clients = clients.filter(c => c !== client);
            res.end();
        });

        res.status(200).json({ message: 'Parsed walletTransaction, thank you!' });

    }
    else {
        // If the method is not supported, return a 405 Method Not Allowed error
        res.setHeader('Allow', ['POST', 'GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
