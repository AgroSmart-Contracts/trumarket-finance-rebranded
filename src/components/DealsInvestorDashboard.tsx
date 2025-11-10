'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DealCard from '@/components/DealCard';
import DealListItem from '@/components/DealListItem';
import DealFilters, { FilterOptions } from '@/components/DealFilters';
import { useICPShipments } from '@/hooks/useICPShipments';
import { DealDetails } from '@/types';
import { calculatePortfolioMetrics, calculateAPY, calculateRevenue } from '@/lib/financialCalculations';

export default function DealsInvestorDashboard() {
  const router = useRouter();
  const { shipments: deals, loading } = useICPShipments();

  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'in-progress' | 'completed'>('active');
  const [filters, setFilters] = useState<FilterOptions>({
    origins: [],
    destinations: [],
    statuses: [],
    transports: [],
    minInvestment: null,
    risks: [],
    minAPY: null,
    maxAPY: null,
  });

  const applyFilters = (dealsToFilter: DealDetails[]): DealDetails[] => {
    return dealsToFilter.filter((deal) => {
      // Status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'active' && !(deal.status === 'proposal' || (deal.status === 'confirmed' && deal.currentMilestone === 0))) {
          return false;
        }
        if (statusFilter === 'in-progress' && !(deal.status === 'confirmed' && deal.currentMilestone > 0)) {
          return false;
        }
        if (statusFilter === 'completed' && deal.status !== 'finished') {
          return false;
        }
      }

      // Origin filter
      if (filters.origins.length > 0 && !filters.origins.includes(deal.origin)) {
        return false;
      }

      // Destination filter
      if (filters.destinations.length > 0 && !filters.destinations.includes(deal.destination)) {
        return false;
      }

      // Transport filter
      if (filters.transports.length > 0 && !filters.transports.includes(deal.transport)) {
        return false;
      }

      // Minimum investment filter
      if (filters.minInvestment !== null && deal.investmentAmount < filters.minInvestment) {
        return false;
      }

      // Risk filter
      if (filters.risks.length > 0 && (!deal.risk || !filters.risks.includes(deal.risk))) {
        return false;
      }

      // APY filter
      if (filters.minAPY !== null || filters.maxAPY !== null) {
        const dealAPY = calculateAPY(deal);
        if (filters.minAPY !== null && dealAPY < filters.minAPY) {
          return false;
        }
        if (filters.maxAPY !== null && dealAPY > filters.maxAPY) {
          return false;
        }
      }

      return true;
    });
  };

  const filteredDeals = applyFilters(deals);

  // Calculate portfolio metrics using the new calculation functions
  const portfolioMetrics = calculatePortfolioMetrics(filteredDeals);
  const totalInvested = portfolioMetrics.totalInvestment;
  const totalRevenue = portfolioMetrics.totalRevenue;
  const averageAPY = portfolioMetrics.averageAPY;

  const activeCount = deals.filter(d => d.status === 'proposal' || (d.status === 'confirmed' && d.currentMilestone === 0)).length;
  const inProgressCount = deals.filter(d => d.status === 'confirmed' && d.currentMilestone > 0).length;
  const completedCount = deals.filter(d => d.status === 'finished').length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading deals...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F2F2]">
      <main className="container mx-auto py-8 px-4 sm:px-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-[#4EA4D9]">
            <h3 className="text-sm font-medium text-gray-600 mb-2">AUM</h3>
            <p className="text-2xl font-bold text-[#4EA4D9]">{formatCurrency(totalInvested)}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-[#3CA638]">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Yield Generated (APY)</h3>
            <p className="text-2xl font-bold text-[#3CA638]">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-[#F2A007]">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Deal Value Generated</h3>
            <p className="text-2xl font-bold text-[#F2A007]">{formatCurrency(totalRevenue)}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${statusFilter === 'all'
                ? 'bg-[#3CA638] text-white shadow-[0_4px_14px_0_rgba(60,166,56,0.25)]'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              All ({deals.length})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${statusFilter === 'active'
                ? 'bg-[#3CA638] text-white shadow-[0_4px_14px_0_rgba(60,166,56,0.25)]'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Active ({activeCount})
            </button>
            <button
              onClick={() => setStatusFilter('in-progress')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${statusFilter === 'in-progress'
                ? 'bg-[#3CA638] text-white shadow-[0_4px_14px_0_rgba(60,166,56,0.25)]'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              In Progress ({inProgressCount})
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${statusFilter === 'completed'
                ? 'bg-[#3CA638] text-white shadow-[0_4px_14px_0_rgba(60,166,56,0.25)]'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Completed ({completedCount})
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        <DealFilters onFilterChange={setFilters} />

        {/* Open Deals Section */}
        {statusFilter !== 'completed' && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {statusFilter === 'all' ? 'Open Deals' : statusFilter === 'active' ? 'Active Deals' : 'In Progress Deals'}
            </h2>
            <p className="text-gray-600 mb-6">
              {filteredDeals.filter(d => d.status !== 'finished').length} open deal{filteredDeals.filter(d => d.status !== 'finished').length !== 1 ? 's' : ''}
            </p>

            {/* Show list view if 3+ deals, otherwise card view */}
            {filteredDeals.filter(d => d.status !== 'finished').length >= 3 ? (
              <div className="space-y-4">
                {filteredDeals.filter(d => d.status !== 'finished').map((deal) => (
                  <DealListItem
                    key={deal.id}
                    deal={deal}
                    onClick={() => router.push(`/shipments/${deal.id}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                {filteredDeals.filter(d => d.status !== 'finished').map((deal) => (
                  <div
                    key={deal.id}
                    onClick={() => router.push(`/shipments/${deal.id}`)}
                    className="w-full"
                  >
                    <DealCard deal={deal} />
                  </div>
                ))}
              </div>
            )}

            {filteredDeals.filter(d => d.status !== 'finished').length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No open deals match the selected filters</p>
              </div>
            )}
          </div>
        )}

        {/* Closed Deals Section */}
        {statusFilter !== 'active' && statusFilter !== 'in-progress' && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Closed Deals</h2>
            <p className="text-gray-600 mb-6">
              {filteredDeals.filter(d => d.status === 'finished').length} completed deal{filteredDeals.filter(d => d.status === 'finished').length !== 1 ? 's' : ''}
            </p>

            <div className="space-y-4">
              {filteredDeals.filter(d => d.status === 'finished').map((deal) => {
                const interestPaid = calculateRevenue(deal);
                return (
                  <div
                    key={deal.id}
                    onClick={() => router.push(`/shipments/${deal.id}`)}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-[#3CA638]"
                  >
                    <div className="grid grid-cols-12 gap-6 items-center">
                      {/* Deal Name */}
                      <div className="col-span-4">
                        <h3 className="font-bold text-lg text-gray-900">{deal.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {deal.origin} → {deal.destination}
                        </p>
                      </div>

                      {/* Total Loan Amount */}
                      <div className="col-span-3 text-center">
                        <div className="text-sm text-gray-600 mb-1">Total Loan Amount</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {formatCurrency(deal.investmentAmount)}
                        </div>
                      </div>

                      {/* Interest Paid */}
                      <div className="col-span-3 text-center">
                        <div className="text-sm text-gray-600 mb-1">Interest Paid</div>
                        <div className="text-lg font-semibold text-[#3CA638]">
                          {formatCurrency(interestPaid)}
                        </div>
                      </div>

                      {/* Status */}
                      <div className="col-span-2 text-center">
                        <div className="text-sm text-gray-600 mb-2">Status</div>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#3CA63820] text-[#2D8828] border border-[#3CA638]">
                          Fully Repaid
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredDeals.filter(d => d.status === 'finished').length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No completed deals match the selected filters</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

