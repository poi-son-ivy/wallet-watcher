import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            // Get the body from the request
            const postData = req.body;

            // Enumerate all the POST variables
            const enumeratedVars = Object.keys(postData).map((key) => {
                return { [key]: postData[key] };
            });

            // Log the POST variables to the console for debugging
            console.log('POST Variables:', enumeratedVars);

            // Send a response back to acknowledge receipt
            res.status(200).json({
                message: 'Webhook received',
                postData: enumeratedVars,
            });
        } catch (error) {
            console.error('Error processing webhook:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        // If not a POST request, return a 405 Method Not Allowed
        res.setHeader('Allow', ['POST']);
        res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
}
