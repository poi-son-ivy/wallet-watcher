import sqlite3 from 'sqlite3';
import { Transaction, WalletTransaction } from '../types/types';

export class SQLiteUtils {
    public static async getAllTransactions():Promise<WalletTransaction[]> {
        const db = new sqlite3.Database("./pages/api/db/transactions.db");
        return new Promise((resolve, reject) => {
            db.all("SELECT * FROM transactions", (err, rows) => {
                if (err) {
                    reject(err); // Reject the promise if an error occurs
                } else {
                    // Coerce rows to WalletTransaction[] if they match the type structure
                    resolve(rows as WalletTransaction[]);
                }
            });
            db.close(); // Close the database connection
        });
    }

    public static async insertTransaction(transaction: WalletTransaction) {
        const db = new sqlite3.Database("./pages/api/db/transactions.db");

        try {
            db.run(
                `INSERT INTO transactions (
        from_address,
        to_address,
        block_number,
        transaction_hash,
        value,
        asset,
        new_to_eth_balance,
        new_from_eth_balance,
        category,
        raw_contract_address,
        raw_contract_value,
        decimals
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    transaction.fromAddress,
                    transaction.toAddress,
                    transaction.blockNum || null,
                    transaction.hash || null,
                    typeof transaction.value === 'number' ? transaction.value : null,
                    transaction.asset || null,
                    transaction.newToEthBalance || null,
                    transaction.newFromEthBalance || null,
                    transaction.category || null,
                    transaction.rawContract?.address || null,
                    transaction.rawContract?.rawValue || null,
                    typeof transaction.rawContract?.decimals === 'number' ? transaction.rawContract.decimals : null,
                ]
            );
        } catch (error) {
            console.error('Failed to insert transaction:', error);
        } finally {
            await db.close();
        }

    }
}