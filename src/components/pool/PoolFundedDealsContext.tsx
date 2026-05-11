'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { DealDetails } from '@/types';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { formatCurrency } from '@/lib/formatters';
import { calculateRevenue } from '@/lib/financialCalculations';

interface PoolFundedDealsContextProps {
  deals: DealDetails[];
  loading: boolean;
}

export function PoolFundedDealsContext({ deals, loading }: PoolFundedDealsContextProps) {
  const [visibleCount, setVisibleCount] = useState(10);

  const closedDeals = useMemo(
    () =>
      deals
        .filter((d) => d.status === 'finished')
        .sort((a, b) => {
          const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return db - da;
        }),
    [deals],
  );
  const visibleDeals = closedDeals.slice(0, visibleCount);

  if (loading) {
    return (
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 text-sm text-[#62748E]">
        Loading programs…
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
      <SectionHeader className="mb-1">Closed deals</SectionHeader>
      <p className="mb-4 text-sm text-[#62748E]">
        {closedDeals.length} completed deal{closedDeals.length === 1 ? '' : 's'}
      </p>
      {closedDeals.length === 0 ? (
        <p className="text-sm text-[#62748E]">No completed deals yet.</p>
      ) : (
        <>
          <ul className="space-y-4">
            {visibleDeals.map((deal) => {
            const interestPaid = calculateRevenue(deal);
            return (
              <li key={deal.id}>
                <Link
                  href={`/shipments/${deal.id}`}
                  className="block rounded-lg border border-[#E2E8F0] bg-white p-5 transition-all duration-200 hover:border-[#4E8C37] hover:shadow-md"
                >
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:items-center">
                    <div className="md:col-span-5">
                      <p className="text-base font-semibold leading-snug text-[#0F172B]">{deal.name || 'Program'}</p>
                      <p className="mt-1 text-sm text-[#62748E]">
                        {deal.origin || '—'} → {deal.destination || '—'}
                      </p>
                    </div>

                    <div className="md:col-span-3 md:text-center">
                      <p className="text-sm text-[#62748E]">Total Loan Amount</p>
                      <p className="text-base font-semibold text-[#0F172B]">
                        {formatCurrency(deal.investmentAmount)}
                      </p>
                    </div>

                    <div className="md:col-span-2 md:text-center">
                      <p className="text-sm text-[#62748E]">Interest Paid</p>
                      <p className="text-base font-semibold text-[#4E8C37]">
                        {formatCurrency(interestPaid)}
                      </p>
                    </div>

                    <div className="md:col-span-2 md:text-right">
                      <p className="text-sm text-[#62748E]">Status</p>
                      <span className="mt-1 inline-flex rounded-full border border-[#4E8C37] bg-[#ECFDF5] px-3 py-1 text-xs font-medium text-[#3A6A28]">
                        Fully Repaid
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            );
            })}
          </ul>
          {visibleCount < closedDeals.length && (
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={() => setVisibleCount((c) => c + 10)}
                className="rounded-md border border-[#CAD5E2] bg-white px-4 py-2 text-sm font-medium text-[#314158] transition-colors hover:bg-[#F8FAFC]"
              >
                Load more deals
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
