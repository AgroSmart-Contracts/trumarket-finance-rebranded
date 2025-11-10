'use client';

import { BlockchainClient } from '@/lib/BlockchainClient';
import { useEffect, useState, useCallback } from 'react';
import { JsonRpcSigner, ethers } from 'ethers';
import { Wallet } from '@/types/wallet';
import { useConfig } from './useConfig';

const getProvider = () => {
    if (typeof window === 'undefined' || !window.ethereum) {
        return undefined;
    }
    return new ethers.BrowserProvider(window.ethereum);
};

const useWallet = () => {
    const config = useConfig();
    const [wallet, setWallet] = useState<Wallet>();
    const [connectedAddress, setConnectedAddress] = useState<string>();
    const [signer, setSigner] = useState<JsonRpcSigner>();
    const [network, setNetwork] = useState<string>();

    const provider = getProvider();

    if (!provider) {
        return { error: 'MetaMask not detected!' };
    }

    const refreshBalances = useCallback(async () => {
        if (!connectedAddress || !config) {
            return;
        }

        try {
            const balance = await provider.getBalance(connectedAddress);
            const etherBalance = ethers.formatEther(balance);

            setWallet((prev) => ({
                label: 'Connected Wallet',
                address: connectedAddress,
                balance: +etherBalance.toString(),
                balanceUnderlying: prev?.balanceUnderlying || 0, // Keep previous value while fetching
            }));

            // Fetch token balance separately (can be slow)
            try {
                const tokenBalance = await new BlockchainClient(
                    config.investmentTokenAddress
                ).getBalance(connectedAddress);
                setWallet((prev) => ({
                    ...prev!,
                    balanceUnderlying: tokenBalance,
                }));
            } catch (error) {
                console.error('Error fetching token balance', error);
            }
        } catch (error) {
            console.error('Error refreshing balances', error);
        }
    }, [connectedAddress, config, provider]);

    useEffect(() => {
        refreshBalances();
    }, [connectedAddress, refreshBalances]);

    // Refresh balances when config becomes available (if already connected)
    useEffect(() => {
        if (connectedAddress && config) {
            refreshBalances();
        }
    }, [config]); // Only depend on config, refreshBalances is stable

    const ensureNetwork = async () => {
        if (window.ethereum && config) {
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: config.evmChainId }],
                });
            } catch (switchError: any) {
                // This error code indicates that the chain has not been added to MetaMask
                if (switchError.code === 4902) {
                    console.error('Chain not added to MetaMask');
                } else {
                    console.error('Failed to switch network:', switchError);
                }
            }
        }
    };

    const connectMetaMask = async () => {
        if (window.ethereum) {
            try {
                await ensureNetwork();
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                const signer = await provider.getSigner();
                const connectedAddress = await signer.getAddress();

                setConnectedAddress(connectedAddress);
                setSigner(signer);
            } catch (err) {
                console.warn(`did not connect: ${err}`);
            }
        } else {
            console.log('MetaMask not detected!');
        }
    };

    const getNetwork = async () => {
        if (provider) {
            try {
                const network = await provider.getNetwork();
                setNetwork(`0x${network.chainId.toString(16)}`);
            } catch (error) {
                console.error('Error getting network', error);
            }
        }
    };

    // Check for connected accounts immediately (don't wait for config)
    useEffect(() => {
        if (typeof window === 'undefined' || !window.ethereum || !provider) return;

        const ethereum = window.ethereum;
        (async () => {
            try {
                const accounts = await ethereum.request({
                    method: 'eth_accounts',
                });

                if (accounts.length) {
                    const signer = await provider.getSigner();
                    const connectedAddress = await signer.getAddress();

                    // Set address immediately for fast UI update
                    setConnectedAddress(connectedAddress);
                    setSigner(signer);

                    // Set wallet with address immediately (balances will be fetched later)
                    setWallet({
                        label: 'Connected Wallet',
                        address: connectedAddress,
                        balance: 0,
                        balanceUnderlying: 0,
                    });

                    // Ensure network and get network info (can happen in parallel)
                    if (config) {
                        await ensureNetwork();
                    }
                    getNetwork();
                }
            } catch (error) {
                console.error('Error checking connected accounts', error);
            }
        })();
    }, [provider]); // Only depend on provider, not config

    // Set up event listeners and ensure network once config is available
    useEffect(() => {
        if (typeof window === 'undefined' || !window.ethereum || !config) return;

        const ethereum = window.ethereum;

        const handleChainChanged = (chainId: string) => {
            setNetwork(chainId);
        };

        const handleAccountsChanged = async (accounts: string[]) => {
            if (accounts.length) {
                const signer = await provider.getSigner();
                const connectedAddress = await signer.getAddress();
                setConnectedAddress(connectedAddress);
                setSigner(signer);
                setWallet({
                    label: 'Connected Wallet',
                    address: connectedAddress,
                    balance: 0,
                    balanceUnderlying: 0,
                });
                refreshBalances();
            } else {
                setConnectedAddress(undefined);
                setSigner(undefined);
                setWallet(undefined);
            }
        };

        ethereum.on('chainChanged', handleChainChanged);
        ethereum.on('accountsChanged', handleAccountsChanged);

        // Ensure network is correct if already connected
        if (connectedAddress) {
            ensureNetwork();
        }

        return () => {
            ethereum.removeListener('chainChanged', handleChainChanged);
            ethereum.removeListener('accountsChanged', handleAccountsChanged);
        };
    }, [config, provider, connectedAddress, refreshBalances, ensureNetwork]);

    return {
        wallet,
        signer,
        connectMetaMask,
        refreshBalances,
        network,
        ensureNetwork,
    };
};

export default useWallet;

