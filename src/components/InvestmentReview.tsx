'use client';

import { useCallback } from 'react';
import { DealDetails } from '@/types';
import { calculateAPY } from '@/lib/financialCalculations';
import { formatCurrency, truncateAddress } from '@/lib/formatters';
import {
    COLORS,
    TYPOGRAPHY,
    INVESTMENT,
} from '@/lib/constants';
import {
    AlertTriangle,
    DollarSign,
    TrendingUp,
    Calendar,
    CheckCircle2,
    FileText,
    CheckCircle,
    Copy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InfoCard } from '@/components/ui/InfoCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { InfoRow } from '@/components/ui/InfoRow';
import { Badge } from '@/components/ui/badge';
import { RiskBadge } from '@/components/ui/RiskBadge';
import { InfoBox } from '@/components/ui/InfoBox';

interface InvestmentReviewProps {
    shipment: DealDetails;
    investmentAmount: string;
    onGoBack: () => void;
    onComplete: () => void;
}

interface InvestmentCalculations {
    investmentValue: number;
    grossReturns: number;
    managementFee: number;
    netReturns: number;
    totalAtMaturity: number;
}

/**
 * Calculates investment returns for review screen
 */
const calculateReviewReturns = (
    investmentAmount: string,
    apy: number
): InvestmentCalculations => {
    const investmentValue = parseFloat(investmentAmount.replace(/[^0-9.]/g, '')) || 0;
    const daysRatio = INVESTMENT.DEAL_DURATION_DAYS / INVESTMENT.DAYS_PER_YEAR;
    const grossReturns = investmentValue * (apy / 100) * daysRatio;
    const managementFee = investmentValue * INVESTMENT.MANAGEMENT_FEE_RATE * daysRatio;
    const netReturns = grossReturns - managementFee;
    const totalAtMaturity = investmentValue + netReturns;

    return {
        investmentValue,
        grossReturns,
        managementFee,
        netReturns,
        totalAtMaturity,
    };
};

const InvestmentReview: React.FC<InvestmentReviewProps> = ({
    shipment,
    investmentAmount,
    onGoBack,
    onComplete,
}) => {
    const apy = calculateAPY(shipment);
    const calculations = calculateReviewReturns(investmentAmount, apy);

    const handleCopy = useCallback(() => {
        if (shipment.vaultAddress) {
            navigator.clipboard.writeText(shipment.vaultAddress);
        }
    }, [shipment.vaultAddress]);

    const handleComplete = useCallback(() => {
        onComplete();
    }, [onComplete]);

    return (
        <div className="w-full bg-[#FAFAFA] min-h-screen flex flex-col">
            {/* Main Content Container */}
            <div className="flex-1 flex items-center justify-center py-4 sm:py-8 px-4">
                <div
                    className="bg-white border border-[#E2E8F0] rounded-lg flex flex-col w-full max-w-2xl"
                    style={{
                        boxShadow: '0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -4px rgba(0, 0, 0, 0.1)',
                    }}
                >
                    {/* Header Section */}
                    <div className="border-b border-[#E2E8F0] relative" style={{ height: '257px' }}>
                        {/* Warning Icon */}
                        <div
                            className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center rounded-full"
                            style={{
                                width: '64px',
                                height: '64px',
                                top: '32px',
                                backgroundColor: COLORS.chart.yellowLight,
                            }}
                        >
                            <AlertTriangle className="w-8 h-8 text-[#EEBA32]" />
                        </div>

                        {/* Title */}
                        <div
                            className="absolute left-1/2 transform -translate-x-1/2 text-center"
                            style={{ top: '112px', width: '634px' }}
                        >
                            <h2
                                className="text-base leading-6 font-normal text-[#0F172B]"
                                style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tight }}
                            >
                                Confirm Your Investment
                            </h2>
                        </div>

                        {/* Subtitle */}
                        <div
                            className="absolute left-1/2 transform -translate-x-1/2 text-center"
                            style={{ top: '144px', width: '634px' }}
                        >
                            <p
                                className="text-base leading-6 font-normal text-[#62748E]"
                                style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tight }}
                            >
                                Please review your investment details carefully before proceeding
                            </p>
                        </div>

                        {/* Progress Indicator */}
                        <div
                            className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-[#F1F5F9] rounded-lg px-4 py-2"
                            style={{ top: '184px', height: '40px' }}
                        >
                            <span
                                className="text-sm leading-5 font-normal text-[#45556C]"
                                style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tighter }}
                            >
                                Step 2 of 2:
                            </span>
                            <span
                                className="text-base leading-6 font-normal text-[#0F172B]"
                                style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tight }}
                            >
                                Final Confirmation
                            </span>
                        </div>
                    </div>

                    {/* Deal Information Section */}
                    <div
                        className="border-b border-[#E2E8F0] flex flex-col"
                        style={{ padding: '16px 16px 16px', gap: '16px' }}
                    >
                        <SectionHeader>Deal Information</SectionHeader>

                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-center">
                                <span
                                    className="text-base leading-6 font-normal text-[#45556C]"
                                    style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tight }}
                                >
                                    Deal Name
                                </span>
                                <span
                                    className="text-base leading-6 font-normal text-[#0F172B]"
                                    style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tight }}
                                >
                                    {shipment.name}
                                </span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span
                                    className="text-base leading-6 font-normal text-[#45556C]"
                                    style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tight }}
                                >
                                    Commodity Type
                                </span>
                                <Badge variant="commodity">{shipment.origin || 'Grain'}</Badge>
                            </div>

                            <div className="flex justify-between items-center">
                                <span
                                    className="text-base leading-6 font-normal text-[#45556C]"
                                    style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tight }}
                                >
                                    Risk Tier
                                </span>
                                <Badge variant="risk">Low Risk</Badge>
                            </div>
                        </div>
                    </div>

                    {/* Investment Details Section */}
                    <div
                        className="border-b border-[#E2E8F0] flex flex-col"
                        style={{ padding: '16px 16px 16px', gap: '16px' }}
                    >
                        <SectionHeader>Investment Details</SectionHeader>

                        <div className="flex flex-col gap-3">
                            <InfoRow
                                label="Investment Amount"
                                value={formatCurrency(calculations.investmentValue)}
                                icon={DollarSign}
                                backgroundColor={COLORS.background.cardGray}
                                height="60px"
                            />
                            <InfoRow
                                label="Expected APY"
                                value={`${apy.toFixed(1)}%`}
                                icon={TrendingUp}
                                iconColor={COLORS.primary.green}
                                subtitle={`Over ${INVESTMENT.DEAL_DURATION_DAYS} days`}
                                backgroundColor={COLORS.chart.greenLight}
                                valueColor={COLORS.primary.green}
                                height="72px"
                            />
                            <InfoRow
                                label="Maturity Date"
                                value="June 15, 2026"
                                icon={Calendar}
                                backgroundColor={COLORS.background.cardGray}
                                height="56px"
                            />
                        </div>

                        {/* Returns Summary */}
                        <div
                            className="bg-[#F8FAFC] rounded-lg px-4 py-4 flex flex-col gap-3"
                            style={{ marginTop: '12px' }}
                        >
                            <div className="flex justify-between items-center">
                                <span
                                    className="text-sm leading-5 font-normal text-[#45556C]"
                                    style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tighter }}
                                >
                                    Gross Returns
                                </span>
                                <span
                                    className="text-sm leading-5 font-normal text-[#0F172B]"
                                    style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tighter }}
                                >
                                    {formatCurrency(calculations.grossReturns)}
                                </span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span
                                    className="text-sm leading-5 font-normal text-[#45556C]"
                                    style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tighter }}
                                >
                                    Management Fee
                                </span>
                                <span
                                    className="text-sm leading-5 font-normal text-[#0F172B]"
                                    style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tighter }}
                                >
                                    {formatCurrency(calculations.managementFee)}
                                </span>
                            </div>

                            <div className="pt-3 border-t border-[#E2E8F0] flex justify-between items-center">
                                <span
                                    className="text-base leading-6 font-normal text-[#0F172B]"
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

                            <div className="pt-3 border-t border-[#E2E8F0] flex justify-between items-center">
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
                    </div>

                    {/* Collateral & Security Section */}
                    <div
                        className="border-b border-[#E2E8F0] flex flex-col"
                        style={{ padding: '16px 16px 16px', gap: '16px' }}
                    >
                        <SectionHeader>Collateral & Security</SectionHeader>
                        <InfoBox variant="info" icon={CheckCircle2}>
                            <p
                                className="text-base leading-6 font-normal"
                                style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tight }}
                            >
                                <span className="text-[#0F172B]">Your investment is secured by: </span>
                                <span className="text-[#314158]">Physical inventory + Insurance</span>
                            </p>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-[#4E8C37]" />
                                <span
                                    className="text-sm leading-5 font-normal text-[#45556C]"
                                    style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tighter }}
                                >
                                    Collateral Ratio: 375%
                                </span>
                            </div>
                        </InfoBox>
                    </div>

                    {/* Smart Contract Section */}
                    <div
                        className="border-b border-[#E2E8F0] flex flex-col"
                        style={{ padding: '16px 16px 16px' }}
                    >
                        <div
                            className="flex justify-between items-center px-4 py-4 bg-[#F8FAFC] rounded-lg"
                            style={{ height: '76px' }}
                        >
                            <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-[#4E8C37]" />
                                <div className="flex flex-col gap-1">
                                    <span
                                        className="text-sm leading-5 font-normal text-[#0F172B]"
                                        style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tighter }}
                                    >
                                        View Smart Contract
                                    </span>
                                    <span
                                        className="text-xs leading-4 font-normal text-[#62748E] font-mono"
                                    >
                                        {shipment.vaultAddress
                                            ? truncateAddress(shipment.vaultAddress, 20, 4)
                                            : '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb...'}
                                    </span>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCopy}
                                className="p-2 h-9 w-9"
                            >
                                <Copy className="w-4 h-4 text-[#90A1B9]" />
                            </Button>
                        </div>
                    </div>

                    {/* Important Notice Section */}
                    <div
                        className="border-b border-[#E2E8F0] flex flex-col"
                        style={{ padding: '16px 16px 16px' }}
                    >
                        <InfoBox variant="warning" icon={AlertTriangle}>
                            <p
                                className="text-sm leading-5 font-bold text-[#314158]"
                                style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tighter }}
                            >
                                Important Notice:
                            </p>
                            <ul className="flex flex-col gap-1 pl-5 list-disc">
                                <li
                                    className="text-sm leading-5 font-normal text-[#45556C]"
                                    style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tighter }}
                                >
                                    Investments are subject to market risk
                                </li>
                                <li
                                    className="text-sm leading-5 font-normal text-[#45556C]"
                                    style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tighter }}
                                >
                                    Past performance does not guarantee future returns
                                </li>
                                <li
                                    className="text-sm leading-5 font-normal text-[#45556C]"
                                    style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tighter }}
                                >
                                    Funds will be locked until maturity date
                                </li>
                                <li
                                    className="text-sm leading-5 font-normal text-[#45556C]"
                                    style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tighter }}
                                >
                                    Early withdrawal may incur penalties
                                </li>
                            </ul>
                        </InfoBox>
                    </div>

                    {/* Action Buttons */}
                    <div
                        className="flex flex-col gap-4"
                        style={{ padding: '16px 16px 16px' }}
                    >
                        <div className="flex gap-4">
                            <Button
                                variant="outline"
                                onClick={onGoBack}
                                className="flex-1 bg-[#FAFAFA] border border-[#CAD5E2] text-[#314158] hover:bg-gray-50 rounded-md h-12"
                                style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tight }}
                            >
                                Go Back
                            </Button>
                            <Button
                                onClick={handleComplete}
                                className="flex-1 bg-[#4E8C37] hover:bg-[#3A6A28] text-white rounded-md h-12"
                                style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tight }}
                            >
                                Complete Investment
                            </Button>
                        </div>

                        <p
                            className="text-xs leading-4 font-normal text-[#62748E] text-center"
                        >
                            By clicking "Complete Investment", you agree to the terms and conditions
                            of this investment.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvestmentReview;
