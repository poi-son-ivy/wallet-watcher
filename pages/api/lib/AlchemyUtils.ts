import { JsonRpcProvider } from 'ethers';

// Create an ethers provider using Alchemy's API

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
            return address;
        }
    }
}
