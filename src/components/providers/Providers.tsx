"use client";

import React from 'react';
import { Auth0Provider } from '@auth0/auth0-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, lightTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { COLORS } from '@/lib/constants';
import { Web3AuthContextProvider } from '@/context/web3-auth-context';
import { WalletProvider } from '@/context/wallet-context';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { config } from '@/lib/wagmi-config';

const queryClient = new QueryClient();

const rainbowKitTruMarketTheme = lightTheme({
  accentColor: COLORS.primary.green,
  accentColorForeground: COLORS.background.white,
  borderRadius: 'large',
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Auth0Provider
      domain={process.env.NEXT_PUBLIC_AUTH0_BASE_URL || ''}
      clientId={process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID_SOCIAL || ''}
      authorizationParams={{
        /** Must match on server and client to avoid hydration mismatches; use env (see README). */
        redirect_uri: process.env.NEXT_PUBLIC_APP_URL || '',
      }}
    >
      <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
          <RainbowKitProvider theme={rainbowKitTruMarketTheme}>
        <Web3AuthContextProvider>
              <WalletProvider>
          {children}
          <ToastContainer
            position="bottom-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
              </WalletProvider>
        </Web3AuthContextProvider>
          </RainbowKitProvider>
      </QueryClientProvider>
      </WagmiProvider>
    </Auth0Provider>
  );
}


