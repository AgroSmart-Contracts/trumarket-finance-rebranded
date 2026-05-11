export type Wallet = {
    label: string;
    address: string;
    balanceUnderlying?: number;
    balance?: number;
};

declare global {
    interface Window {
        /** EIP-1193 provider; narrowed shape conflicts with other global augmentations (e.g. wagmi/viem). */
        ethereum?: any;
    }
}

