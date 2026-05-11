import React, { useMemo } from 'react';
import { Wallet } from 'lucide-react';
import { useAccount, useReadContract } from 'wagmi';
import { erc20Abi, formatUnits } from 'viem';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { DealDetails } from '@/types';
import { InfoCard, SectionHeader, DealTermRow, RiskBadge, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';
import { formatCurrency } from '@/lib/formatters';
import { calculateInvestmentLimits, getDealRisk, calcYieldFromAPY } from '@/lib/financialCalculations';
import { COLORS, TYPOGRAPHY, INVESTMENT } from '@/lib/constants';

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
    const { address, isConnected } = useAccount();
    const tokenAddress = (process.env.NEXT_PUBLIC_INVESTMENT_TOKEN_CONTRACT_ADDRESS || '') as `0x${string}`;
    const tokenDecimals = Number(process.env.NEXT_PUBLIC_INVESTMENT_TOKEN_DECIMALS || '6');

    const { data: tokenBalanceRaw } = useReadContract({
        address: tokenAddress || undefined,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
        query: {
            enabled: Boolean(isConnected && address && tokenAddress),
        },
    });

    const walletBalanceUnderlying = useMemo(() => {
        if (tokenBalanceRaw == null) return 0;
        return Number(formatUnits(tokenBalanceRaw, tokenDecimals));
    }, [tokenBalanceRaw, tokenDecimals]);

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

    // Total return amount (principal + profit), calculated using APY and actual deal duration
    const totalReturnAmount = useMemo(() => {
        if (principalInvested <= 0 || !apy) return principalInvested || 0;

        // Use deal dates when available to determine duration
        const startDate = shipment.shippingStartDate
            ? new Date(shipment.shippingStartDate)
            : new Date();
        const endDate = shipment.expectedShippingEndDate
            ? new Date(shipment.expectedShippingEndDate)
            : new Date(startDate.getTime() + INVESTMENT.DEAL_DURATION_DAYS * 24 * 60 * 60 * 1000);

        // If endDate is not after startDate, fall back to configured deal duration
        const hasValidDates = endDate.getTime() > startDate.getTime();
        const effectiveEndDate = hasValidDates
            ? endDate
            : new Date(startDate.getTime() + INVESTMENT.DEAL_DURATION_DAYS * 24 * 60 * 60 * 1000);

        const { totalReturn } = calcYieldFromAPY({
            principal: principalInvested,
            apyPercent: apy,
            startDate,
            endDate: effectiveEndDate,
            dayCountBasis: 365,
        });

        return totalReturn;
    }, [principalInvested, apy, shipment.shippingStartDate, shipment.expectedShippingEndDate]);

    // Prevent division by zero in chart calculations
    const safeTotal = useMemo(() => (totalReturnAmount > 0 ? totalReturnAmount : 1), [totalReturnAmount]);

    const calculateCircumference = (radius: number) => 2 * Math.PI * radius;

    // Render Overview Content (shared between mobile tabs and desktop)
    const renderOverviewContent = () => (
        <>
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
            <div className="pt-[17px] border-t border-[#E2E8F0] flex flex-col gap-4 mt-6">
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
                <div className="pt-[25px] border-t border-[#E2E8F0] flex flex-col gap-4 mt-6">
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
        </>
    );

    return (
        <InfoCard style={{ padding: '25px 25px 25px', gap: '24px' }}>
            <SectionHeader as="h2">Financial Information</SectionHeader>

            {/* Mobile: Tabs Navigation */}
            <Tabs defaultValue="overview" className="w-full lg:hidden">
                <TabsList className="w-full justify-start">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="your-info">Your info</TabsTrigger>
                </TabsList>

                {/* Overview Tab Content - Mobile */}
                <TabsContent value="overview" className="mt-6">
                    {renderOverviewContent()}
                </TabsContent>

                {/* Your Info Tab Content - Mobile (matches desktop design) */}
                {!isConnected ? (
                    <TabsContent value="your-info" className="mt-6">
                        <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                            <p
                                className="mb-4 max-w-sm text-sm font-normal leading-5 text-[#62748E]"
                                style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tighter }}
                            >
                                Connect your wallet to view your balance and personal information for this deal.
                            </p>
                            <ConnectButton chainStatus="icon" showBalance={false} />
                        </div>
                    </TabsContent>
                ) : (
                    <TabsContent value="your-info" className="mt-6">
                        <div className="flex flex-col gap-4">
                            {/* Wallet Balance Section */}
                            <div className="flex flex-col pb-4 border-b border-[#E2E8F0]">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-[#F1F5F9] rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Wallet className="w-5 h-5 text-[#62748E]" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span
                                            className="text-sm leading-5 font-normal text-[#45556C]"
                                            style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tighter }}
                                        >
                                            Wallet balance
                                        </span>
                                        <span
                                            className="text-base leading-5 font-normal text-[#0F172B]"
                                            style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tight }}
                                        >
                                            {formatCurrency(walletBalanceUnderlying)} USDC
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                )}
            </Tabs>

            {/* Desktop: Show Overview content directly without tabs */}
            <div className="hidden lg:block">
                {renderOverviewContent()}
            </div>
        </InfoCard>
    );
};


