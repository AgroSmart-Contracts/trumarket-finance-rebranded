'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { JsonRpcSigner, ethers } from 'ethers';
import { useWeb3AuthContext } from '@/context/web3-auth-context';
import { ADAPTER_STATUS } from '@web3auth/base';

import { BlockchainClient } from '@/lib/BlockchainClient';
import { Wallet } from '@/types/wallet';

const useWallet = () => {
    const { web3authSfa, web3authPnPInstance } = useWeb3AuthContext();

    const [wallet, setWallet] = useState<Wallet | undefined>();
    const [connectedAddress, setConnectedAddress] = useState<string | undefined>();
    const [signer, setSigner] = useState<JsonRpcSigner | undefined>();
    const [network, setNetwork] = useState<string | undefined>();

    // Get Web3Auth provider
    const web3AuthProvider = useMemo(() => {
        if (web3authSfa.provider) {
            return web3authSfa.provider;
        }
        if (web3authPnPInstance?.status === ADAPTER_STATUS.CONNECTED && web3authPnPInstance.provider) {
            return web3authPnPInstance.provider;
        }
        return null;
    }, [web3authSfa.provider, web3authPnPInstance?.status, web3authPnPInstance?.provider]);

    // Convert Web3Auth provider to ethers provider
    const provider = useMemo(() => {
        if (!web3AuthProvider) return undefined;
        return new ethers.BrowserProvider(web3AuthProvider as any);
    }, [web3AuthProvider]);


    const ensureNetwork = useCallback(async () => {
        if (!web3AuthProvider) return;

        const chainId = process.env.NEXT_PUBLIC_EVM_CHAIN_ID || '0x2105'; // Default to Base mainnet
        if (!chainId) return;

        try {
            await (web3AuthProvider as any).request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId }],
            });
        } catch (switchError: any) {
            if (switchError?.code === 4902) {
                console.error('Chain not added to wallet');
            } else {
                console.error('Failed to switch network:', switchError);
            }
        }
    }, [web3AuthProvider]);

    const getNetwork = useCallback(async () => {
        if (!provider) return;
        try {
            const net = await provider.getNetwork();
            setNetwork(`0x${net.chainId.toString(16)}`);
        } catch (error) {
            console.error('Error getting network', error);
        }
    }, [provider]);

    const refreshBalances = useCallback(
        async () => {
            if (!provider || !connectedAddress) return;

            const investmentTokenAddress = process.env.NEXT_PUBLIC_INVESTMENT_TOKEN_CONTRACT_ADDRESS;
            if (!investmentTokenAddress) {
                console.warn('Investment token address not configured');
                return;
            }

            try {
                const balance = await provider.getBalance(connectedAddress);
                const etherBalance = ethers.formatEther(balance);

                setWallet(prev => ({
                    label: 'Connected Wallet',
                    address: connectedAddress,
                    balance: +etherBalance.toString(),
                    balanceUnderlying: prev?.balanceUnderlying ?? 0,
                }));

                try {
                    const tokenBalance = await new BlockchainClient(
                        investmentTokenAddress,
                        provider
                    ).getBalance(connectedAddress);

                    setWallet(prev =>
                        prev
                            ? {
                                ...prev,
                                balanceUnderlying: tokenBalance,
                            }
                            : prev
                    );
                } catch (error) {
                    console.error('Error fetching token balance', error);
                }
            } catch (error) {
                console.error('Error refreshing balances', error);
            }
        },
        [provider, connectedAddress]
    );

    const connectMetaMask = useCallback(async () => {
        if (!web3AuthProvider || !provider) {
            return;
        }

        try {
            await ensureNetwork();

            // Get accounts from Web3Auth provider
            const accounts = await (web3AuthProvider as any).request({
                method: 'eth_accounts',
            });

            if (!accounts || accounts.length === 0) {
                return;
            }

            const newSigner = await provider.getSigner();
            const addr = await newSigner.getAddress();

            setConnectedAddress(addr);
            setSigner(newSigner);
            setWallet({
                label: 'Connected Wallet',
                address: addr,
                balance: 0,
                balanceUnderlying: 0,
            });

            await getNetwork();
            await refreshBalances();
        } catch (err) {
            console.warn(`did not connect: ${err}`);
        }
    }, [web3AuthProvider, provider, ensureNetwork, getNetwork, refreshBalances]);

    const disconnect = useCallback(async () => {
        setConnectedAddress(undefined);
        setSigner(undefined);
        setWallet(undefined);
        setNetwork(undefined);
    }, []);

    // Refresh balances when address changes
    useEffect(() => {
        if (connectedAddress) {
            refreshBalances();
        }
    }, [connectedAddress, refreshBalances]);

    // Refresh when config becomes available (if already connected)
    useEffect(() => {
        if (connectedAddress) {
            refreshBalances();
        }
    }, [connectedAddress, refreshBalances]);

    // Auto-connect on load if Web3Auth is connected
    useEffect(() => {
        if (!web3AuthProvider || !provider) {
            return;
        }

        (async () => {
            try {
                const accounts: string[] = await (web3AuthProvider as any).request({
                    method: 'eth_accounts',
                });

                if (accounts && accounts.length) {
                    const newSigner = await provider.getSigner();
                    const addr = await newSigner.getAddress();

                    setConnectedAddress(addr);
                    setSigner(newSigner);
                    setWallet({
                        label: 'Connected Wallet',
                        address: addr,
                        balance: 0,
                        balanceUnderlying: 0,
                    });

                    await getNetwork();
                    await ensureNetwork();
                    await refreshBalances();
                }
            } catch (error) {
                console.error('Error checking connected accounts', error);
            }
        })();
    }, [
        web3AuthProvider,
        provider,
        ensureNetwork,
        getNetwork,
        refreshBalances,
    ]);

    // Reconnect when Web3Auth status changes
    useEffect(() => {
        if (!web3AuthProvider || !provider) {
            setConnectedAddress(undefined);
            setSigner(undefined);
            setWallet(undefined);
            return;
        }

        (async () => {
            try {
                const accounts: string[] = await (web3AuthProvider as any).request({
                    method: 'eth_accounts',
                });

                if (accounts && accounts.length) {
                    const newSigner = await provider.getSigner();
                    const addr = await newSigner.getAddress();

                    setConnectedAddress(addr);
                    setSigner(newSigner);
                    setWallet({
                        label: 'Connected Wallet',
                        address: addr,
                        balance: 0,
                        balanceUnderlying: 0,
                    });

                    await getNetwork();
                    await refreshBalances();
                }
            } catch (error) {
                console.error('Error handling Web3Auth status change', error);
            }
        })();
    }, [web3AuthProvider, provider, getNetwork, refreshBalances]);

    // Always return a consistent shape
    if (!provider) {
        return {
            wallet,
            signer,
            connectMetaMask: async () => { },
            disconnect: async () => { },
            refreshBalances: async () => { },
            network,
            ensureNetwork: async () => { },
            error: 'Web3Auth wallet not connected!',
        };
    }

    return {
        wallet,
        signer,
        connectMetaMask,
        disconnect,
        refreshBalances,
        network,
        ensureNetwork,
    };
};

export default useWallet;

