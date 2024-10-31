import type { NextApiRequest, NextApiResponse } from 'next';
import { AlchemyUtils } from "@/pages/api/lib/AlchemyUtils";

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
            //console.log(`event: ${JSON.stringify(req.body.event)}`);
            const transactionData = JSON.parse(JSON.stringify(req.body.event));

            transactionData.activity.reduce(async (promiseChain:any, activity:any, index:any) => {
                await promiseChain;

                console.log(`Activity ${index + 1}:`);
                console.log(`  Network: Base Mainnet`);
                const fromAddress = await AlchemyUtils.resolveENS(activity.fromAddress) || 'None';
                const toAddress = await AlchemyUtils.resolveENS(activity.toAddress) || 'None';

                console.log(`  From Address: ${fromAddress}`);
                console.log(`  To Address: ${toAddress}`);
                console.log(`  Block Number: ${activity.blockNum || 'None'}`);
                console.log(`  Transaction Hash: ${activity.hash || 'None'}`);
                console.log(`  Value: ${activity.value || 'None'}`);
                console.log(`  Asset: ${activity.asset || 'None'}`);
                console.log(`  Category: ${activity.category || 'None'}`);
                console.log(`  Raw Contract Address: ${activity.rawContract.address || 'None'}`);
                console.log(`  Raw Contract Value: ${activity.rawContract.rawValue || 'None'}`);
                console.log(`  Decimals: ${activity.rawContract.decimals || 'None'}`);
                console.log('----------------------------------------');

            }, Promise.resolve());


            res.status(200).json({ message: 'Parsed transaction, thank you!' });

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
