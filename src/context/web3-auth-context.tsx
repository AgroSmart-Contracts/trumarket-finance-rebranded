"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from "react";
import { Web3Auth } from "@web3auth/single-factor-auth";
import Cookies from "js-cookie";
import {
  WEB3AUTH_NETWORK,
  ADAPTER_STATUS,
  IProvider,
} from "@web3auth/base";
import type { TORUS_LEGACY_NETWORK_TYPE } from "@toruslabs/constants";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import {
  Web3AuthNoModal,
  metaMaskConnector,
  walletConnectV2Connector,
  type CustomChainConfig,
} from "@web3auth/no-modal";
import { WalletConnectModal } from "@walletconnect/modal";
import { useRouter } from "next/navigation";

import { chainConfigEth } from "@/lib/web3/chain-configs";
import { parseToken, uiConsole } from "@/lib/helpers";
import EthereumRpc from "@/lib/web3/evm.web3";

export interface web3AuthContextState { }

interface web3AuthContextType {
  init: () => Promise<void>;
  isLoggingIn: boolean;
  setIsLoggingIn: React.Dispatch<React.SetStateAction<boolean>>;
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  userInfo: any;
  setUserInfo: React.Dispatch<React.SetStateAction<any>>;
  web3authSfa: Web3Auth;
  getUserInfo: () => { jwt: string; user: any } | undefined;
  setJWT: (token: string) => void;
  web3authPnPInstance: Web3AuthNoModal;
  logout: () => void;
  initPnP: () => Promise<void>;
  privateKeyProvider: EthereumPrivateKeyProvider;
  isPnPInitialized: boolean;
  /** True after SFA `init()` completes at least once (v6 SDK has no runtime `status`). */
  sfaInitialized: boolean;
}

const web3AuthContext = createContext<web3AuthContextType | undefined>(undefined);

/** Dedupe concurrent SFA inits; `@web3auth/single-factor-auth` v6 has no `status` to gate on. */
let sfaInitPromise: Promise<void> | null = null;

const ethereumPrivateKeyProvider = new EthereumPrivateKeyProvider({
  config: { chainConfig: chainConfigEth },
});

const walletConnectProjectId = process.env.NEXT_PUBLIC_PROJECT_ID as string;

const web3AuthPnpChain: CustomChainConfig = {
  chainNamespace: chainConfigEth.chainNamespace,
  chainId: chainConfigEth.chainId,
  rpcTarget: chainConfigEth.rpcTarget,
  displayName: chainConfigEth.displayName ?? "Ethereum",
  blockExplorerUrl: chainConfigEth.blockExplorer ?? "",
  ticker: chainConfigEth.ticker ?? "ETH",
  tickerName: chainConfigEth.tickerName ?? "Ether",
  logo: "",
};
/** WalletConnect modal is browser-only; SSR uses a no-op so the module graph matches. */
const walletConnectQrModal =
  typeof window !== "undefined"
    ? new WalletConnectModal({ projectId: walletConnectProjectId })
    : { openModal: async () => { }, closeModal: () => { } };

const web3authSfa = new Web3Auth({
  clientId: process.env.NEXT_PUBLIC_WEB3_AUTH_CLIENT_ID as string,
  /** SFA typings expect legacy network union; runtime accepts Sapphire. */
  web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET as TORUS_LEGACY_NETWORK_TYPE,
  usePnPKey: false,
});

const web3authPnPInstance = new Web3AuthNoModal({
  clientId: process.env.NEXT_PUBLIC_WEB3_AUTH_CLIENT_ID as string,
  web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
  privateKeyProvider: ethereumPrivateKeyProvider as any,
  useSFAKey: true,
  chains: [web3AuthPnpChain],
  defaultChainId: web3AuthPnpChain.chainId,
  connectors: [
    metaMaskConnector({ dappMetadata: { name: "TruMarket" } }),
    walletConnectV2Connector({
      qrcodeModal: walletConnectQrModal,
      walletConnectInitOptions: { projectId: walletConnectProjectId },
    }),
  ],
});

export const Web3AuthContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState({});
  const [isPnPInitialized, setIsPnPInitialized] = useState(false);
  const [sfaInitialized, setSfaInitialized] = useState(false);

  const init = useCallback(async () => {
    try {
      if (!sfaInitPromise) {
        sfaInitPromise = web3authSfa
          .init(ethereumPrivateKeyProvider)
          .then(() => {
            setSfaInitialized(true);
          })
          .catch((err) => {
            sfaInitPromise = null;
            throw err;
          });
      }
      await sfaInitPromise;
    } catch (error: any) {
      uiConsole('Web3Auth SFA init error:', error?.message || 'Unknown error');
      throw error;
    }
  }, []);

  const initPnP = useCallback(async () => {
    try {
      if (web3authPnPInstance.status === ADAPTER_STATUS.NOT_READY) {
        await web3authPnPInstance.init();
      }

      if (web3authPnPInstance.status === ADAPTER_STATUS.CONNECTED && web3authPnPInstance.provider) {
        EthereumRpc.setGlobalProvider(web3authPnPInstance.provider as IProvider);
      }
      setIsPnPInitialized(true);
    } catch (err: any) {
      uiConsole('Web3Auth PnP init error:', err?.message || 'Unknown error');
    }
  }, []);

  useEffect(() => {
    // Initialize both Web3Auth instances on mount
    const initialize = async () => {
      try {
        const formatInitErr = (err: unknown) =>
          err instanceof Error ? err.message : typeof err === 'object' && err !== null ? JSON.stringify(err) : String(err);
        await Promise.all([
          init().catch((err) => uiConsole('SFA init failed:', formatInitErr(err))),
          initPnP().catch((err) => uiConsole('PnP init failed:', formatInitErr(err))),
        ]);
      } catch (error) {
        uiConsole('Initialization error:', error);
      }
    };

    initialize();
  }, [init, initPnP]);

  useEffect(() => {
    if (web3authPnPInstance.status === ADAPTER_STATUS.CONNECTED && web3authPnPInstance.provider) {
      EthereumRpc.setGlobalProvider(web3authPnPInstance.provider as IProvider);
    } else if (web3authSfa.provider) {
      EthereumRpc.setGlobalProvider(web3authSfa.provider as IProvider);
    }
  }, [web3authPnPInstance.status, web3authPnPInstance.provider, web3authSfa.provider]);

  const setJWT = (token: string) => {
    Cookies.set("jwt", token, { expires: 365 });
  };

  const getUserInfo = () => {
    const cookie = Cookies.get("jwt") ?? null;
    if (cookie) {
      return {
        jwt: cookie,
        user: parseToken(cookie),
      };
    }
  };

  const logout = async () => {
    Cookies.remove("jwt");
    router.push("/");

    if (web3authSfa.provider) {
      try {
        await web3authSfa.logout();
      } catch (e: unknown) {
        uiConsole('Web3Auth SFA logout:', e instanceof Error ? e.message : e);
      }
    }

    if (web3authPnPInstance.status === ADAPTER_STATUS.CONNECTED) {
      await web3authPnPInstance.logout({ cleanup: true });
    }

    sfaInitPromise = null;
  };

  const contextValue = {
    init,
    initPnP,
    isLoggingIn,
    isLoggedIn,
    setIsLoggingIn,
    setIsLoggedIn,
    userInfo,
    setUserInfo,
    web3authSfa,
    web3authPnPInstance,
    getUserInfo,
    setJWT,
    logout,
    privateKeyProvider: ethereumPrivateKeyProvider,
    isPnPInitialized,
    sfaInitialized,
  };

  return <web3AuthContext.Provider value={contextValue}>{children}</web3AuthContext.Provider>;
};

export const useWeb3AuthContext = (): web3AuthContextType => {
  const context = useContext(web3AuthContext);
  if (!context) {
    throw new Error("useWeb3AuthContent must be used within a web3AuthContextProvider");
  }
  return context;
};


