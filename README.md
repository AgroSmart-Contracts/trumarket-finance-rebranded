# TruMarket Finance — Investor Dashboard

**TruMarket Finance** is the investor-facing app for [TruMarket](https://trumarket.tech): trade-finance programs, portfolio views, and the **TruMarket Liquidity Pool** on **Base** powered by a **Lagoon** vault.

The buyer & supplier side of TruMarket — deal creation, milestone tracking, supplier payouts — lives in the companion repository: [trumarket](https://github.com/AgroSmart-Contracts/trumarket).

- **Latest release:** [v2.1.0 — Pool Polish, Closed Deals, ICP Route Cleanup, APY Fix](./CHANGELOG.md)

---

## Overview

Investors can:

- Browse published trade-finance **programs (deals)** from the production MongoDB `deals` collection.
- Use **wallet-based** access (EVM on Base) for pool deposit and redeem flows.
- Track the **Lagoon vault**: TVL, linear **ALL APR (est.)** from subgraph **period summaries**, and NAV history from on-chain events.
- See **closed deals** alongside active ones, and pending settlements from Lagoon's async deposit/redeem cycle.

---

## Tech stack

| Layer | Stack |
| ----- | ----- |
| App | Next.js 15, React 19, TypeScript |
| UI | Tailwind CSS, Radix UI, Lucide, Phosphor Icons |
| Data | MongoDB (published deals, deal logs) — read server-side only |
| EVM | wagmi, viem, RainbowKit, ethers |
| Pool | [@lagoon-protocol/v0-core](https://www.npmjs.com/package/@lagoon-protocol/v0-core), [@lagoon-protocol/v0-viem](https://www.npmjs.com/package/@lagoon-protocol/v0-viem) |
| Auth | Auth0 (email / social), Web3Auth (SFA + PnP) |

---

## Lagoon (liquidity pool)

The pool UI reads vault state over **RPC** (Base) and **ALL APR (est.)** from a **Lagoon subgraph** (`periodSummaries`), aligned with Lagoon's linear net APR over the oldest → latest **completed** period.

| Variable | Purpose |
| -------- | ------- |
| `NEXT_PUBLIC_LAGOON_VAULT_ADDRESS` | Lagoon vault contract on Base |
| `NEXT_PUBLIC_LAGOON_SUBGRAPH_URL` | GraphQL endpoint for `periodSummaries` (and overrides) |
| `NEXT_PUBLIC_THEGRAPH_URLS` | Optional JSON map `{"8453":"https://…"}` if you prefer per-chain URLs |
| `NEXT_PUBLIC_LAGOON_APR_DEBUG` | Set to `true` to log APR inputs in the browser console |

Other chain / RPC variables (`NEXT_PUBLIC_BLOCKCHAIN_*`, investment token, etc.) should match your Base deployment.

---

## Environment variables

The app deliberately splits its configuration into **server-only** values (never inlined into the browser bundle) and **public** values (the `NEXT_PUBLIC_*` ones above and below).

### Server-only — MUST NOT be prefixed `NEXT_PUBLIC_`

| Variable | Used by |
| -------- | ------- |
| `DATABASE_URL` | `serverConfig.ts` → MongoDB connection string used by `deployedDataService` |
| `AUTH0_CLIENT_SECRET` | `authService.ts` (server-side OTP / JWT endpoints only) |
| `CIRCLE_API_KEY` | `circleMint.ts` (must be called through server routes; see "Known limitations" below) |
| `CIRCLE_API_BASE_URL` | Optional override for the Circle API base URL |

### Public (safe in the browser)

| Variable | Used by |
| -------- | ------- |
| `NEXT_PUBLIC_BLOCKCHAIN_CHAIN_ID`, `NEXT_PUBLIC_BLOCKCHAIN_NAME`, `NEXT_PUBLIC_BLOCKCHAIN_RPC_URL`, `NEXT_PUBLIC_BASE_RPC_URL`, `NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL`, `NEXT_PUBLIC_SEPOLIA_RPC_URL`, `NEXT_PUBLIC_BLOCKCHAIN_EXPLORER`, `NEXT_PUBLIC_BLOCKCHAIN_TICKER`, `NEXT_PUBLIC_BLOCKCHAIN_TICKER_NAME`, `NEXT_PUBLIC_EVM_CHAIN_ID` | Chain config |
| `NEXT_PUBLIC_SAFE_CONTRACT_ADDRESS`, `NEXT_PUBLIC_DEALS_MANAGER_ADDRESS`, `NEXT_PUBLIC_INVESTMENT_TOKEN_CONTRACT_ADDRESS`, `NEXT_PUBLIC_INVESTMENT_TOKEN_DECIMALS`, `NEXT_PUBLIC_INVESTMENT_TOKEN_SYMBOL` | On-chain addresses + token metadata |
| `NEXT_PUBLIC_AUTH0_API_URL`, `NEXT_PUBLIC_AUTH0_BASE_URL`, `NEXT_PUBLIC_AUTH0_CLIENT_ID`, `NEXT_PUBLIC_AUTH0_CLIENT_ID_SOCIAL` | Auth0 (public client config — **not** the secret) |
| `NEXT_PUBLIC_WEB3_AUTH_CLIENT_ID`, `NEXT_PUBLIC_WEB3AUTH_CONNECTION_ID`, `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`, `NEXT_PUBLIC_PROJECT_ID` | Web3Auth + WalletConnect |
| `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_API_URL` | Frontend ↔ backend URLs |

> **Anything containing a credential, API secret, or database connection MUST be a plain (non-`NEXT_PUBLIC_`) env var.** Next.js inlines `NEXT_PUBLIC_*` values into the production client bundle.

---

## Prerequisites

- Node.js 20+ (recommended)
- npm
- A reachable MongoDB URI (set as `DATABASE_URL`)

---

## Getting started

```bash
npm install
```

Create `.env.local` (or extend `.env`) with at least:

- `DATABASE_URL` and the Lagoon variables above
- Auth0 / Web3Auth credentials as required by your deployment

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## API routes

| Method | Path | Description |
| ------ | ---- | ----------- |
| `GET` | `/api/deals` | List published deals (`isPublished: true`) from MongoDB |
| `GET` | `/api/deals/[id]` | Single deal by Mongo `_id` string |
| `GET` | `/api/deals/[id]/activities` | Deal logs for a numeric `dealId` (legacy shape; `id` must parse as integer) |
| `GET` / `POST` | `/api/deal-logs` | Deal log utilities |
| `POST` | `/api/auth/login`, `/api/auth/signup` | Auth |
| `POST` | `/api/request-otp`, `/api/verify` | OTP request / verification (Auth0 passwordless) |

The legacy `/api/icp/shipments/*` routes were removed in v2.1.0 — use `/api/deals/*` instead.

---

## Project layout

```
src/
├── app/                 # Next.js App Router (pages + api routes)
├── components/          # UI (pool/, deals/, profile/, ui/, …)
├── config/              # Server-only configuration
├── context/             # React context (wallet, Web3Auth, Lagoon vault)
├── hooks/               # Client hooks (Lagoon, published deals, ownership, …)
├── integrations/lagoon/ # Subgraph fetch, APR math, constants, queries
├── lib/                 # ABIs, blockchain client, helpers, wagmi config
├── services/            # MongoDB (deployedDataService, dealLogService), Auth0, Circle
└── types/               # Shared TypeScript types
```

---

## Scripts

| Command | Description |
| ------- | ----------- |
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Production build |
| `npm start` | Start production server |

---

## Changelog

Full history of architectural and behavioural changes, organised by semver-classified version ranges, lives in [`CHANGELOG.md`](./CHANGELOG.md).

Highlights:

- **v2.1.0 — Pool Polish, Closed Deals, ICP Route Cleanup, APY Fix (Apr–May 2026)** — closed deals shown alongside active ones, pending settlements surfaced, APY formula refined, legacy `/api/icp/shipments/*` routes removed.
- **v2.0.0 — Shared Liquidity Pool: Lagoon Vault Replaces Per-Deal Investing (Apr 2026)** — investor capital model rebuilt around a single Lagoon-backed pool on Base; per-deal vaults retired from the deposit/withdraw path.
- **v1.5.0 — Wagmi / viem / RainbowKit + On-chain Wallet Flows (Feb 2026)** — Circle on-chain rail deactivated in favour of native wallet-driven deposits and withdrawals.

---

## Known limitations

- **Circle balance display.** `CircleMintService` is currently imported from a client component (`profile/page.tsx`) but reads its key from a non-public `CIRCLE_API_KEY` env var. This means the call fails on the client and the balance shows `0`. To restore the feature, add server-side proxy routes (e.g. `/api/circle/balance`) and call those from the client. Do **not** re-prefix the Circle key with `NEXT_PUBLIC_`.

---

## Learn more

- [TruMarket](https://trumarket.tech)
- [Lagoon documentation](https://docs.lagoon.finance/)
- [TruMarket Buyer & Supplier Platform repo](https://github.com/AgroSmart-Contracts/trumarket)

---

## Contact

**admin@trumarket.tech** · [https://trumarket.tech](https://trumarket.tech)
