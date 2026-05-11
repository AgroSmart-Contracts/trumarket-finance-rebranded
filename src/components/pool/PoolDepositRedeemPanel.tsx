'use client';

import { useMemo, useState } from 'react';
import type { Vault } from '@lagoon-protocol/v0-core';
import type { User as LagoonUser } from '@lagoon-protocol/v0-core';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { poolDarkPanelClass, poolMutedOnDark } from '@/components/pool/poolTheme';
import { cn } from '@/lib/utils';
import type { LagoonAsyncFlowStatus } from '@/integrations/lagoon/lagoonTypes';
import { useLagoonWalletAssetBalance } from '@/hooks/lagoon/useLagoonUser';
import { formatTokenAmount } from '@/integrations/lagoon/lagoonFormatters';
import { TruMarketPrimaryButton } from '@/components/ui/trumarket-buttons';
import { PoolBalanceRow } from '@/components/pool/PoolBalanceRow';

export interface PoolMutationsApi {
  requestDeposit: (amount: string, v: Vault) => Promise<void>;
  requestRedeem: (amount: string, v: Vault, shareDecimals: number) => Promise<void>;
  flowStatus: LagoonAsyncFlowStatus;
  flowMessage: string | null;
  resetFlow: () => void;
}

interface PoolDepositRedeemPanelProps {
  vault: Vault;
  underlyingSymbol: string;
  assetDecimals: number;
  shareDecimals: number;
  user: LagoonUser | undefined;
  userLoading: boolean;
  mutations: PoolMutationsApi;
}

export function PoolDepositRedeemPanel({
  vault,
  underlyingSymbol,
  assetDecimals,
  shareDecimals,
  user,
  userLoading,
  mutations,
}: PoolDepositRedeemPanelProps) {
  const { isConnected } = useAccount();
  const [tab, setTab] = useState<'deposit' | 'redeem'>('deposit');
  const [depositAmt, setDepositAmt] = useState('');
  const [redeemAmt, setRedeemAmt] = useState('');

  const { requestDeposit, requestRedeem, flowStatus, flowMessage, resetFlow } = mutations;

  const { data: walletBalance = BigInt(0) } = useLagoonWalletAssetBalance(vault.asset, isConnected);

  const depositParsed = useMemo((): { ready: true; assets: bigint } | { ready: false; reason: 'empty' | 'zero' | 'invalid' | 'insufficient' } => {
    const t = depositAmt.trim();
    if (!t) return { ready: false, reason: 'empty' };
    try {
      const assets = parseUnits(t, assetDecimals);
      if (assets <= BigInt(0)) return { ready: false, reason: 'zero' };
      if (assets > walletBalance) return { ready: false, reason: 'insufficient' };
      return { ready: true, assets };
    } catch {
      return { ready: false, reason: 'invalid' };
    }
  }, [depositAmt, assetDecimals, walletBalance]);

  /** Redeem amount is validated against pool share balance (`user.balance`). */
  const redeemParsed = useMemo(():
    | { ready: true; shares: bigint }
    | { ready: false; reason: 'empty' | 'zero' | 'invalid' | 'exceeds' | 'no_user' } => {
    if (!user) return { ready: false, reason: 'no_user' };
    const t = redeemAmt.trim();
    if (!t) return { ready: false, reason: 'empty' };
    try {
      const shares = parseUnits(t, shareDecimals);
      if (shares <= BigInt(0)) return { ready: false, reason: 'zero' };
      if (shares > user.balance) return { ready: false, reason: 'exceeds' };
      return { ready: true, shares };
    } catch {
      return { ready: false, reason: 'invalid' };
    }
  }, [redeemAmt, shareDecimals, user]);

  const busy = flowStatus === 'pending_wallet' || flowStatus === 'pending_confirm';
  const showInlineFlowMessage =
    !!flowMessage && flowMessage.trim().toLowerCase() !== 'transaction was rejected by the user';

  const setDepositMax = () => {
    if (walletBalance <= BigInt(0)) return;
    setDepositAmt(formatUnits(walletBalance, assetDecimals));
  };

  const setRedeemMax = () => {
    if (!user || user.balance <= BigInt(0)) return;
    setRedeemAmt(formatUnits(user.balance, shareDecimals));
  };

  const depositPrimaryLabel = busy
    ? 'Confirm in wallet…'
    : !depositParsed.ready && depositParsed.reason === 'insufficient'
      ? 'Insufficient token balance'
      : !depositParsed.ready
        ? 'Enter an amount'
        : 'Deposit';

  const redeemPrimaryLabel = busy
    ? 'Confirm in wallet…'
    : user && user.balance <= BigInt(0)
      ? 'No pool shares'
      : !redeemParsed.ready && redeemParsed.reason === 'exceeds'
        ? 'Exceeds pool shares'
        : !redeemParsed.ready
          ? 'Enter an amount'
          : 'Request redemption';

  return (
    <div className={cn(poolDarkPanelClass, 'p-5')}>
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-[#0F172B]">Transact</h3>
        {!isConnected && <ConnectButton chainStatus="icon" showBalance={false} />}
      </div>

      {!isConnected ? (
        <p className={poolMutedOnDark}>
          Connect on <span className="font-medium text-[#4E8C37]">Base</span> to deposit or redeem pool
          shares.
        </p>
      ) : (
        <>
          <Tabs value={tab} onValueChange={(v) => setTab(v as 'deposit' | 'redeem')}>
            <TabsList className="grid w-full grid-cols-2 gap-1 rounded-lg bg-[#F1F5F9] p-1">
              <TabsTrigger
                value="deposit"
                className="rounded-md text-[#62748E] data-[state=active]:bg-[#4E8C37] data-[state=active]:text-white data-[state=active]:shadow-sm"
              >
                Deposit
              </TabsTrigger>
              <TabsTrigger
                value="redeem"
                className="rounded-md text-[#62748E] data-[state=active]:bg-[#4E8C37] data-[state=active]:text-white data-[state=active]:shadow-sm"
              >
                Redeem
              </TabsTrigger>
            </TabsList>

            <TabsContent value="deposit" className="mt-5 space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs uppercase tracking-wide text-[#94A3B8]">
                  <span>Deposit</span>
                  <span>{underlyingSymbol}</span>
                </div>
                <div className="mt-2 flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-3">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={depositAmt}
                    onChange={(e) => setDepositAmt(e.target.value)}
                    placeholder="0"
                    className="min-w-0 flex-1 bg-transparent text-2xl font-semibold text-[#0F172B] outline-none placeholder:text-[#94A3B8]"
                  />
                </div>
                <PoolBalanceRow
                  amountLabel={`${formatTokenAmount(walletBalance, assetDecimals)} ${underlyingSymbol}`}
                  onMaxClick={setDepositMax}
                />
              </div>
              <TruMarketPrimaryButton
                disabled={!depositParsed.ready || busy || userLoading}
                onClick={() => requestDeposit(depositAmt, vault)}
              >
                {depositPrimaryLabel}
              </TruMarketPrimaryButton>
            </TabsContent>

            <TabsContent value="redeem" className="mt-5 space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs uppercase tracking-wide text-[#94A3B8]">
                  <span>Redeem</span>
                  <span>{vault.symbol}</span>
                </div>
                <div className="mt-2 flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-3">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={redeemAmt}
                    onChange={(e) => setRedeemAmt(e.target.value)}
                    placeholder="0"
                    className="min-w-0 flex-1 bg-transparent text-2xl font-semibold text-[#0F172B] outline-none placeholder:text-[#94A3B8]"
                  />
                </div>
                <PoolBalanceRow
                  amountLabel={
                    user ? `${formatTokenAmount(user.balance, shareDecimals)} ${vault.symbol}` : '—'
                  }
                  onMaxClick={setRedeemMax}
                  maxDisabled={!user || user.balance <= BigInt(0)}
                />
              </div>
              <TruMarketPrimaryButton
                disabled={!redeemParsed.ready || busy || userLoading}
                onClick={() => requestRedeem(redeemAmt, vault, shareDecimals)}
              >
                {redeemPrimaryLabel}
              </TruMarketPrimaryButton>
            </TabsContent>
          </Tabs>

          {showInlineFlowMessage && (
            <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-2 py-2 text-xs text-red-800">
              {flowMessage}
            </p>
          )}
          {flowStatus === 'success' && (
            <p className="mt-3 text-xs text-[#4E8C37]">
              Confirmed.
              <button type="button" className="ml-2 underline" onClick={() => resetFlow()}>
                Dismiss
              </button>
            </p>
          )}
        </>
      )}
    </div>
  );
}
