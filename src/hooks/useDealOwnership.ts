'use client';

import { useCallback, useState } from 'react';
import { ethers, formatEther, parseEther, parseUnits } from 'ethers';
import useWallet from './useWallet';
import DealVaultAbi from '@/lib/abis/DealVault.abi';
import ERC20Abi from '@/lib/abis/ERC20.abi';
import DealsManagerAbi from '@/lib/abis/DealsManager.abi';
import { useConfig } from './useConfig';

const useDealOwnership = (vaultAddress: string, nftID: number) => {
    const config = useConfig();
    const [shares, setShares] = useState<number>(0);
    const [amountToReclaim, setAmountToReclaim] = useState<number>(0);
    const [amountFunded, setAmountFunded] = useState<number>(0);
    const [dealStatus, setDealStatus] = useState<number>(0);
    const { signer } = useWallet();

    const refresh = useCallback(async () => {
        if (vaultAddress && signer && window.ethereum && config) {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const manager = new ethers.Contract(
                    config.dealsManagerAddress,
                    DealsManagerAbi,
                    provider
                );
                const vault = new ethers.Contract(vaultAddress, DealVaultAbi, provider);

                // Get user's vault shares
                vault
                    .maxRedeem(signer.address)
                    .then((shares: bigint) => {
                        setShares(+formatEther(shares));
                    })
                    .catch(console.error);

                // Get total assets in vault
                vault
                    .totalAssets()
                    .then((balance: bigint) => {
                        setAmountFunded(+formatEther(balance));
                    })
                    .catch(console.error);

                // Get amount user can withdraw
                vault
                    .maxWithdraw(signer.address)
                    .then((amount: bigint) => {
                        setAmountToReclaim(+formatEther(amount));
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
    }, [vaultAddress, signer, config, nftID]);

    const redeem = async () => {
        if (window.ethereum && vaultAddress && signer) {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const connectedAddress = await signer.getAddress();
                const vault = new ethers.Contract(vaultAddress, DealVaultAbi, signer);
                const tx = await vault.redeem(
                    parseEther('' + shares),
                    connectedAddress,
                    connectedAddress
                );
                await tx.wait();
            } catch (error) {
                console.error('Error redeeming', error);
                throw error;
            }
        }
    };

    const invest = useCallback(
        async (amount: number) => {
            if (!signer || !vaultAddress || !config) {
                alert('Please connect your wallet');
                return;
            }

            try {
                const vault = new ethers.Contract(vaultAddress, DealVaultAbi, signer);

                const erc20 = new ethers.Contract(
                    config.investmentTokenAddress,
                    ERC20Abi,
                    signer
                );

                const amountSerialized = parseUnits(
                    '' + amount,
                    config.investmentTokenDecimals
                        ? BigInt(config.investmentTokenDecimals)
                        : BigInt(18)
                );

                // Approve vault to spend tokens
                const approveTx = await erc20.approve(vaultAddress, amountSerialized);
                await approveTx.wait();

                // Deposit into vault
                const tx = await vault.deposit(amountSerialized, signer.address);
                await tx.wait();
            } catch (error) {
                console.error('Error investing', error);
                throw error;
            }
        },
        [vaultAddress, signer, config]
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

