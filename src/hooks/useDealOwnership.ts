'use client';

import { useCallback, useState } from 'react';
import { ethers, formatUnits, parseUnits } from 'ethers';
import { useWalletContext } from '@/context/wallet-context';
import { useWeb3AuthContext } from '@/context/web3-auth-context';
import { ADAPTER_STATUS } from '@web3auth/base';
import DealVaultAbi from '@/lib/abis/DealVault.abi';
import ERC20Abi from '@/lib/abis/ERC20.abi';
import DealsManagerAbi from '@/lib/abis/DealsManager.abi';
const useDealOwnership = (vaultAddress: string, nftID: number) => {
    const [shares, setShares] = useState<number>(0);
    const [amountToReclaim, setAmountToReclaim] = useState<number>(0);
    const [amountFunded, setAmountFunded] = useState<number>(0);
    const [dealStatus, setDealStatus] = useState<number>(0);
    const { signer } = useWalletContext();
    const { web3authSfa, web3authPnPInstance } = useWeb3AuthContext();

    const refresh = useCallback(async () => {
        const dealsManagerAddress = process.env.NEXT_PUBLIC_DEALS_MANAGER_ADDRESS;
        const decimals = process.env.NEXT_PUBLIC_INVESTMENT_TOKEN_DECIMALS || '6';

        // Get Web3Auth provider
        const web3AuthProvider = web3authSfa.provider
            ? web3authSfa.provider
            : web3authPnPInstance?.status === ADAPTER_STATUS.CONNECTED && web3authPnPInstance.provider
                ? web3authPnPInstance.provider
                : null;

        if (vaultAddress && signer && web3AuthProvider && dealsManagerAddress) {
            try {
                const provider = new ethers.BrowserProvider(web3AuthProvider as any);
                const manager = new ethers.Contract(
                    dealsManagerAddress,
                    DealsManagerAbi,
                    provider
                );
                const vault = new ethers.Contract(vaultAddress, DealVaultAbi, provider);

                // Get user's vault shares (using USDC decimals = 6)
                vault
                    .maxRedeem(signer.address)
                    .then((shares: bigint) => {
                        const formatted = +formatUnits(shares, Number(decimals));
                        setShares(formatted);
                    })
                    .catch(console.error);

                // Get total assets in vault (using USDC decimals = 6)
                vault
                    .totalAssets()
                    .then((balance: bigint) => {
                        const formatted = +formatUnits(balance, Number(decimals));
                        setAmountFunded(formatted);
                    })
                    .catch(console.error);

                // Get amount user can withdraw (using USDC decimals = 6)
                vault
                    .maxWithdraw(signer.address)
                    .then((amount: bigint) => {
                        const formatted = +formatUnits(amount, Number(decimals));
                        setAmountToReclaim(formatted);
                    })
                    .catch(console.error);

                // Get deal status
                manager
                    .status(nftID)
                    .then((status: bigint) => {
                        setDealStatus(Number(status.toString()));
                    })
                    .catch(console.error);
            } catch (error) {
                console.error('Error refreshing deal ownership', error);
            }
        }
    }, [vaultAddress, signer, nftID, web3authSfa.provider, web3authPnPInstance?.status, web3authPnPInstance?.provider]);

    const redeem = async () => {
        // Get Web3Auth provider
        const web3AuthProvider = web3authSfa.provider
            ? web3authSfa.provider
            : web3authPnPInstance?.status === ADAPTER_STATUS.CONNECTED && web3authPnPInstance.provider
                ? web3authPnPInstance.provider
                : null;

        if (web3AuthProvider && vaultAddress && signer) {
            try {
                const decimals = process.env.NEXT_PUBLIC_INVESTMENT_TOKEN_DECIMALS || '6';
                const connectedAddress = await signer.getAddress();
                const vault = new ethers.Contract(vaultAddress, DealVaultAbi, signer);

                // Use USDC decimals (6) not ETH decimals (18)
                const shareAmount = parseUnits('' + shares, Number(decimals));

                const tx = await vault.redeem(
                    shareAmount,
                    connectedAddress,
                    connectedAddress
                );
                await tx.wait();

                // Refresh after redeem
                await refresh();
            } catch (error) {
                console.error('Error redeeming', error);
                throw error;
            }
        }
    };

    const invest = useCallback(
        async (amount: number) => {
            const investmentTokenAddress = process.env.NEXT_PUBLIC_INVESTMENT_TOKEN_CONTRACT_ADDRESS;
            const investmentTokenDecimals = process.env.NEXT_PUBLIC_INVESTMENT_TOKEN_DECIMALS || '6';

            if (!signer) {
                alert('Please connect your wallet first');
                return;
            }

            if (!vaultAddress) {
                alert('Vault address not found');
                return;
            }

            if (!investmentTokenAddress) {
                console.error('NEXT_PUBLIC_INVESTMENT_TOKEN_CONTRACT_ADDRESS not configured');
                alert('Investment token not configured. Please check environment variables.');
                return;
            }

            try {
                const vault = new ethers.Contract(vaultAddress, DealVaultAbi, signer);

                const erc20 = new ethers.Contract(
                    investmentTokenAddress,
                    ERC20Abi,
                    signer
                );

                const amountSerialized = parseUnits(
                    '' + amount,
                    BigInt(investmentTokenDecimals)
                );

                // Approve vault to spend tokens
                const approveTx = await erc20.approve(vaultAddress, amountSerialized);
                await approveTx.wait();

                // Deposit into vault
                const tx = await vault.deposit(amountSerialized, signer.address);
                await tx.wait();

                // Refresh data after successful deposit
                await refresh();
            } catch (error) {
                console.error('Error investing', error);
                throw error;
            }
        },
        [vaultAddress, signer, refresh]
    );

    return {
        shares,
        signer,
        refresh,
        redeem,
        invest,
        amountFunded,
        amountToReclaim,
        dealStatus,
    };
};

export default useDealOwnership;

