'use client';

import { DealDetails } from '@/types';
import { calculateAPY } from '@/lib/financialCalculations';
import { ArrowRight, CircleCheckBig } from 'lucide-react';

interface DealListItemProps {
    deal: DealDetails;
    onClick: () => void;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

const getRiskBadge = (risk?: string) => {
    if (!risk) return <span className="text-sm text-gray-500">N/A</span>;

    const riskColors = {
        low: 'bg-[#3CA63820] text-[#2D8828] border-[#3CA638]',
        medium: 'bg-[#F2A00720] text-[#D48806] border-[#F2A007]',
        high: 'bg-red-50 text-red-700 border-red-300',
    };

    const riskLabels = {
        low: 'Low',
        medium: 'Medium',
        high: 'High',
    };

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${riskColors[risk as keyof typeof riskColors]}`}>
            {riskLabels[risk as keyof typeof riskLabels]}
        </span>
    );
};

export default function DealListItem({ deal, onClick }: DealListItemProps) {
    const apy = calculateAPY(deal);
    const liquidityPoolSize = deal.liquidityPoolSize || deal.investmentAmount;

    // Color classes for product badges (inspired by home-next)
    const colorClasses = [
        "bg-green-100 text-green-600",
        "bg-blue-100 text-blue-600",
        "bg-purple-100 text-purple-600"
    ];
    const colorIndex = deal.id ? parseInt(deal.id.slice(-1)) || 0 : 0;

    const getStatusLabel = (status: string, currentMilestone: number) => {
        switch (status) {
            case 'proposal':
                return 'Active';
            case 'confirmed':
                return currentMilestone === 0 ? 'Active' : 'In Progress';
            case 'finished':
                return 'Completed';
            default:
                return status;
        }
    };

    return (
        <div
            onClick={onClick}
            className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-[#3CA638] group hover:bg-gray-50"
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
                        <CircleCheckBig className="w-5 h-5 text-green-600" />
                        <p className="text-sm font-semibold text-green-600">
                            {getStatusLabel(deal.status, deal.currentMilestone || 0)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:grid grid-cols-12 gap-6 items-center p-6">
                {/* Deal Name - 3 columns */}
                <div className="col-span-3">
                    <h3 className="font-bold text-lg text-gray-900 group-hover:text-[#3CA638] transition-colors line-clamp-1">
                        {deal.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                        {deal.origin} → {deal.destination}
                    </p>
                </div>

                {/* APY - 2 columns */}
                <div className="col-span-2 text-center">
                    <div className="text-sm text-gray-600 mb-1">APY</div>
                    <div className="text-2xl font-bold text-[#3CA638]">{apy.toFixed(2)}%</div>
                </div>

                {/* Total Supplied - 2 columns */}
                <div className="col-span-2 text-center">
                    <div className="text-sm text-gray-600 mb-1">Total Supplied</div>
                    <div className="text-lg font-semibold text-gray-900">{formatCurrency(deal.investmentAmount)}</div>
                </div>

                {/* Liquidity Pool Size - 2 columns */}
                <div className="col-span-2 text-center">
                    <div className="text-sm text-gray-600 mb-1">Pool Size</div>
                    <div className="text-lg font-semibold text-gray-900">{formatCurrency(liquidityPoolSize)}</div>
                </div>

                {/* Risk - 2 columns */}
                <div className="col-span-2 text-center">
                    <div className="text-sm text-gray-600 mb-2">Risk</div>
                    {getRiskBadge(deal.risk)}
                </div>

                {/* Arrow - 1 column */}
                <div className="col-span-1 flex justify-end">
                    <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-[#3CA638] group-hover:translate-x-1 transition-all" />
                </div>
            </div>
        </div>
    );
}

