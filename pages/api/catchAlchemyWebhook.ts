import type { NextApiRequest, NextApiResponse } from 'next';
import { AlchemyUtils } from "@/pages/api/lib/AlchemyUtils";
import {BaseScanUtils} from "@/pages/api/lib/BaseScanUtils";
import {WalletTransaction} from "@/pages/api/types/types";
import {SQLiteUtils} from "@/pages/api/lib/SQLiteUtils";

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


            res.status(200).json({ message: 'Parsed walletTransaction, thank you!' });

        } catch (error) {
            console.error('Error processing GraphQL webhook:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        // If it's not a POST request, return a 405 Method Not Allowed
        res.setHeader('Allow', ['POST']);
        res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
}
