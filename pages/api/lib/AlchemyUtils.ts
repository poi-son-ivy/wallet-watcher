import { JsonRpcProvider } from 'ethers';
import * as crypto from "crypto";

const provider = new JsonRpcProvider("https://eth-mainnet.g.alchemy.com/v2/" + process.env.ALCHEMY_KEY);

export class AlchemyUtils {
    public static async resolveENS(address: string): Promise<string> {
        try {
            // Look up the ENS name for the Ethereum address
            const ensName = await provider.lookupAddress(address);

            if (ensName) {
                return ensName;
            } else {
                return address;
            }
        } catch (error) {
            return address; //if we otherwise fail we just return the address itself
        }
    }

    public static isValidSignatureForStringBody(
        body: string, // must be raw string body, not json transformed version of the body
        signature: string, // your "X-Alchemy-Signature" from header
        signingKey: string, // taken from dashboard for specific webhook
    ): boolean {
        const hmac = crypto.createHmac("sha256", signingKey); // Create a HMAC SHA256 hash using the signing key
        hmac.update(body, "utf8"); // Update the token hash with the request body using utf8
        const digest = hmac.digest("hex");
        return signature === digest;
    }
}
