import React from 'react';
import { AlertCircle } from 'lucide-react';
import { InfoCard } from '@/components/ui/InfoCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/formatters';
import { INVESTMENT, TYPOGRAPHY } from '@/lib/constants';

interface InvestmentDetailsCardProps {
    apy: number;
    onInvest: () => void;
    investmentError?: string | null;
}

export const InvestmentDetailsCard: React.FC<InvestmentDetailsCardProps> = ({ apy, onInvest, investmentError }) => {
    return (
        <InfoCard style={{ padding: '25px 25px 25px', gap: '16px' }}>
            <SectionHeader>Investment Details</SectionHeader>

            <div className="bg-[#ECFDF5] rounded-lg p-4 flex flex-col items-center gap-1">
                <span
                    className="text-sm leading-5 font-normal text-[#45556C] text-center"
                    style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tighter }}
                >
                    Target Yield
                </span>
                <span
                    className="text-[30px] leading-9 font-normal text-[#4E8C37] text-center"
                    style={{ letterSpacing: TYPOGRAPHY.letterSpacing.wide }}
                >
                    {apy.toFixed(1)}%
                </span>
                <span
                    className="text-sm leading-5 font-normal text-[#45556C] text-center"
                    style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tighter }}
                >
                    APY
                </span>
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                    <span
                        className="text-sm leading-5 font-normal text-[#45556C]"
                        style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tighter }}
                    >
                        Min Investment
                    </span>
                    <span
                        className="text-sm leading-5 font-normal text-[#0F172B]"
                        style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tighter }}
                    >
                        {formatCurrency(INVESTMENT.MIN_INVESTMENT)}
                    </span>
                </div>
                <div className="flex justify-between items-center">
                    <span
                        className="text-sm leading-5 font-normal text-[#45556C]"
                        style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tighter }}
                    >
                        Duration
                    </span>
                    <span
                        className="text-sm leading-5 font-normal text-[#0F172B]"
                        style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tighter }}
                    >
                        {INVESTMENT.DEAL_DURATION_DAYS} days
                    </span>
                </div>
                <div className="flex justify-between items-center">
                    <span
                        className="text-sm leading-5 font-normal text-[#45556C]"
                        style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tighter }}
                    >
                        Maturity
                    </span>
                    <span
                        className="text-sm leading-5 font-normal text-[#0F172B]"
                        style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tighter }}
                    >
                        June 15, 2026
                    </span>
                </div>
            </div>

            <Button
                onClick={onInvest}
                className="w-full bg-[#4E8C37] hover:bg-[#3A6A28] text-white rounded-md h-10"
                style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tight }}
            >
                Invest Now
            </Button>

            <Button
                variant="outline"
                className="w-full bg-[#FAFAFA] border border-[#CAD5E2] text-[#314158] hover:bg-gray-50 rounded-md h-10"
                style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tight }}
            >
                Download Prospectus
            </Button>

            {/* Error Message - Below Download Prospectus Button */}
            {investmentError && (
                <div className="flex items-start gap-2 bg-[#FEF2F2] border border-[#FEE2E2] rounded-md px-3 py-2 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="w-4 h-4 text-[#DC2626] flex-shrink-0 mt-0.5" />
                    <p className="text-sm leading-5 font-normal text-[#DC2626]" style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tighter }}>
                        {investmentError}
                    </p>
                </div>
            )}
        </InfoCard>
    );
};


