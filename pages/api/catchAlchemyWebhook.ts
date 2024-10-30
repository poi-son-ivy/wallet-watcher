import type { NextApiRequest, NextApiResponse } from 'next';

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
            console.log(`event: `);

            res.status(200).json({ message: 'Got webhook' });

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
