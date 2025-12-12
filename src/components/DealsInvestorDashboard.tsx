'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DealCard from '@/components/DealCard';
import DealListItem from '@/components/DealListItem';
import { useICPShipments } from '@/hooks/useICPShipments';
import { DealDetails } from '@/types';
import { calculatePortfolioMetrics, calculateAPY, calculateRevenue } from '@/lib/financialCalculations';
import { DollarSign, TrendingUp, Clock, BarChart3, Search, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/formatters';
import { MetricCard } from '@/components/ui/MetricCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Sparkline } from '@/components/ui/Sparkline';
import { RiskBadge } from '@/components/ui/RiskBadge';

export default function DealsInvestorDashboard() {
  const router = useRouter();
  const { shipments: deals, loading } = useICPShipments();

  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'in-progress' | 'completed'>('active');

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


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading deals...</div>
      </div>
    );
  }

  // Calculate metrics for display
  const dealValueGenerated = totalInvested + totalRevenue;
  const yieldGenerated = averageAPY;
  const aum = totalInvested;
  const activeDealsCount = activeCount;

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 pb-0 flex flex-col gap-[24px]">
        {/* Metrics Summary Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <MetricCard
            label="Deal Value Generated"
            value={formatCurrency(dealValueGenerated)}
            icon={DollarSign}
            iconColor="#4E8C37"
            iconBackgroundColor="#ECFDF5"
            change={{ value: '+12.5% p.a.', isPositive: true }}
            sparkline={<Sparkline color="#4E8C37" />}
            width="100%"
          />
          <MetricCard
            label="Yield Generated"
            value={`${yieldGenerated.toFixed(2)}%`}
            icon={TrendingUp}
            iconColor="#BDD156"
            iconBackgroundColor="#F7FEE7"
            change={{ value: '+0.8% p.a.', isPositive: true }}
            sparkline={<Sparkline color="#BDD156" />}
            width="100%"
          />
          <MetricCard
            label="AUM"
            value={formatCurrency(aum)}
            icon={Clock}
            iconColor="#EEBA32"
            iconBackgroundColor="#FFFBEB"
            change={{ value: '+18.2% p.a.', isPositive: true }}
            sparkline={<Sparkline color="#EEBA32" />}
            width="100%"
          />
          <MetricCard
            label="Active Deals"
            value={activeDealsCount.toString()}
            icon={BarChart3}
            iconColor="#4E8C37"
            iconBackgroundColor="#ECFDF5"
            change={{ value: '+5 p.a.', isPositive: true }}
            sparkline={<Sparkline color="#4E8C37" />}
            width="100%"
          />
        </div>

        {/* Recommended Deals Section */}
        {filteredDeals.filter(d => d.status !== 'finished').length > 0 && (
          <div className="mb-[24px]">
            <SectionHeader className="mb-4">Recommended Deals</SectionHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDeals
                .filter(d => d.status !== 'finished')
                .slice(0, 3)
                .map((deal) => (
                  <div
                    key={deal.id}
                    className="bg-white border border-[#E2E8F0] rounded-lg shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] hover:shadow-md transition-all cursor-pointer w-full"
                    onClick={() => router.push(`/shipments/${deal.id}`)}
                  >
                    <div className="p-6 flex flex-col gap-4">
                      {/* Category Tags */}
                      <div className="flex items-center gap-2 sm:gap-3 justify-between">
                        <span className="px-[10px] py-0.5 rounded-full text-base font-normal text-[#314158]" style={{ background: '#F1F5F9', letterSpacing: '-0.3125px' }}>
                          {deal.origin || 'Grain'}
                        </span>
                        <span className="px-[10px] py-0.5 rounded-full text-base font-normal text-white bg-[#4E8C37]" style={{ letterSpacing: '-0.3125px' }}>
                          Featured
                        </span>
                      </div>

                      {/* Deal Name */}
                      <h3 className="text-base leading-6 font-normal text-[#0F172B]" style={{ letterSpacing: '-0.3125px' }}>{deal.name}</h3>

                      {/* Key Details */}
                      <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center" style={{ height: '24px' }}>
                          <div className="flex items-center gap-3">
                            <TrendingUp className="w-4 h-4 text-[#62748E]" />
                            <span className="text-sm leading-5 font-normal text-[#62748E]" style={{ letterSpacing: '-0.150391px' }}>Expected Yield</span>
                          </div>
                          <span className="text-base leading-6 font-normal text-[#4E8C37]" style={{ letterSpacing: '-0.3125px' }}>{calculateAPY(deal).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between items-center" style={{ height: '24px' }}>
                          <div className="flex items-center gap-3">
                            <Clock className="w-4 h-4 text-[#62748E]" />
                            <span className="text-sm leading-5 font-normal text-[#62748E]" style={{ letterSpacing: '-0.150391px' }}>Duration</span>
                          </div>
                          <span className="text-base leading-6 font-normal text-[#0F172B]" style={{ letterSpacing: '-0.3125px' }}>180 days</span>
                        </div>
                        <div className="flex justify-between items-center" style={{ height: '24px' }}>
                          <span className="text-sm leading-5 font-normal text-[#62748E]" style={{ letterSpacing: '-0.150391px' }}>Maturity</span>
                          <span className="text-base leading-6 font-normal text-[#0F172B]" style={{ letterSpacing: '-0.3125px' }}>Jun 2026</span>
                        </div>
                        <div className="flex justify-between items-center" style={{ height: '24px' }}>
                          <span className="text-sm leading-5 font-normal text-[#62748E]" style={{ letterSpacing: '-0.150391px' }}>
                            Risk Level: {deal.risk === 'low' ? 'Low' : deal.risk === 'medium' ? 'Medium' : 'High'}
                          </span>
                          {deal.risk && <RiskBadge risk={deal.risk as 'low' | 'medium' | 'high'} />}
                        </div>

                        {/* Collateral Information */}
                        <div className="pt-[13px] border-t border-[#F1F5F9] flex flex-col gap-0.5">
                          <div className="flex items-center gap-3 mb-0.5">
                            <Circle className="w-4 h-4 text-[#90A1B9]" />
                            <span className="text-sm leading-5 font-normal text-[#62748E]" style={{ letterSpacing: '-0.150391px' }}>Collateral</span>
                          </div>
                          <p className="text-sm leading-5 font-normal text-[#0F172B] ml-7" style={{ letterSpacing: '-0.150391px' }}>
                            Physical inventory + Insurance
                          </p>
                          <p className="text-xs leading-4 font-normal text-[#62748E] ml-7">
                            Ratio: 125%
                          </p>
                        </div>

                        {/* Deal Size */}
                        <div className="flex justify-between items-center" style={{ height: '32px' }}>
                          <span className="text-sm leading-5 font-normal text-[#62748E]" style={{ letterSpacing: '-0.150391px' }}>Deal Size</span>
                          <span className="text-base leading-6 font-normal text-[#0F172B]" style={{ letterSpacing: '-0.3125px' }}>{formatCurrency(deal.investmentAmount)}</span>
                        </div>
                      </div>

                      {/* Invest Now Button */}
                      <Button
                        className="w-full bg-[#4E8C37] hover:bg-[#3A6A28] text-white rounded-md h-10 mt-auto"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/shipments/${deal.id}`);
                        }}
                      >
                        <span className="text-base leading-6 font-normal" style={{ letterSpacing: '-0.3125px' }}>Invest Now</span>
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] p-4 mb-6 w-full">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#90A1B9]" />
            <input
              type="text"
              placeholder="Search deals..."
              className="w-full pl-10 pr-4 py-2 bg-[#FAFAFA] border-none rounded-md text-base font-normal text-[#0F172A] focus:outline-none"
              style={{ height: '40px', letterSpacing: '-0.3125px' }}
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-md border border-[#E2E8F0] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] p-1.5 mb-6 w-full overflow-x-auto">
          <div className="flex gap-1 sm:gap-0 sm:justify-between min-w-max sm:min-w-0">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2 sm:px-3 py-2 sm:py-2.5 rounded text-xs sm:text-sm md:text-base font-normal transition-all whitespace-nowrap flex-shrink-0 ${statusFilter === 'all'
                ? 'bg-[#F1F5F9] text-[#0F172B] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]'
                : 'text-[#64748B] hover:text-[#0F172B]'
                }`}
              style={{ letterSpacing: '-0.3125px', minHeight: '36px', height: 'auto' }}
            >
              <span className="hidden sm:inline">All Deals</span>
              <span className="sm:hidden">All</span>
              <span className="px-1.5 sm:px-2.5 py-0.5 bg-[#F1F5F9] rounded-full text-xs sm:text-sm md:text-base font-normal text-[#314158] ml-1 sm:ml-2" style={{ letterSpacing: '-0.3125px' }}>{deals.length}</span>
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-2 sm:px-3 py-2 sm:py-2.5 rounded text-xs sm:text-sm md:text-base font-normal transition-all whitespace-nowrap flex-shrink-0 ${statusFilter === 'active'
                ? 'bg-[#F1F5F9] text-[#0F172B] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]'
                : 'text-[#64748B] hover:text-[#0F172B]'
                }`}
              style={{ letterSpacing: '-0.3125px', minHeight: '36px', height: 'auto' }}
            >
              Active <span className="px-1.5 sm:px-2.5 py-0.5 bg-[#F1F5F9] rounded-full text-xs sm:text-sm md:text-base font-normal text-[#314158] ml-1 sm:ml-2" style={{ letterSpacing: '-0.3125px' }}>{activeCount}</span>
            </button>
            <button
              onClick={() => setStatusFilter('in-progress')}
              className={`px-2 sm:px-3 py-2 sm:py-2.5 rounded text-xs sm:text-sm md:text-base font-normal transition-all whitespace-nowrap flex-shrink-0 ${statusFilter === 'in-progress'
                ? 'bg-[#F1F5F9] text-[#0F172B] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]'
                : 'text-[#64748B] hover:text-[#0F172B]'
                }`}
              style={{ letterSpacing: '-0.3125px', minHeight: '36px', height: 'auto' }}
            >
              <span className="hidden sm:inline">In Progress</span>
              <span className="sm:hidden">Progress</span>
              <span className="px-1.5 sm:px-2.5 py-0.5 bg-[#F1F5F9] rounded-full text-xs sm:text-sm md:text-base font-normal text-[#314158] ml-1 sm:ml-2" style={{ letterSpacing: '-0.3125px' }}>{inProgressCount}</span>
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-2 sm:px-3 py-2 sm:py-2.5 rounded text-xs sm:text-sm md:text-base font-normal transition-all whitespace-nowrap flex-shrink-0 ${statusFilter === 'completed'
                ? 'bg-[#F1F5F9] text-[#0F172B] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]'
                : 'text-[#64748B] hover:text-[#0F172B]'
                }`}
              style={{ letterSpacing: '-0.3125px', minHeight: '36px', height: 'auto' }}
            >
              Completed <span className="px-1.5 sm:px-2.5 py-0.5 bg-[#F1F5F9] rounded-full text-xs sm:text-sm md:text-base font-normal text-[#314158] ml-1 sm:ml-2" style={{ letterSpacing: '-0.3125px' }}>{completedCount}</span>
            </button>
          </div>
        </div>

        {/* Deals Section */}
        {statusFilter !== 'completed' && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Deals</h2>

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
                    className="bg-white border border-gray-200 rounded-lg p-[25px] hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-[#4E8C37]"
                  >
                    {/* Mobile Layout */}
                    <div className="block md:hidden space-y-4">
                      {/* Deal Name */}
                      <div>
                        <h3 className="font-bold text-base sm:text-lg text-gray-900">{deal.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {deal.origin} → {deal.destination}
                        </p>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs sm:text-sm text-gray-600 mb-1">Total Loan Amount</div>
                          <div className="text-base sm:text-lg font-semibold text-gray-900">
                            {formatCurrency(deal.investmentAmount)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm text-gray-600 mb-1">Interest Paid</div>
                          <div className="text-base sm:text-lg font-semibold text-[#4E8C37]">
                            {formatCurrency(interestPaid)}
                          </div>
                        </div>
                      </div>

                      {/* Status */}
                      <div>
                        <div className="text-xs sm:text-sm text-gray-600 mb-2">Status</div>
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-[#4E8C3720] text-[#3A6A28] border border-[#4E8C37]">
                          Fully Repaid
                        </span>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden md:grid md:grid-cols-12 gap-4 lg:gap-6 items-center">
                      {/* Deal Name */}
                      <div className="col-span-12 md:col-span-5 lg:col-span-4">
                        <h3 className="font-bold text-base md:text-lg text-gray-900">{deal.name}</h3>
                        <p className="text-xs md:text-sm text-gray-500 mt-1">
                          {deal.origin} → {deal.destination}
                        </p>
                      </div>

                      {/* Total Loan Amount */}
                      <div className="col-span-6 md:col-span-3 lg:col-span-3 text-center">
                        <div className="text-xs md:text-sm text-gray-600 mb-1">Total Loan Amount</div>
                        <div className="text-base md:text-lg font-semibold text-gray-900">
                          {formatCurrency(deal.investmentAmount)}
                        </div>
                      </div>

                      {/* Interest Paid */}
                      <div className="col-span-6 md:col-span-2 lg:col-span-3 text-center">
                        <div className="text-xs md:text-sm text-gray-600 mb-1">Interest Paid</div>
                        <div className="text-base md:text-lg font-semibold text-[#4E8C37]">
                          {formatCurrency(interestPaid)}
                        </div>
                      </div>

                      {/* Status */}
                      <div className="col-span-12 md:col-span-2 lg:col-span-2 text-center md:text-left">
                        <div className="text-xs md:text-sm text-gray-600 mb-2">Status</div>
                        <span className="inline-block px-2 md:px-3 py-1 rounded-full text-xs font-medium bg-[#4E8C3720] text-[#3A6A28] border border-[#4E8C37]">
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