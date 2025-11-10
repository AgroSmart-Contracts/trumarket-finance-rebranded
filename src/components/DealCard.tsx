'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DealDetails } from '@/types';
import { TrendingUp, DollarSign, Droplets, ShieldAlert, MapPin, ArrowRight, CircleCheckBig } from 'lucide-react';
import { calculateAPY } from '@/lib/financialCalculations';

interface DealCardProps {
  deal: DealDetails;
}

const getStatusColor = (status: string, currentMilestone: number) => {
  switch (status) {
    case 'proposal':
      return 'bg-[#3CA63820] text-[#2D8828] border-[#3CA638]';
    case 'confirmed':
      return currentMilestone === 0
        ? 'bg-[#3CA63820] text-[#2D8828] border-[#3CA638]'  // Active color (green)
        : 'bg-[#4EA4D920] text-[#5898C7] border-[#4EA4D9]'; // In Progress color (blue)
    case 'finished':
      return 'bg-[#3CA63820] text-[#2D8828] border-[#3CA638]';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

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

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const getRiskLabel = (risk?: string) => {
  if (!risk) return 'N/A';
  return risk.charAt(0).toUpperCase() + risk.slice(1);
};

const getRiskColor = (risk?: string) => {
  if (!risk) return 'text-gray-500';
  const colors = {
    low: 'text-[#3CA638]',
    medium: 'text-[#F2A007]',
    high: 'text-red-600',
  };
  return colors[risk as keyof typeof colors] || 'text-gray-500';
};

export default function DealCard({ deal }: DealCardProps) {
  const apy = calculateAPY(deal);
  const liquidityPoolSize = deal.liquidityPoolSize || deal.investmentAmount;

  // Color classes for product badges (inspired by home-next)
  const colorClasses = [
    "bg-green-100 text-green-600",
    "bg-blue-100 text-blue-600",
    "bg-purple-100 text-purple-600"
  ];
  const colorIndex = deal.id ? parseInt(deal.id.slice(-1)) || 0 : 0;

  return (
    <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-gray-300 h-full flex flex-col hover:bg-gray-50">
      {/* Mobile Layout - Inspired by trumarket-home-next */}
      <div className="block md:hidden h-full flex flex-col px-4 py-6">
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
              {getStatusLabel(deal.status, deal.currentMilestone)}
            </p>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex justify-between items-start gap-3 mb-2">
            <CardTitle className="text-lg font-bold flex-1 min-w-0 line-clamp-1">
              {deal.name}
            </CardTitle>
            <Badge className={`${getStatusColor(deal.status, deal.currentMilestone)} flex-shrink-0 whitespace-nowrap text-xs`}>
              {getStatusLabel(deal.status, deal.currentMilestone)}
            </Badge>
          </div>
          <CardDescription className="text-sm line-clamp-1 min-h-[1.25rem]">
            {deal.description || '\u00A0'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="space-y-3">
            {/* APY - Always visible */}
            <div className="flex items-center justify-between p-3 bg-[#3CA63820] rounded-lg">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#3CA638]" />
                <span className="text-sm font-medium text-gray-700">APY</span>
              </div>
              <span className="text-xl font-bold text-[#3CA638]">{apy.toFixed(2)}%</span>
            </div>

            {/* Total Supplied */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Total Supplied</span>
              </div>
              <span className="text-sm font-semibold">{formatCurrency(deal.investmentAmount)}</span>
            </div>

            {/* Liquidity Pool Size */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Pool Size</span>
              </div>
              <span className="text-sm font-semibold">{formatCurrency(liquidityPoolSize)}</span>
            </div>

            {/* Risk Category */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Risk</span>
              </div>
              <span className={`text-sm font-semibold ${getRiskColor(deal.risk)}`}>
                {getRiskLabel(deal.risk)}
              </span>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}

