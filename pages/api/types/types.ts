export interface Transaction {
    id: number;
    from_address: string;
    to_address: string;
    block_number: string;
    transaction_hash: string;
    value: number | null;
    asset: string | null;
    new_to_eth_balance: number | null;
    new_from_eth_balance: string | null;
    category: string | null;
    raw_contract_address: string | null;
    raw_contract_value: string | null;
    decimals: number | null;
}

// types/activity.ts

export interface WalletTransaction {
    fromAddress: string;
    toAddress: string;
    blockNum?: string; // Optional because it could be 'None'
    hash?: string; // Optional because it could be 'None'
    value?: number | string; // Assuming `value` could be numeric or 'None'
    asset?: string; // Optional because it could be 'None'
    newToEthBalance?: string;
    newFromEthBalance?: string;
    category?: string;
    rawContract?: {
        address?: string;
        rawValue?: string;
        decimals?: number;
    };
}
