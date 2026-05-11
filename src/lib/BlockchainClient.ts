'use client';

import { ethers, formatUnits, BrowserProvider } from 'ethers';
import ERC20Abi from './abis/ERC20.abi';

export class BlockchainClient {
    erc20?: ethers.Contract;

    constructor(investmentTokenAddress: string, provider?: BrowserProvider) {
        if (!provider) {
            console.error('Provider is not available');
            return;
        }

        this.erc20 = new ethers.Contract(
            investmentTokenAddress,
            ERC20Abi,
            provider
        );
    }

    async getBalance(address: string): Promise<number> {
        if (!this.erc20) {
            console.error('ERC20 contract is not initialized');
            return 0;
        }

        try {
            const balance = await this.erc20.balanceOf(address);
            // Use 6 decimals for USDC (not 18)
            const decimals = process.env.NEXT_PUBLIC_INVESTMENT_TOKEN_DECIMALS || '6';
            return +formatUnits(balance, Number(decimals)).toString();
        } catch (e) {
            console.error('Error getting balance', e);
            return 0;
        }
    }

    async getVaultAssets(address: string, provider?: BrowserProvider): Promise<number> {
        if (!provider) {
            return 0;
        }

        try {
            const DealVaultAbi = (await import('./abis/DealVault.abi')).default;
            const vault = new ethers.Contract(
                address,
                DealVaultAbi,
                provider
            );

            const balance = await vault.totalAssets();
            return +ethers.formatEther(balance).toString();
        } catch (e) {
            console.error('Error getting vault assets', e);
            return 0;
        }
    }
}

