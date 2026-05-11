import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { createConfig, http } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { base, baseSepolia, sepolia } from 'wagmi/chains';
import type { Config } from 'wagmi';
import { parseEnvChainId } from '@/lib/parse-env-chain-id';

const chainId = parseEnvChainId(process.env.NEXT_PUBLIC_BLOCKCHAIN_CHAIN_ID);

/**
 * Bind each chain's transport to an RPC that actually serves that network.
 * If `.env.local` points `NEXT_PUBLIC_BLOCKCHAIN_RPC_URL` at e.g. Ethereum Sepolia while
 * `getChain()` fell back to Base, we would read Base contract state from the wrong chain —
 * storage slots decode as zero and Lagoon's `protocolRate` call targets address(0).
 */
function baseHttpTransport() {
  const url =
    process.env.NEXT_PUBLIC_BASE_RPC_URL?.trim() ||
    (chainId === base.id ? process.env.NEXT_PUBLIC_BLOCKCHAIN_RPC_URL?.trim() : undefined);
  return url
    ? http(url, { retryCount: 3, retryDelay: 400 })
    : http(undefined, { retryCount: 2, retryDelay: 600 });
}

function baseSepoliaHttpTransport() {
  const url =
    process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL?.trim() ||
    (chainId === baseSepolia.id ? process.env.NEXT_PUBLIC_BLOCKCHAIN_RPC_URL?.trim() : undefined);
  return url
    ? http(url, { retryCount: 3, retryDelay: 400 })
    : http(undefined, { retryCount: 2, retryDelay: 600 });
}

function sepoliaHttpTransport() {
  const url =
    process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL?.trim() ||
    (chainId === sepolia.id ? process.env.NEXT_PUBLIC_BLOCKCHAIN_RPC_URL?.trim() : undefined);
  return url
    ? http(url, { retryCount: 3, retryDelay: 400 })
    : http(undefined, { retryCount: 2, retryDelay: 600 });
}

const getChain = () => {
  if (chainId === base.id) return base;
  if (chainId === baseSepolia.id) return baseSepolia;
  if (chainId === sepolia.id) return sepolia;
  return base;
};

const chain = getChain();

/**
 * During Next.js / Turbopack SSR, WalletConnect initializes and touches `indexedDB`,
 * which does not exist in Node → unhandled `ReferenceError: indexedDB is not defined`.
 *
 * Use a minimal wagmi config on the server (injected only, no WalletConnect).
 * In the browser, use RainbowKit's full config (WalletConnect + indexedDB).
 */
function createServerWagmiConfig(): Config {
  return createConfig({
    chains: [chain],
    connectors: [injected()],
    transports: {
      [base.id]: baseHttpTransport(),
      [baseSepolia.id]: baseSepoliaHttpTransport(),
      [sepolia.id]: sepoliaHttpTransport(),
    },
    ssr: true,
  }) as Config;
}

function createBrowserWagmiConfig(): Config {
  return getDefaultConfig({
    appName: 'TruMarket Finance',
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
    chains: [chain],
    ssr: true,
    transports: {
      [base.id]: baseHttpTransport(),
      [baseSepolia.id]: baseSepoliaHttpTransport(),
      [sepolia.id]: sepoliaHttpTransport(),
    },
  });
}

export const config: Config =
  typeof window === 'undefined' ? createServerWagmiConfig() : createBrowserWagmiConfig();
