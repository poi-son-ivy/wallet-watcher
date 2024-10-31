import type {NextApiRequest, NextApiResponse} from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        /*
            Alchemy has a webhook via their status page that will tell us when there's an issue
            with the Base Notify API.

            Since Alchemy probably won't go down in the next few days, we're going to simulate a response
            from their status notification webhook that flips a coin whether we get a good status or
            not.

            Our plan for service resiliency is that we notify the end users when Alchemy is busted via a
            'service degraded' message, in production our plan is to have vendor resiliency ie we maintain
            two wallet watching transaction providers in a failover scenario:

            Alchemy (A) is our primary, Other (B) is our failover, the state machine stuff:
            -We have a table in our DB representing the current state and primary provider
            -if A fails:
                -We mark B as primary in the DB
                -Our app uses the B webhook with any information to the user needed
                (ie: if our backup provider has some latency like Moralis does, we pop a message
                and specify the user should expect transactions to be 30 seconds behind until we
                exit 'degraded mode')
            -if A recovers:
                -We mark A as primary in the DB
                -Our app removes any messages indicating we are in 'degraded mode'
         */

        // Simulate a coin flip to randomly determine the service status
        const isServiceOK = Math.random() < 0.5; // 50% chance of OK or FAILED

        if (isServiceOK) {
            // Simulate Alchemy service OK
            res.status(200).json({
                status: "OK",
                message: "Alchemy service is operational.",
            });
            console.log(`Service Ok`);
        } else {
            // Simulate Alchemy service FAILED, triggering degraded mode
            res.status(503).json({
                status: "FAILED",
                message: "Alchemy service is currently down. Entering 'degraded mode'. Transactions may be delayed.",
            });
            console.log(`Service Degraded: Transactions may be delayed`);
        }
    } else {
        // Handle any non-GET requests
        res.setHeader("Allow", ["GET"]);
        res.status(405).json({ message: `Method ${req.method} not allowed` });
    }
}