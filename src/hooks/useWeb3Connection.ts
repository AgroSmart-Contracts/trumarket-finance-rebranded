import { useState, useEffect, useCallback } from 'react';
import { ADAPTER_STATUS } from '@web3auth/base';
import type { CONNECTOR_STATUS_TYPE } from '@web3auth/no-modal';
import { useWeb3AuthContext } from '@/context/web3-auth-context';

type Web3AuthConnectionStatus =
    | (typeof ADAPTER_STATUS)[keyof typeof ADAPTER_STATUS]
    | CONNECTOR_STATUS_TYPE
    | null;

interface UseWeb3ConnectionReturn {
    isConnected: boolean;
    isInitializing: boolean;
    connectionStatus: Web3AuthConnectionStatus;
    checkConnection: () => boolean;
}

/**
 * Hook to manage Web3Auth connection status with event-driven checks
 * instead of hardcoded delays
 */
export const useWeb3Connection = (): UseWeb3ConnectionReturn => {
    const { web3authSfa, web3authPnPInstance, isPnPInitialized, sfaInitialized } = useWeb3AuthContext();
    const [isConnected, setIsConnected] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);
    const [connectionStatus, setConnectionStatus] = useState<Web3AuthConnectionStatus>(null);

    const checkConnection = useCallback((): boolean => {
        const sfaConnected = Boolean(web3authSfa.provider);
        const pnpConnected =
            web3authPnPInstance?.status === ADAPTER_STATUS.CONNECTED &&
            Boolean(web3authPnPInstance.provider);
        const connected = sfaConnected || pnpConnected;

        setIsConnected(connected);

        if (sfaConnected) {
            setConnectionStatus(ADAPTER_STATUS.CONNECTED);
        } else if (pnpConnected) {
            setConnectionStatus(web3authPnPInstance?.status || null);
        } else {
            setConnectionStatus(null);
        }

        const stillInitializing =
            !sfaInitialized ||
            (!isPnPInitialized && web3authPnPInstance?.status === ADAPTER_STATUS.NOT_READY);

        setIsInitializing(stillInitializing);

        return connected;
    }, [web3authSfa, web3authPnPInstance, isPnPInitialized, sfaInitialized]);

    // Check connection status whenever Web3Auth status changes
    useEffect(() => {
        checkConnection();
    }, [checkConnection, web3authSfa.provider, web3authPnPInstance?.status, isPnPInitialized, sfaInitialized]);

    return {
        isConnected,
        isInitializing,
        connectionStatus,
        checkConnection,
    };
};
