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
