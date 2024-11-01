import { BigNumberish, ethers } from 'ethers';

export class BaseScanUtils {

    public static async getERC20BalanceForAddress(address:string){
        /*
            Pro endpoint so just putting the code in for now, we would use this to display
            a post-event balance of the particular token during a wallet activity event
         */
            const url = `https://api.basescan.org/api?module=account&action=addresstokenbalance&address=${address}&page=1&offset=2&apikey=${process.env.BASESCAN_KEY}`;

            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }

            } catch (error:unknown) {
                if (error instanceof Error) {
                    console.error(`Error: ${error.message}`);
                } else {
                    console.error(`Unknown error:`, error);
                }
            }

    }

    public static async getEthBalance(address:string):Promise<string | undefined> {
        const url = `https://api.basescan.org/api?module=account&action=balance&address=${address}&tag=latest&apikey=${process.env.BASESCAN_KEY}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const data = await response.json();

            const status: string = data.status;
            const message: string = data.message;
            const result: BigNumberish = data.result;

            if(status && message === 'OK') {
                return ethers.formatUnits(result, "ether");
            }
            else {
                throw new Error(`Error: Error in requesting eth balance`);
            }

        } catch (error:unknown) {
            if (error instanceof Error) {
                console.error(`Error: ${error.message}`);
            } else {
                console.error(`Unknown error:`, error);
            }
        }
    }
}