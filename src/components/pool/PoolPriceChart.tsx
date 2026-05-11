'use client';

import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatUnits } from 'viem';
import { poolAccentLabelClass, poolDarkPanelClass, poolMutedOnDark } from '@/components/pool/poolTheme';
import type { PoolPricePoint } from '@/integrations/lagoon/lagoonTypes';
import { cn } from '@/lib/utils';

type TimeRange = 'all' | '30d' | '7d';

function labelForRange(ts: number, range: TimeRange): string {
  const d = new Date(ts);
  if (range === 'all') {
    return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function filterByRange(history: PoolPricePoint[], range: TimeRange): PoolPricePoint[] {
  if (range === 'all') return history;
  const now = Date.now();
  const windowMs = range === '7d' ? 7 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;
  return history.filter((p) => p.timestampMs >= now - windowMs);
}

function buildFallbackSeries(endPrice: number, range: TimeRange): { label: string; price: number }[] {
  if (!Number.isFinite(endPrice) || endPrice <= 0) return [{ label: '—', price: 0 }];
  const now = Date.now();
  const backMs = range === '7d' ? 6 * 24 * 60 * 60 * 1000 : range === '30d' ? 27 * 24 * 60 * 60 * 1000 : 180 * 24 * 60 * 60 * 1000;
  const prev = now - backMs;
  return [
    { label: labelForRange(prev, range), price: endPrice },
    { label: labelForRange(now, range), price: endPrice },
  ];
}

interface PoolPriceChartProps {
  vaultSymbol: string;
  underlyingSymbol: string;
  /** Raw onchain TVL: total assets in the vault */
  totalAssetsRaw: bigint;
  assetDecimals: number;
  history?: PoolPricePoint[];
}

const CHART_LINE = '#4E8C37';
const CHART_FILL_ID = 'tmPoolPpsFill';

export function PoolPriceChart({
  vaultSymbol,
  underlyingSymbol,
  totalAssetsRaw,
  assetDecimals,
  history = [],
}: PoolPriceChartProps) {
  const [range, setRange] = useState<TimeRange>('all');

  const latestTvl = useMemo(() => {
    try {
      return Number(formatUnits(totalAssetsRaw, assetDecimals));
    } catch {
      return 0;
    }
  }, [totalAssetsRaw, assetDecimals]);

  const data = useMemo(() => {
    const withCurrent = [...history];
    if (Number.isFinite(latestTvl) && latestTvl > 0) {
      withCurrent.push({ timestampMs: Date.now(), price: latestTvl });
    }
    const sorted = withCurrent
      .filter((p) => Number.isFinite(p.price) && p.price > 0)
      .sort((a, b) => a.timestampMs - b.timestampMs);
    const ranged = filterByRange(sorted, range);
    if (ranged.length === 0) return buildFallbackSeries(latestTvl, range);
    const deduped = ranged.filter(
      (p, idx, arr) =>
        idx === 0 ||
        p.timestampMs !== arr[idx - 1].timestampMs ||
        p.price !== arr[idx - 1].price,
    );
    if (deduped.length === 1) return buildFallbackSeries(latestTvl, range);
    return deduped.map((p) => ({
      label: labelForRange(p.timestampMs, range),
      price: p.price,
    }));
  }, [latestTvl, history, range]);

  const formattedTvl = useMemo(() => {
    try {
      return Number(formatUnits(totalAssetsRaw, assetDecimals)).toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
    } catch {
      return '0';
    }
  }, [totalAssetsRaw, assetDecimals]);

  const approxUsd = underlyingSymbol === 'USDC' || underlyingSymbol === 'USDT' ? `$${formattedTvl}` : null;

  return (
    <div className={cn(poolDarkPanelClass, 'p-6')}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <h2 className="text-base font-semibold text-[#0F172B]">Chart</h2>
        <div className="flex flex-wrap gap-2">
          <select
            aria-label="Chart metric"
            disabled
            className="cursor-not-allowed rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-xs font-medium text-[#64748B] opacity-90"
            value="tvl"
          >
            <option value="tvl">TVL</option>
          </select>
          <select
            aria-label="Time range"
            className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-xs font-medium text-[#0F172B]"
            value={range}
            onChange={(e) => setRange(e.target.value as TimeRange)}
          >
            <option value="all">All</option>
            <option value="30d">30D</option>
            <option value="7d">7D</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-3 border-b border-[#F1F5F9] pb-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ECFDF5] text-xs font-bold text-[#4E8C37]">
          {underlyingSymbol.slice(0, 2)}
        </div>
        <div>
          <p className={poolAccentLabelClass}>{vaultSymbol} TVL</p>
          <p className="text-lg font-semibold tabular-nums text-[#0F172B]">
            {formattedTvl} {underlyingSymbol}
          </p>
          {approxUsd && <p className="text-sm text-[#64748B]">{approxUsd}</p>}
        </div>
      </div>

      <p className={cn(poolMutedOnDark, 'mt-3')}>
        Chart points track settlement and valuation updates (`NewTotalAssetsUpdated`) plus the latest
        live vault total assets.
      </p>

      <div className="mt-4 h-[280px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={CHART_FILL_ID} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_LINE} stopOpacity={0.45} />
                <stop offset="100%" stopColor={CHART_LINE} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: '#64748B', fontSize: 11 }}
              axisLine={{ stroke: '#E2E8F0' }}
              tickLine={false}
              minTickGap={18}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={['auto', 'auto']}
              tick={{ fill: '#64748B', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={48}
              tickFormatter={(v) =>
                typeof v === 'number'
                  ? v.toLocaleString('en-US', { notation: 'compact', maximumFractionDigits: 2 })
                  : v
              }
            />
            <Tooltip
              contentStyle={{
                background: '#ffffff',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontSize: '12px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.08)',
              }}
              labelStyle={{ color: '#64748B' }}
              itemStyle={{ color: '#0F172B' }}
              formatter={(value: number | string) => [
                typeof value === 'number' ? value.toLocaleString('en-US', { maximumFractionDigits: 2 }) : value,
                underlyingSymbol,
              ]}
            />
            <Area
              type="stepAfter"
              dataKey="price"
              stroke={CHART_LINE}
              strokeWidth={2}
              fill={`url(#${CHART_FILL_ID})`}
              dot={false}
              activeDot={{ r: 4, fill: CHART_LINE }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
