'use client';

import { useCallback, useMemo } from 'react';
import { ethers, parseUnits, formatUnits, ContractTransactionReceipt } from 'ethers';
import { useWalletContext } from '@/context/wallet-context';
import { useWeb3AuthContext } from '@/context/web3-auth-context';
import { ADAPTER_STATUS, IProvider } from '@web3auth/base';
import TruMarketDealAbi from '@/lib/abis/TruMarketDeal.abi';
import ERC20Abi from '@/lib/abis/ERC20.abi';

/**
 * Hook to interact with the TruMarketDeal contract
 * Uses the shared wallet context to ensure all transactions use the Web3Auth profile wallet
 */
const useTruMarketDeal = () => {
    const { signer } = useWalletContext();
    const { web3authSfa, web3authPnPInstance } = useWeb3AuthContext();

    const contractAddress = process.env.NEXT_PUBLIC_SAFE_CONTRACT_ADDRESS;
    const investmentTokenDecimals = Number(process.env.NEXT_PUBLIC_INVESTMENT_TOKEN_DECIMALS || '6');

    /**
     * Resolve the active Web3Auth provider (SFA or PnP), if any.
     */
    const web3AuthProvider: IProvider | null = useMemo(() => {
        if (web3authSfa.provider) {
            return web3authSfa.provider as IProvider;
        }

        if (web3authPnPInstance?.status === ADAPTER_STATUS.CONNECTED && web3authPnPInstance.provider) {
            return web3authPnPInstance.provider as IProvider;
        }

        return null;
    }, [web3authSfa.provider, web3authPnPInstance?.status, web3authPnPInstance?.provider]);

    /**
     * Shared guard for required env/config.
     */
    const ensureContractAddress = () => {
        if (!contractAddress) {
            throw new Error(
                'TruMarket Deal contract address not configured. Please set NEXT_PUBLIC_SAFE_CONTRACT_ADDRESS.'
            );
        }
        return contractAddress;
    };

    /**
     * Funds a deal by calling fundDeal on the TruMarketDeal contract
     * @param dealId The deal ID to fund (hardcoded for now)
     * @param amount The amount to invest (in human-readable format, e.g., 1000 for 1000 USDC)
     * @returns Promise that resolves when the transaction is confirmed
     */
    const fundDeal = useCallback(
        async (dealId: string, amount: number): Promise<ContractTransactionReceipt> => {
            const targetAddress = ensureContractAddress();

            if (!signer) {
                throw new Error('Please connect your wallet first.');
            }

            try {
                const truMarketDeal = new ethers.Contract(targetAddress, TruMarketDealAbi, signer);

                // Get the token address from the contract
                const tokenAddress: string = await truMarketDeal.token();

                // Create ERC20 contract instance for approval
                const erc20 = new ethers.Contract(tokenAddress, ERC20Abi, signer);

                // Convert amount to token units (e.g., USDC uses 6 decimals)
                const amountInWei = parseUnits(amount.toString(), investmentTokenDecimals);

                // Step 1: Approve the contract to spend tokens
                const approveTx = await erc20.approve(targetAddress, amountInWei);
                await approveTx.wait();

                // Step 2: Fund the deal
                // ethers.js will automatically convert dealId string to uint256
                const fundTx = await truMarketDeal.fundDeal(dealId, amountInWei);
                const receipt = await fundTx.wait();

                return receipt as ContractTransactionReceipt;
            } catch (error: any) {
                // Provide user-friendly error messages
                if (error?.code === 'ACTION_REJECTED' || error?.code === 4001) {
                    throw new Error('Transaction was rejected. Please try again.');
                }

                if (error?.reason) {
                    throw new Error(error.reason);
                }

                if (error?.message) {
                    throw new Error(error.message);
                }

                throw new Error('Failed to fund deal. Please try again.');
            }
        },
        [ensureContractAddress, investmentTokenDecimals, signer]
    );

    /**
     * Gets deal information from the contract
     * @param dealId The deal ID to query
     */
    const getDealInfo = useCallback(
        async (dealId: string) => {
            const targetAddress = ensureContractAddress();

            if (!web3AuthProvider) {
                return {
                    maxDeposit: '0',
                    deposits: '0',
                    creator: '0x0000000000000000000000000000000000000000',
                };
            }

            try {
                const provider = new ethers.BrowserProvider(web3AuthProvider as any);
                const truMarketDeal = new ethers.Contract(
                    targetAddress,
                    TruMarketDealAbi,
                    provider
                );

                const [maxDeposit, deposits, creator] = await Promise.all([
                    truMarketDeal.dealMaxDeposit(dealId),
                    truMarketDeal.dealDeposits(dealId),
                    truMarketDeal.dealCreator(dealId),
                ]);

                return {
                    maxDeposit: maxDeposit.toString(),
                    deposits: deposits.toString(),
                    creator: creator.toString(),
                };
            } catch (error) {
                throw error;
            }
        },
        [ensureContractAddress, web3AuthProvider]
    );

    /**
     * Gets the user's invested amount (LP token balance) for a specific deal
     * @param dealId The deal ID to query
     * @param userAddress The user's wallet address (optional, uses signer address if not provided)
     * @returns The invested amount in human-readable format (e.g., 1000 for 1000 USDC)
     */
    const getUserInvestedAmount = useCallback(
        async (dealId: string, userAddress?: string): Promise<number> => {
            const targetAddress = ensureContractAddress();

            if (!web3AuthProvider) {
                console.log('getUserInvestedAmount: No web3AuthProvider');
                return 0;
            }

            try {
                const provider = new ethers.BrowserProvider(web3AuthProvider as any);
                const truMarketDeal = new ethers.Contract(
                    targetAddress,
                    TruMarketDealAbi,
                    provider
                );

                // Get user address from signer if not provided
                let address = userAddress;
                if (!address && signer) {
                    try {
                        address = await signer.getAddress();
                    } catch (error) {
                        console.error('getUserInvestedAmount: Error getting address from signer', error);
                        return 0;
                    }
                }

                if (!address) {
                    console.log('getUserInvestedAmount: No address available');
                    return 0;
                }

                // Get balance using ERC1155 balanceOf function on the TruMarketDeal contract
                // This returns the LP tokens (amount deposited) when user called fundDeal
                // Add timeout to prevent hanging
                const balancePromise = truMarketDeal.balanceOf(address, dealId);
                const timeoutPromise = new Promise<never>((_, reject) => {
                    setTimeout(() => reject(new Error('Contract call timeout')), 8000);
                });

                const balance = await Promise.race([balancePromise, timeoutPromise]);

                // Convert from token units to human-readable format
                const investedAmount = parseFloat(formatUnits(balance, investmentTokenDecimals));

                return investedAmount;
            } catch (error: any) {
                // Log error for debugging but don't throw - return 0 instead
                if (error?.message?.includes('timeout')) {
                    console.warn('getUserInvestedAmount: Contract call timed out', error);
                } else if (error?.code !== 'CALL_EXCEPTION') {
                    // Only log non-contract errors (CALL_EXCEPTION is expected if user hasn't invested)
                    console.error('getUserInvestedAmount: Error fetching balance', error);
                }
                // Return 0 if there's an error (e.g., user hasn't invested yet)
                return 0;
            }
        },
        [ensureContractAddress, investmentTokenDecimals, signer, web3AuthProvider]
    );

    return {
        fundDeal,
        getDealInfo,
        getUserInvestedAmount,
    };
};

export default useTruMarketDeal;
