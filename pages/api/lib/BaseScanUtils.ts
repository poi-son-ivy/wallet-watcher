
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

                const data = await response.json();
                console.log(data);

            } catch (error:any) {
                console.error(`Error: ${error.message}`)
            }

    }
}