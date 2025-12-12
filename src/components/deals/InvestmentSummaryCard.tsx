import React from 'react';
import { AlertCircle } from 'lucide-react';
import { InfoCard } from '@/components/ui/InfoCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { InfoBox } from '@/components/ui/InfoBox';
import { formatCurrency } from '@/lib/formatters';
import { INVESTMENT, COLORS, TYPOGRAPHY } from '@/lib/constants';

interface InvestmentCalculations {
    investmentValue: number;
    estimatedReturns: number;
    managementFee: number;
    netReturns: number;
    totalAtMaturity: number;
}

interface InvestmentSummaryCardProps {
    apy: number;
    calculations: InvestmentCalculations;
}

interface SummaryRowProps {
    label: string;
    value: string;
    subtitle?: string;
    backgroundColor?: string;
    valueColor?: string;
}

const SummaryRow: React.FC<SummaryRowProps> = ({
    label,
    value,
    subtitle,
    backgroundColor = COLORS.background.cardGray,
    valueColor = COLORS.text.dark,
}) => {
    const height = subtitle ? '76px' : '60px';
    return (
        <div
            className="flex justify-between items-center px-4 py-3 rounded-lg"
            style={{ backgroundColor, height }}
        >
            {subtitle ? (
                <div className="flex flex-col">
                    <span
                        className="text-base leading-6 font-normal text-[#45556C]"
                        style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tight }}
                    >
                        {label}
                    </span>
                    <span
                        className="text-sm leading-5 font-normal text-[#62748E]"
                        style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tighter }}
                    >
                        {subtitle}
                    </span>
                </div>
            ) : (
                <span
                    className="text-base leading-6 font-normal text-[#45556C]"
                    style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tight }}
                >
                    {label}
                </span>
            )}
            <span
                className="text-xl leading-7 font-normal"
                style={{ color: valueColor, letterSpacing: TYPOGRAPHY.letterSpacing.tightest }}
            >
                {value}
            </span>
        </div>
    );
};

export const InvestmentSummaryCard: React.FC<InvestmentSummaryCardProps> = ({ apy, calculations }) => {
    return (
        <InfoCard style={{ padding: '25px 25px 25px', gap: '24px' }}>
            <SectionHeader>Investment Summary</SectionHeader>

            <div className="flex flex-col gap-4">
                <SummaryRow
                    label="Investment Amount"
                    value={formatCurrency(calculations.investmentValue)}
                    backgroundColor={COLORS.background.cardGray}
                />
                <SummaryRow
                    label="Estimated Returns"
                    value={formatCurrency(calculations.estimatedReturns)}
                    subtitle={`@ ${apy.toFixed(1)}% APY over ${INVESTMENT.DEAL_DURATION_DAYS} days`}
                    backgroundColor={COLORS.chart.greenLight}
                    valueColor={COLORS.primary.green}
                />
                <SummaryRow
                    label="Management Fee (0% annually)"
                    value={formatCurrency(calculations.managementFee)}
                    backgroundColor={COLORS.background.cardGray}
                />
                <div className="pt-[17px] border-t border-[#E2E8F0] flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                        <span
                            className="text-base leading-6 font-normal text-[#45556C]"
                            style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tight }}
                        >
                            Net Returns
                        </span>
                        <span
                            className="text-xl leading-7 font-normal text-[#4E8C37]"
                            style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tightest }}
                        >
                            {formatCurrency(calculations.netReturns)}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span
                            className="text-base leading-6 font-normal text-[#0F172B]"
                            style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tight }}
                        >
                            Total at Maturity
                        </span>
                        <span
                            className="text-2xl leading-8 font-normal text-[#0F172B]"
                            style={{ letterSpacing: TYPOGRAPHY.letterSpacing.normal }}
                        >
                            {formatCurrency(calculations.totalAtMaturity)}
                        </span>
                    </div>
                </div>

                {/* Collateral Information Box */}
                <InfoBox variant="warning" icon={AlertCircle}>
                    <p
                        className="text-sm leading-5 font-normal text-[#314158]"
                        style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tighter }}
                    >
                        <span className="font-bold">Collateral:</span> Physical inventory +
                        Insurance.
                    </p>
                    <p
                        className="text-sm leading-5 font-normal text-[#314158]"
                        style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tighter }}
                    >
                        Your investment is secured by institutional-grade collateral and verified
                        through blockchain smart contracts.
                    </p>
                </InfoBox>
            </div>
        </InfoCard>
    );
};


