"use client";

import React, { createContext, useContext, ReactNode } from "react";
import useWallet from "@/hooks/useWallet";

// Shape is whatever useWallet returns today
type WalletContextType = ReturnType<typeof useWallet>;

const WalletContext = createContext<WalletContextType | null>(null);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const walletState = useWallet();

    return (
        <WalletContext.Provider value={walletState}>
            {children}
        </WalletContext.Provider>
    );
};

export const useWalletContext = (): WalletContextType => {
    const ctx = useContext(WalletContext);
    if (!ctx) {
        throw new Error("useWalletContext must be used within a WalletProvider");
    }
    return ctx;
};

