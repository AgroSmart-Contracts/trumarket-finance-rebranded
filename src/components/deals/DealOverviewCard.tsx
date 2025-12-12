import React from 'react';
import { TrendingUp, Clock, Calendar, Shield } from 'lucide-react';
import { DealDetails } from '@/types';
import { calculateAPY } from '@/lib/financialCalculations';
import { InfoCard } from '@/components/ui/InfoCard';
import { MetricDisplay } from '@/components/ui/MetricDisplay';
import { RiskBadge } from '@/components/ui/RiskBadge';
import { Badge } from '@/components/ui/badge';
import { INVESTMENT, TYPOGRAPHY } from '@/lib/constants';

interface DealOverviewCardProps {
    shipment: DealDetails;
}

export const DealOverviewCard: React.FC<DealOverviewCardProps> = ({ shipment }) => {
    const apy = calculateAPY(shipment);

    return (
        <InfoCard style={{ padding: '25px 25px 25px', gap: '24px' }}>
            <div className="flex flex-col gap-3 mb-6">
                <div className="flex items-center gap-3 flex-wrap">
                    <h1
                        className="text-base leading-6 font-normal text-[#0F172B]"
                        style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tight }}
                    >
                        {shipment.name}
                    </h1>
                    <Badge variant="status">Active</Badge>
                    <Badge variant="commodity">{shipment.origin || 'Grain'}</Badge>
                </div>
                <p
                    className="text-base leading-6 font-normal text-[#62748E]"
                    style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tight }}
                >
                    Investment opportunity in Brazilian agricultural commodities with
                    institutional grade collateral
                </p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-3">
                <MetricDisplay
                    label="Expected Yield"
                    value={`${apy.toFixed(1)}%`}
                    icon={TrendingUp}
                    iconColor="#4E8C37"
                    iconBackgroundColor="#ECFDF5"
                />
                <MetricDisplay
                    label="Duration"
                    value={`${INVESTMENT.DEAL_DURATION_DAYS} days`}
                    icon={Clock}
                    iconColor="#BDD156"
                    iconBackgroundColor="#F7FEE7"
                />
                <MetricDisplay
                    label="Maturity Date"
                    value="June 15, 2026"
                    icon={Calendar}
                    iconColor="#EEBA32"
                    iconBackgroundColor="#FFFBEB"
                    valueSize="sm"
                />
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-[#ECFDF5] rounded-lg flex items-center justify-center p-3">
                        <Shield className="w-5 h-5 text-[#4E8C37]" />
                    </div>
                    <div>
                        <div
                            className="text-sm leading-5 font-normal text-[#62748E] mb-0.5"
                            style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tighter }}
                        >
                            Risk Tier
                        </div>
                        <RiskBadge risk="low" showLabel />
                    </div>
                </div>
            </div>
        </InfoCard>
    );
};


