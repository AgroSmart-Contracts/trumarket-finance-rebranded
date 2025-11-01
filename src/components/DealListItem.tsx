'use client';

import { DealDetails } from '@/types';
import { calculateAPY } from '@/lib/financialCalculations';
import { ArrowRight } from 'lucide-react';

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

    return (
        <div
            onClick={onClick}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-[#3CA638] group"
        >
            <div className="grid grid-cols-12 gap-6 items-center">
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

