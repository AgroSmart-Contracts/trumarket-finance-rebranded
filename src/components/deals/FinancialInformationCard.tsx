import React, { useMemo } from 'react';
import { DealDetails } from '@/types';
import { InfoCard, SectionHeader, DealTermRow, RiskBadge } from '@/components/ui';
import { formatCurrency } from '@/lib/formatters';
import { calculateInvestmentLimits, getDealRisk } from '@/lib/financialCalculations';
import { COLORS, TYPOGRAPHY } from '@/lib/constants';

interface FinancialInformationCardProps {
    apy: number;
    shipment: DealDetails;
}

interface LegendItemProps {
    color: string;
    label: string;
    value: string;
    alignRight?: boolean;
}

const LegendItem: React.FC<LegendItemProps> = ({ color, label, value, alignRight = false }) => (
    <div className="flex items-center justify-between gap-8 w-full lg:w-auto">
        <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
            <span
                className="text-sm leading-5 font-normal text-[#314158]"
                style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tighter }}
            >
                {label}
            </span>
        </div>
        <span
            className={`text-base leading-6 font-normal text-[#0F172B] ${alignRight ? 'text-right' : ''}`}
            style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tight }}
        >
            {value}
        </span>
    </div>
);

interface MetricItemProps {
    label: string;
    value: string;
    isPositive?: boolean;
}

const MetricItem: React.FC<MetricItemProps> = ({ label, value, isPositive = false }) => (
    <div className="flex flex-col gap-1 w-full">
        <span
            className="text-sm leading-5 font-normal text-[#62748E]"
            style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tighter }}
        >
            {label}
        </span>
        <span
            className={`text-xl leading-7 font-normal ${isPositive ? 'text-[#4E8C37]' : 'text-[#0F172B]'}`}
            style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tightest }}
        >
            {value}
        </span>
    </div>
);

export const FinancialInformationCard: React.FC<FinancialInformationCardProps> = ({ apy, shipment }) => {
    // Use actual data from shipment
    const principalInvested = shipment.investmentAmount || 0;
    const revenue = shipment.revenue || 0;
    const principalRequired = shipment.liquidityPoolSize || shipment.investmentAmount || 0;
    const risk = useMemo(() => getDealRisk(shipment), [shipment]);

    // Calculate investment limits using utility function
    const { min: minInvestment, max: maxInvestment } = useMemo(
        () => calculateInvestmentLimits(principalInvested),
        [principalInvested]
    );

    // Total return is principal + revenue, or use a calculated total if available
    const totalReturnAmount = useMemo(
        () => Math.max(principalInvested + revenue, principalInvested * (1 + apy / 100)) || principalInvested || 1,
        [principalInvested, revenue, apy]
    );

    // Prevent division by zero in chart calculations
    const safeTotal = useMemo(() => (totalReturnAmount > 0 ? totalReturnAmount : 1), [totalReturnAmount]);

    const calculateCircumference = (radius: number) => 2 * Math.PI * radius;

    return (
        <InfoCard style={{ padding: '25px 25px 25px', gap: '24px' }}>
            <SectionHeader as="h2">Financial Information</SectionHeader>

            {/* Doughnut Chart Section */}
            <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-[70px]">
                <div className="relative w-[200px] h-[200px] sm:w-[227px] sm:h-[227px] flex items-center justify-center flex-shrink-0">
                    <svg
                        width="227"
                        height="227"
                        viewBox="0 0 227 227"
                        className="transform -rotate-90"
                    >
                        <circle
                            cx="113.5"
                            cy="113.5"
                            r="106"
                            fill="none"
                            stroke={COLORS.primary.green}
                            strokeWidth="10"
                            strokeDasharray={`${(principalInvested / safeTotal) *
                                calculateCircumference(106)
                                } ${calculateCircumference(106)}`}
                        />
                        <circle
                            cx="113.5"
                            cy="113.5"
                            r="101"
                            fill="none"
                            stroke={COLORS.chart.green}
                            strokeWidth="5"
                            strokeDasharray={`${(principalRequired / safeTotal) *
                                calculateCircumference(101)
                                } ${calculateCircumference(101)}`}
                            strokeDashoffset={`${(principalInvested / safeTotal) *
                                calculateCircumference(101)
                                }`}
                        />
                        <circle
                            cx="113.5"
                            cy="113.5"
                            r="96"
                            fill="none"
                            stroke={COLORS.chart.yellow}
                            strokeWidth="5"
                            strokeDasharray={`${(apy / 100) * calculateCircumference(96)
                                } ${calculateCircumference(96)}`}
                            strokeDashoffset={`${((principalInvested + principalRequired) / safeTotal) *
                                calculateCircumference(96)
                                }`}
                        />
                        <circle
                            cx="113.5"
                            cy="113.5"
                            r="91"
                            fill="none"
                            stroke={COLORS.chart.red}
                            strokeWidth="5"
                            strokeDasharray={`${(minInvestment / safeTotal) * calculateCircumference(91)
                                } ${calculateCircumference(91)}`}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-xs leading-4 font-medium text-[#737373] text-center mb-1">
                            Principal Invested
                        </div>
                        <div className="text-2xl leading-8 font-bold text-[#3B7A2A] text-center">
                            {formatCurrency(principalInvested)}
                        </div>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex flex-col gap-2 w-full lg:w-auto">
                    <LegendItem
                        color={COLORS.chart.yellow}
                        label="Total Return Amount"
                        value={formatCurrency(totalReturnAmount)}
                    />
                    <LegendItem
                        color={COLORS.chart.green}
                        label="Principal Required"
                        value={formatCurrency(principalRequired)}
                    />
                    <LegendItem
                        color={COLORS.chart.red}
                        label="Interest Rate (APY)"
                        value={`${apy.toFixed(1)}%`}
                        alignRight
                    />
                    <div className="flex items-center justify-between gap-8 w-full lg:w-auto">
                        <div className="flex items-center gap-2">
                            <div
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: COLORS.primary.green }}
                            />
                            <span
                                className="text-sm leading-5 font-normal text-[#314158]"
                                style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tighter }}
                            >
                                Risk Level: {risk.charAt(0).toUpperCase() + risk.slice(1)} Risk
                            </span>
                        </div>
                        <RiskBadge risk={risk} />
                    </div>
                </div>
            </div>

            {/* Deal Terms */}
            <div className="pt-[17px] border-t border-[#E2E8F0] flex flex-col gap-4">
                <DealTermRow
                    label="Payment Structure"
                    value="Quarterly interest payments with principal at maturity"
                />
                <DealTermRow label="Management Fee" value="0% annually" />
                <DealTermRow label="Performance Fee" value="0%" />
                <DealTermRow
                    label="Min Investment"
                    value={formatCurrency(minInvestment)}
                />
                <DealTermRow
                    label="Max Investment"
                    value={formatCurrency(maxInvestment)}
                />
            </div>

            {/* Historical Performance */}
            {shipment.roi !== undefined && (
                <div className="pt-[25px] border-t border-[#E2E8F0] flex flex-col gap-4">
                    <SectionHeader>Historical Performance</SectionHeader>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <MetricItem
                            label="Expected ROI"
                            value={`${shipment.roi.toFixed(1)}%`}
                            isPositive={shipment.roi > 0}
                        />
                        <MetricItem
                            label="Net Balance"
                            value={formatCurrency(shipment.netBalance || 0)}
                        />
                        <MetricItem
                            label="Revenue"
                            value={formatCurrency(shipment.revenue || 0)}
                            isPositive={shipment.revenue > 0}
                        />
                        <MetricItem
                            label="Investment Amount"
                            value={formatCurrency(shipment.investmentAmount || 0)}
                        />
                    </div>
                </div>
            )}
        </InfoCard>
    );
};


