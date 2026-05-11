# TruMarket Finance — Investor Dashboard Changelog

Generated from the `commit-range-documentation` skill. Each entry covers the git range between labelled version points, with a semver classification, blast radius, and change narrative.

---

## v0.0.0 — Baseline (Sep 2025)

**Commit**: `0efdf3a` · 2025-09-23  
**State**: Blank Create Next App scaffold. A single default Next.js page, no product logic whatsoever.

This is the reference point for everything that follows.

---

## v1.0.0 — Platform Bootstrap: MongoDB, ICP API Routes, Deal Data (Sep 2025)

**Range**: `0efdf3a` → `be1ad8e`  
**Date**: 2025-09-26  
**Semver classification**: **MAJOR** — from blank scaffold to a working data-fetching investor dashboard  
**Blast radius**: 31 files, +4,587 / -1,811 lines

### What changed

#### New product surface
- **Next.js app converted from blank scaffold** to a functional investor dashboard (`dc99528`). Pages scaffold, layout, and global CSS replaced with TruMarket-specific structure.
- **MongoDB data layer**: `mongodb.ts`, `DealLog.ts`, `deployedDataService.ts`, and `dealLogService.ts` — deals and deal logs read directly from the production MongoDB `prod.deals` collection.
- **ICP-compatible API routes added** (later replaced): `route.ts` handlers under `/api/icp/shipments/` — these served deal data via Next.js server-side handlers.
- **Core UI components**: `FinanceSection.tsx`, `RecentActivity.tsx`, `Scaffold.tsx`, `ShipmentDetails.tsx`, `ShipmentsList.tsx` — investor dashboard shell with deal list and activity feed.
- **ICP shipments hook**: `useICPShipments.ts`.
- **Shipment detail page**: shipment `[id]` page added.
- **Deal log API route**: deal-logs route added.
- `dateUtils.ts`, `static.tsx` — shared formatting and static data utilities.
- `index.ts` — full TypeScript type definitions for deals, logs, and API responses.
- Brand assets: `logo.svg`, `favicon.ico`.

#### Data source
- ICP was **referenced in the route naming** (`/api/icp/`) but data was already being served from MongoDB (`deployedDataService.ts` uses Mongoose). The "ICP" naming was a legacy holdover, not a live ICP canister connection.

### Migration (from blank scaffold)
- Requires a MongoDB connection string configured in the environment.
- MongoDB database: `prod`, collection: `deals`, filtered on `isPublished: true`.

### Notable commits
`dc99528` first commit: convert trumarket-finance to nextjs one  
`7ec9ceb` replace icp data with mongodb data  
`36a7a71` clean the code, remove redundant types  
`3cca6f9` / `be1ad8e` improve recent activity UI

---

## v1.1.0 — Investor Deal Dashboard + Blockchain ABIs + Responsive Layout (Oct–Nov 2025)

**Range**: `be1ad8e` → `d2301fc`  
**Date**: 2025-11-10  
**Semver classification**: **MINOR** — new investor-facing deal dashboard components, blockchain client, ABI integration, responsive design  
**Blast radius**: 41 files, +10,187 / -1,761 lines

### What changed

#### New features
- **Deal list components**: `DealCard.tsx`, `DealListItem.tsx`, `DealFilters.tsx`, `DealsInvestorDashboard.tsx` — investor-facing deal browsing with filters and card/list views.
- **Liquidity pool deposit UI**: `LiquidityPoolDeposit.tsx` — deposit form component (amount input, validation, min deposit, max button). Wired to a generic `invest()` callback.
- **Blockchain client**: `BlockchainClient.ts` — EVM provider abstraction for reading on-chain data.
- **Contract ABIs added**: `DealVault.abi.ts`, `DealsManager.abi.ts`, `ERC20.abi.ts` — enables direct contract reads from the frontend.
- **New hooks**: `useDealOwnership.ts` (checks whether connected wallet owns an NFT deal), `useWallet.ts` (wallet state abstraction), `useConfig.ts`.
- **Config API route**: config route added — serves frontend configuration from server env.
- **Shared UI primitives** (shadcn-based): `badge.tsx`, `button.tsx`, `card.tsx`, `dialog.tsx`, `select.tsx`.
- **Responsive layout**: full mobile/tablet CSS pass (`d2301fc`).

#### Design
- Main page design updated (`ccfcbe2`, `e3016b9`, `0af6c06`).

### Migration
- Blockchain contract addresses and chain ID must be configured in the environment.
- `config.ts` renamed / refactored to `serverConfig.ts` (some types moved out).

### Notable commits
`0accc30` update abis for the contracts, and fix disconnect button  
`d2301fc` make design responsive  
`be1ad8e` update recent activity UI

---

## v1.2.0 — APY Calculation, Rebranding, Sensitive Data Removal (Nov–Dec 2025)

**Range**: `d2301fc` → `5eb0937`  
**Date**: 2025-12-11  
**Semver classification**: **MINOR** — new financial calculation logic, full rebranding, security cleanup  
**Blast radius**: 23 files, +2,488 / -1,508 lines

### What changed

#### Financial logic
- **APY calculation updated** (`f85536a`) — `financialCalculations.ts` revised; APY/yield formula corrected.
- **Balance error fixes** (`15716a1`) — display errors for USDC balance and formatted numbers resolved; primary colour theme updated.
- **ABIs refreshed** (`0accc30`) — `DealVault.abi.ts` and `DealsManager.abi.ts` synced with latest deployed contracts.

#### Branding and UI
- **Full rebranding completed** (`a6fa0f9`) — project renamed/reskinned to TruMarket Finance investor identity; global CSS and layout updated.
- **Project cleaned up** (`4af5604`) — redundant files, unused imports, stale config removed.
- `dropdown-menu.tsx` UI primitive added.
- Vercel env helper script added for environment propagation (later removed).

#### Security
- **Sensitive data removed from repo** (`5eb0937`) — credentials and private config that had been accidentally committed were purged. `serverConfig.ts` updated to read exclusively from environment variables.
- Config API route removed (was exposing server config unnecessarily).
- `types.ts` config types file and `useConfig.ts` hook removed as part of config refactor.

### Migration
- Audit all config: remove any hardcoded values that previously lived in source. All config must now come from environment variables.

### Notable commits
`f85536a` update APY calculation  
`15716a1` fix balance errors and update numbers and primary color theme  
`5eb0937` remove sensitive data  
`a6fa0f9` finish rebranding  
`4af5604` clean up project a bit

---

## v1.3.0 — Deal Detail UI Overhaul + Position & Yield Cards (Dec 2025)

**Range**: `5eb0937` → `c4a5260`  
**Date**: 2025-12-17  
**Semver classification**: **MINOR** — major deal detail component library, position/yield display, dev/prod env split  
**Blast radius**: 52 files, +3,873 / -1,781 lines

### What changed

#### New UI components
- **Deal detail cards**: `DealOverviewCard`, `FinancialInformationCard`, `InvestmentAmountCard`, `InvestmentDetailsCard`, `InvestmentSummaryCard`, `SmartContractCard`, `YourInfoCard` — full breakdown of a deal's financial, contractual, and investment details for the investor view.
- **Investment flow screens**: `InvestmentReview.tsx`, `InvestmentSuccess.tsx` — step-through investment confirmation UI.
- **Shared UI primitives** (large new set): `CurrencyInput`, `DealTermRow`, `IconContainer`, `InfoBox`, `InfoCard`, `InfoRow`, `InvestmentInfoDisplay`, `MetricCard`, `MetricDisplay`, `ProgressBar`, `QuickAmountButtons`, `RiskBadge`, `SectionHeader`, `Sparkline`, `StatusBadge`, `StepIndicator`.
- **APY and risk calculations updated** (`46af642`) — risk score logic refined; info icon tooltip added next to risk display.
- **Position and yield tracking added** (`ac03be0`) — `YourInfoCard` shows connected wallet's current position value and yield earned.
- **"Your info" design reworked** (`30bbee7`).
- **Development mode toggle** (`9b16242`) — a dev-mode flag can be configured in the environment to enable dev-only UI features.

#### Infrastructure
- **Prod vs test env fix** (`c4a5260`) — environment detection logic corrected; staging no longer falls through to production API endpoints.

#### Removed
- `DealFilters.tsx` — removed (filters consolidated into `DealsInvestorDashboard`).
- `FinanceSection.tsx` — removed (replaced by deal detail card components).
- `RecentActivity.tsx` — removed (activity is now inline in pool/deal views).

### Migration
- No breaking API or schema changes.

### Notable commits
`46af642` update apy and risk calculations  
`ac03be0` add position and yield  
`30bbee7` change design of your info  
`9b16242` add development mode as an option  
`c4a5260` fix prod vs test env

---

## v1.4.0 — Auth Flow + Circle Mint API + Deposit/Withdraw Dialogs (Dec 2025–Jan 2026)

**Range**: `c4a5260` → `d96b356`  
**Date**: 2026-01-01  
**Semver classification**: **MINOR** — full authentication system, Circle Mint Business API integration, profile deposit/withdraw UI  
**Blast radius**: 45 files, +11,907 / -5,030 lines

### What changed

#### Authentication (new)
- **Login page**: `login/page.tsx` — email + OTP verification flow.
- **Auth API routes**: login, signup, request-OTP, and verify routes added — server-side auth handlers.
- **Auth UI components**: `EmailInput.tsx`, `OTPInputWrapper.tsx`, `VerificationInput.tsx`.
- **Auth service**: `authService.ts` — manages login state, token storage, session.
- **Web3Auth context**: `web3-auth-context.tsx` — Web3Auth wallet lifecycle management.
- **Profile page**: `profile/page.tsx` — investor profile with wallet info and investment position.

#### Circle Mint integration (new)
- **`circleMint.ts`** — full Circle Business Account API client: wire deposit addresses (create / list), wire bank accounts (create / list / get instructions), balance query, payout to bank (wire), transfer to verified blockchain wallet, idempotency key generation.
- Requires a Circle API key and base URL to be configured in the environment.

#### Deposit/withdraw UI (new)
- **`DepositDialog.tsx`** and **`WithdrawDialog.tsx`** — modal dialogs for investor deposits and withdrawals. Initially wired to Circle Mint API calls (later replaced in v1.5.0).
- **`web3-auth-context.tsx`** manages wallet connection state for the dialogs.

#### Other
- `useTruMarketDeal.ts` — hook for reading a specific deal's on-chain state.
- `TruMarketDeal.abi.ts` — ABI for direct deal contract reads.
- `chain-configs.ts`, `evm.web3.ts` — EVM chain configuration.
- `clipboard.ts`, `toast.ts`, `helpers.ts` — utility additions.
- `Providers.tsx` — global provider wrapper (QueryClient, WalletConnect).
- `LiquidityPoolDeposit.tsx` removed (replaced by `DepositDialog`).

### Migration
- Circle API credentials must be configured in the environment (API key and base URL).
- Session secret must be configured in the environment for auth.

### Notable commits
`abbf6ed` add circle on and off ramp integration  
`d96b356` fix the build and install issues  
`c462243` first commit (auth branch baseline)

---

## v1.5.0 — Circle On-chain Flow Deactivated, Wagmi/viem/RainbowKit + On-chain Wallet Flows (Feb 2026)

**Range**: `d96b356` → `b3c2a9c`  
**Date**: 2026-02-07  
**Semver classification**: **MINOR** — Circle on-chain deposit/withdraw deactivated and replaced with direct blockchain wallet interactions via Wagmi + viem  
**Blast radius**: 23 files, +1,082 / -1,665 lines (more deletions than additions)

### What changed

#### Breaking pivot: Circle on-chain deposit/withdraw deactivated
- **`b3c2a9c` change deposit and withdrawal and remove circle usage** — `DepositDialog` and `WithdrawDialog` no longer call Circle Mint API for on-chain operations. The Circle wallet deposit/withdraw logic was **commented out** and replaced with direct EVM contract calls. The underlying `circleMint.ts` service remains in the codebase for the fiat wire use case.
- `circleDepositFlows.ts` and `circleWithdrawFlows.ts` **added** as high-level wrappers around `circleMint.ts` — built but **not yet wired into any UI component** (kept for potential future fiat rail activation).
- `wallet-context.tsx` added — new wallet state context separate from Web3Auth context.
- `useWeb3Connection.ts` added — hook for managing wallet connect / disconnect lifecycle.
- `middleware.ts` added — Next.js middleware for route protection (auth guard on protected pages).
- Number formatting: decimal removed from USDC display (`6890d5b`), yield decimal updated (`fb4210d`).
- `formatters.ts` updated with new number format helpers.

#### Dependencies added
- `wagmi` ^2, `viem` ^2, `@rainbow-me/rainbowkit` ^2, WalletConnect modal and sign-client — direct blockchain wallet integration stack.
- `wagmi-config.ts` — Wagmi chain + connector configuration (added in next bucket but deps here).

#### Deals data
- Fixed data replaced with live MongoDB deal data (`4cd5fdd`).
- Yield calc updated (`f7dd8e0`), download button improved (`dbdb0bc`, `b488689`).

### Migration
- Circle on-chain deposit/withdraw is deactivated. Any UI code invoking Circle for on-chain flows should be removed.
- WalletConnect project ID must be configured in the environment.

### Notable commits
`b3c2a9c` change deposit and withdrawal and remove circle usage  
`6890d5b` remove decimal and change number formatter  
`5df3894` update deposit and withdraw via blockchain wallet methods  
`1a9e28f` add wagmi viem and rainbow package  
`4cd5fdd` update fixed data with deals data

---

## v2.0.0 — Shared Liquidity Pool: Lagoon Vault Replaces Per-Deal Investing (Apr 2026)

**Range**: `b3c2a9c` → `34692a4`  
**Date**: 2026-04-06  
**Semver classification**: **MAJOR** — fundamental change to the investment model: investors no longer fund individual deals; they deposit into a single shared liquidity pool  
**Blast radius**: 57 files, +18,033 / -4,002 lines

### What changed

#### Core investment model change (product)

**Before**: Investors selected a specific agricultural deal and deposited USDC directly into that deal's individual vault (`DealVault`, one per deal). Returns were tied to a single deal's outcome.

**After**: Investors deposit into a single shared **TruMarket Liquidity Pool** powered by a [Lagoon Protocol](https://lagoon.finance) vault on Base. TruMarket admins decide which deals to allocate pool capital to. Investors receive an average APY across all low-risk deals their capital has been used to fund — there is no longer a direct link between an investor's deposit and a specific deal. The pool model spreads risk and gives TruMarket control over deal selection and capital allocation.

This is a **fundamental change to how investor money flows through the platform**.

#### Lagoon Protocol integration (new)
- **`@lagoon-protocol/v0-core`** and **`@lagoon-protocol/v0-viem`** added as dependencies.
- **`constants.ts`** — vault address and chain detection (Base / Base Sepolia).
- **`lagoonActions.ts`** — on-chain write helpers: `requestDeposit`, `mint` (claim shares), `requestRedeem`, `withdraw`.
- **`lagoonQueries.ts`** — read helpers for vault state, user position, pending settlements.
- **`lagoonFormatters.ts`** — display formatting for Lagoon share/asset amounts.
- **`lagoonTypes.ts`** — TypeScript types for vault, user, price history, APR.
- **`lagoonAllApr.ts`** — linear net APR computed from on-chain subgraph `periodSummaries`.
- **`lagoon-vault-context.tsx`** — React context providing vault state, user position, APR, and loading/error states to the whole app.
- **Lagoon hooks**: `useLagoonVault.ts`, `useLagoonUser.ts`, `useLagoonMutations.ts`, `useLagoonActivity.ts`.
- **`wagmi-config.ts`** — Wagmi config with Base + Base Sepolia chains and RainbowKit connectors.
- **`parse-env-chain-id.ts`** — safe parsing of the chain ID from environment config.

#### Pool UI (new)
- **Pool route** (`/pool`) with sub-pages: overview, details, and activity feed.
- **Pool components**: `LiquidityPoolHome.tsx`, `PoolDepositRedeemPanel.tsx`, `PoolPositionSidebar.tsx`, `PoolPriceChart.tsx`, `PoolOverviewMain.tsx`, `PoolDetailsMain.tsx`, `PoolActivityMain.tsx`, `PoolFundedDealsContext.tsx`, `PoolVaultChrome.tsx`, `poolTheme.ts`.
- **`DepositDialog.tsx`** and **`WithdrawDialog.tsx`** updated to call Lagoon write actions.
- **`trumarket-buttons.tsx`** — branded button variants.

#### Other
- `financialCalculations.ts` and `formatters.ts` updated for Lagoon share/asset math.
- `Providers.tsx` updated to wrap app in `LagoonVaultProvider` and Wagmi context.

### Migration
- The Lagoon vault contract address must be configured in the environment.
- Subgraph URL for APR history must be configured in the environment.
- Target chain must be set to Base mainnet or Base Sepolia in the environment.
- Per-deal vault reads (`DealVault.abi.ts`) are superseded by Lagoon queries — old ABIs remain but are no longer the deposit/withdraw path.

### Notable commits
`34692a4` update design after integrating lagoon  
`b3c2a9c` change deposit and withdrawal (baseline for this range)  
`1a9e28f` add wagmi viem and rainbow package

---

## v2.1.0 — Pool Polish, Closed Deals, ICP Route Cleanup, APY Fix (Apr–May 2026)

**Range**: `34692a4` → `b712051`  
**Date**: 2026-05-05  
**Semver classification**: **MINOR** — pool UI additions, closed deal support, dead API routes removed, APY formula fix  
**Follows**: v2.0.0 (MAJOR)  
**Blast radius**: 41 files, +1,309 / -947 lines

### What changed

#### New features
- **Closed deals shown** (`c1cf543`) — `DealsInvestorDashboard` and related components now include deals in closed/completed status in the deal list.
- **`PoolBalanceRow.tsx`** — pool balance breakdown row component added to pool views.
- **`PoolPositionPendingSettlements.tsx`** — pending settlement amounts now shown in the position sidebar (Lagoon's async deposit/redeem cycle).
- **APY calculation formula updated** (`5936fcc`) — APY computation revised to be more accurate against Lagoon period summaries.
- Amount display updated to million-shorthand format (`c42c796`: `$X.Xm` style).

#### Cleanup
- **ICP-named API routes removed** — the `/api/icp/shipments/` directory was deleted and replaced by clean `/api/deals/` routes: deals list, deal by ID, and deal activities.
- Existing components updated to call `/api/deals/` instead of `/api/icp/shipments/`.
- `MetricCard.tsx` and `Sparkline.tsx` polished.
- Pool components (`PoolActivityMain`, `PoolOverviewMain`, `PoolPriceChart`, `PoolVaultChrome`) refined.

### Migration
- **Update any direct `/api/icp/shipments/` calls** — these routes are gone. Use `/api/deals/` instead.

### Notable commits
`c1cf543` add closed deals  
`807656f` Merge branch 'master' into feat/add_lagoon  
`c42c796` update million formatting  
`8830264` polished frontend a bit  
`5936fcc` update APY calculation formula  
`b712051` Merge pull request #2 from AgroSmart-Contracts/feat/add_lagoon

---

## Unreleased / What's next

- **Circle Mint fiat rail activation** — `circleDepositFlows.ts` and `circleWithdrawFlows.ts` are built and ready; not yet wired into any UI component.
- **Circle CCTP / Bridge Kit** — cross-chain USDC bridging to allow investors to deposit from chains other than Base.
- **Arc network deployment** — Arc is EVM-compatible; the Lagoon vault lives on Base, but the deal NFT contracts could be mirrored on Arc for grant milestone compliance.
- **`syncDealsLogs` job re-enablement** (commented out in `trumarket` API).

---

*Generated by the `commit-range-documentation` skill. Commit hashes reference the `trumarket-finance-rebranded copy` repository. Semver versions are retroactively assigned for documentation purposes — the repo does not use git tags.*
