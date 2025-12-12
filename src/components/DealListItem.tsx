'use client';

import { DealDetails } from '@/types';
import { calculateAPY } from '@/lib/financialCalculations';
import { formatCurrency } from '@/lib/formatters';
import { getStatusLabel } from '@/lib/dealUtils';
import { ArrowRight, CircleCheckBig, TrendingUp, DollarSign, Circle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RiskBadge } from '@/components/ui/RiskBadge';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { MetricDisplay } from '@/components/ui/MetricDisplay';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface DealListItemProps {
    deal: DealDetails;
    onClick: () => void;
}

export default function DealListItem({ deal, onClick }: DealListItemProps) {
    const apy = calculateAPY(deal);

    // Color classes for product badges (inspired by home-next)
    const colorClasses = [
        "bg-[#4E8C3720] text-[#4E8C37]",
        "bg-blue-100 text-blue-600",
        "bg-purple-100 text-purple-600"
    ];
    const colorIndex = deal.id ? parseInt(deal.id.slice(-1)) || 0 : 0;


    return (
        <div
            onClick={onClick}
            className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-[#4E8C37] group hover:bg-gray-50"
        >
            {/* Mobile Layout - Inspired by trumarket-home-next */}
            <div className="block md:hidden px-4 py-6">
                {/* Top Section: Product Badge and APY */}
                <div className="flex items-center justify-between mb-4 gap-3">
                    <span className={`text-sm rounded-lg px-3 py-1 font-semibold ${colorClasses[colorIndex % colorClasses.length]}`}>
                        {deal.name}
                    </span>
                    <span className="text-sm text-gray-800 font-semibold whitespace-nowrap">
                        {apy.toFixed(2)}% APY
                    </span>
                </div>

                {/* Route Section */}
                <div className="flex flex-row items-center space-x-1 mb-2">
                    <h4 className="text-base font-semibold text-gray-900">
                        {deal.origin}
                    </h4>
                    <ArrowRight className="w-4 h-4 text-gray-600" />
                    <h4 className="text-base font-semibold text-gray-900">
                        {deal.destination}
                    </h4>
                </div>

                {/* Description */}
                {deal.description && deal.description !== 'N/A' && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {deal.description}
                    </p>
                )}

                {/* Bottom Section: Investment Amount and Status */}
                <div className="flex flex-row justify-between items-center mt-auto pt-2">
                    <div className="text-lg font-bold text-gray-900">
                        {formatCurrency(deal.investmentAmount)}
                    </div>
                    <div className="flex flex-row space-x-2 items-center">
                        <CircleCheckBig className="w-5 h-5 text-[#4E8C37]" />
                        <p className="text-sm font-semibold text-[#4E8C37]">
                            {getStatusLabel(deal.status, deal.currentMilestone || 0)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:block bg-white border border-[#E2E8F0] rounded-lg shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] p-[20px] flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                        <h3 className="text-base leading-6 font-normal text-[#0F172B]" style={{ letterSpacing: '-0.3125px' }}>
                            {deal.name}
                        </h3>
                        <StatusBadge status={getStatusLabel(deal.status, deal.currentMilestone || 0)} />
                        {deal.origin && <Badge variant="commodity">{deal.origin}</Badge>}
                        {deal.risk && <RiskBadge risk={deal.risk as 'low' | 'medium' | 'high'} />}
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onClick();
                            }}
                            className="bg-[#FAFAFA] border border-[#CAD5E2] text-[#314158] hover:bg-gray-50 rounded-md h-9"
                            style={{ letterSpacing: '-0.3125px' }}
                        >
                            View Details
                        </Button>
                        <Button
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onClick();
                            }}
                            className="bg-[#4E8C37] hover:bg-[#3A6A28] text-white rounded-md h-9"
                            style={{ letterSpacing: '-0.3125px' }}
                        >
                            Manage
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 my-[16px]">
                    <MetricDisplay
                        label="Yield"
                        value={`${apy.toFixed(1)}%`}
                        icon={TrendingUp}
                        iconColor="#4E8C37"
                        iconBackgroundColor="#ECFDF5"
                        valueSize="sm"
                    />
                    <MetricDisplay
                        label="Amount Invested"
                        value={formatCurrency(deal.investmentAmount)}
                        icon={DollarSign}
                        iconColor="#BDD156"
                        iconBackgroundColor="#F7FEE7"
                        valueSize="sm"
                    />
                    <MetricDisplay
                        label="Collateral"
                        value="Warehouse receipts"
                        icon={Circle}
                        iconColor="#EEBA32"
                        iconBackgroundColor="#FFFBEB"
                        valueSize="sm"
                    />
                    <MetricDisplay
                        label="Maturity"
                        value="Mar 15, 2026"
                        icon={Calendar}
                        iconColor="#4E8C37"
                        iconBackgroundColor="#ECFDF5"
                        valueSize="sm"
                    />
                </div>

                {/* Progress Bar for In Progress deals */}
                {getStatusLabel(deal.status, deal.currentMilestone || 0) === 'In Progress' && (
                    <div className="pt-[17px] border-t border-[#F1F5F9]">
                        <ProgressBar
                            progress={65}
                            label="Deal Progress: Stored at Destination"
                            showPercentage
                            showIndicator
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

