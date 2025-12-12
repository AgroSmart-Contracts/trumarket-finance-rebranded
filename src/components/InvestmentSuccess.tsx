'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DealDetails } from '@/types';
import { calculateAPY } from '@/lib/financialCalculations';
import { formatCurrency } from '@/lib/formatters';
import {
    COLORS,
    TYPOGRAPHY,
    INVESTMENT,
} from '@/lib/constants';
import {
    CheckCircle2,
    TrendingUp,
    Calendar,
    Shield,
    ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InfoCard } from '@/components/ui/InfoCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Badge } from '@/components/ui/badge';
import { InfoRow } from '@/components/ui/InfoRow';
import { StepIndicator } from '@/components/ui/StepIndicator';

interface InvestmentSuccessProps {
    shipment: DealDetails;
    investmentAmount: string;
    confirmationNumber?: string;
}

/**
 * Generates a confirmation number for the investment
 */
const generateConfirmationNumber = (): string => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 10000);
    return `INV-${year}-${randomNum}`;
};

const InvestmentSuccess: React.FC<InvestmentSuccessProps> = ({
    shipment,
    investmentAmount,
    confirmationNumber,
}) => {
    const router = useRouter();
    const apy = calculateAPY(shipment);
    const investmentValue = parseFloat(investmentAmount.replace(/[^0-9.]/g, '')) || 0;
    const confirmationId = confirmationNumber || generateConfirmationNumber();

    const handleReturnToDashboard = useCallback(() => {
        router.push('/');
    }, [router]);

    return (
        <div className="w-full bg-[#FAFAFA] min-h-screen flex flex-col">
            {/* Main Content Container */}
            <div className="flex-1 flex items-center justify-center py-8 px-4">
                <InfoCard
                    className="flex flex-col w-full max-w-xl"
                    style={{
                        boxShadow: '0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -4px rgba(0, 0, 0, 0.1)',
                    }}
                >
                    {/* Header Section */}
                    <div className="border-b border-[#E2E8F0] relative flex flex-col items-center" style={{ height: '217px', paddingTop: '32px' }}>
                        {/* Success Icon */}
                        <div
                            className="flex items-center justify-center rounded-full mb-6"
                            style={{
                                width: '80px',
                                height: '80px',
                                backgroundColor: 'rgba(78, 140, 55, 0.1)',
                            }}
                        >
                            <CheckCircle2 className="w-12 h-12 text-[#4E8C37]" strokeWidth={4} />
                        </div>

                        {/* Title */}
                        <h2
                            className="text-base leading-6 font-normal text-[#0F172B] mb-2"
                            style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tight }}
                        >
                            Investment Confirmed!
                        </h2>

                        {/* Subtitle */}
                        <p
                            className="text-base leading-6 font-normal text-[#62748E] text-center px-8"
                            style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tight }}
                        >
                            Your investment is now active and earning returns
                        </p>
                    </div>

                    {/* Deal Information Section */}
                    <div
                        className="border-b border-[#E2E8F0] flex flex-col"
                        style={{ padding: '16px 16px 16px', gap: '24px' }}
                    >
                        <div className="flex flex-col gap-2">
                            <span
                                className="text-sm leading-5 font-normal text-[#62748E]"
                                style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tighter }}
                            >
                                You invested in
                            </span>
                            <h3
                                className="text-base leading-6 font-normal text-[#0F172B]"
                                style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tight }}
                            >
                                {shipment.name}
                            </h3>
                            <Badge variant="commodity">{shipment.origin || 'Grain'}</Badge>
                        </div>

                        {/* Info Cards */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div
                                className="bg-[#F8FAFC] rounded-lg flex flex-col gap-2 flex-1"
                                style={{ padding: '16px 16px 16px', minHeight: '92px' }}
                            >
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-[#4E8C37]" />
                                    <span
                                        className="text-sm leading-5 font-normal text-[#45556C]"
                                        style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tighter }}
                                    >
                                        Expected Yield
                                    </span>
                                </div>
                                <span
                                    className="text-2xl leading-8 font-normal text-[#4E8C37]"
                                    style={{ letterSpacing: TYPOGRAPHY.letterSpacing.normal }}
                                >
                                    {apy.toFixed(1)}%
                                </span>
                            </div>
                            <div
                                className="bg-[#F8FAFC] rounded-lg flex flex-col gap-2 flex-1"
                                style={{ padding: '16px 16px 0px', minHeight: '92px' }}
                            >
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-[#45556C]" />
                                    <span
                                        className="text-sm leading-5 font-normal text-[#45556C]"
                                        style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tighter }}
                                    >
                                        Maturity Date
                                    </span>
                                </div>
                                <span
                                    className="text-base leading-6 font-normal text-[#0F172B]"
                                    style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tight }}
                                >
                                    June 15, 2026
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Investment Summary Section */}
                    <div
                        className="border-b border-[#E2E8F0] flex flex-col"
                        style={{ padding: '16px 16px 16px', gap: '16px' }}
                    >
                        <SectionHeader>Investment Summary</SectionHeader>

                        <div className="flex flex-col gap-3">
                            <InfoRow
                                label="Amount Invested"
                                value={formatCurrency(investmentValue)}
                                backgroundColor={COLORS.chart.greenLight}
                                valueColor={COLORS.primary.green}
                                height="64px"
                            />
                            <div
                                className="bg-[#F8FAFC] rounded-lg flex flex-col gap-1"
                                style={{ padding: '16px' }}
                            >
                                <div className="flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-[#4E8C37]" />
                                    <span
                                        className="text-sm leading-5 font-normal text-[#0F172B]"
                                        style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tighter }}
                                    >
                                        Collateral Protection
                                    </span>
                                </div>
                                <span
                                    className="text-sm leading-5 font-normal text-[#45556C] pl-7"
                                    style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tighter }}
                                >
                                    Physical inventory + Insurance
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* What Happens Next Section */}
                    <div
                        className="flex flex-col"
                        style={{ padding: '16px 16px 16px', gap: '12px' }}
                    >
                        <SectionHeader>What happens next?</SectionHeader>
                        <StepIndicator
                            steps={[
                                {
                                    number: 1,
                                    title: 'Deal Activated',
                                    description: 'Your investment is now live and visible in your Active Deals',
                                },
                                {
                                    number: 2,
                                    title: 'Collateral Secured',
                                    description: 'Your investment is backed by verified collateral',
                                },
                                {
                                    number: 3,
                                    title: 'Tracking & Updates',
                                    description: 'Monitor progress and receive updates throughout the deal lifecycle',
                                },
                                {
                                    number: 4,
                                    title: 'Maturity & Returns',
                                    description: 'Receive your principal + returns on June 15, 2026',
                                },
                            ]}
                        />

                        {/* Return to Dashboard Button */}
                        <div className="mt-8 flex flex-col gap-3">
                            <Button
                                onClick={handleReturnToDashboard}
                                className="w-full bg-[#4E8C37] hover:bg-[#3A6A28] text-white rounded-md h-12 flex items-center justify-center gap-2"
                                style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tight }}
                            >
                                Return to Dashboard
                                <ArrowRight className="w-4 h-4" />
                            </Button>

                            <p
                                className="text-sm leading-5 font-normal text-[#62748E] text-center"
                                style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tighter }}
                            >
                                Track your investment in the Active Deals section
                            </p>
                        </div>
                    </div>

                    {/* Confirmation Number */}
                    <div
                        className="flex items-center justify-center gap-2 py-4"
                        style={{ borderTop: '1px solid #E2E8F0' }}
                    >
                        <span
                            className="text-sm leading-5 font-normal text-[#62748E]"
                            style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tighter }}
                        >
                            Confirmation #:
                        </span>
                        <span
                            className="text-sm leading-5 font-normal text-[#0F172B]"
                            style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tighter }}
                        >
                            {confirmationId}
                        </span>
                    </div>
                </InfoCard>
            </div>
        </div>
    );
};

export default InvestmentSuccess;
