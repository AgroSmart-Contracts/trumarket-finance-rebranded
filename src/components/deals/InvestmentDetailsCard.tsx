import React from 'react';
import { AlertCircle } from 'lucide-react';
import { InfoCard } from '@/components/ui/InfoCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/formatters';
import { TYPOGRAPHY } from '@/lib/constants';
import { DealDetails } from '@/types';
import { calculateInvestmentLimits } from '@/lib/financialCalculations';
import { calculateDuration } from '@/lib/dealUtils';
import { formatDateShort } from '@/lib/dateUtils';

interface InvestmentDetailsCardProps {
    apy: number;
    deal: DealDetails;
    onInvest: () => void;
    investmentError?: string | null;
}

export const InvestmentDetailsCard: React.FC<InvestmentDetailsCardProps> = ({ apy, deal, onInvest, investmentError }) => {
    // Calculate min investment (10% of deal amount)
    const { min: minInvestment } = calculateInvestmentLimits(deal.investmentAmount || 0);

    // Calculate duration from shipping dates
    const duration = deal.shippingStartDate && deal.expectedShippingEndDate
        ? calculateDuration(deal.shippingStartDate, deal.expectedShippingEndDate)
        : 0;

    // Format maturity date
    const maturityDate = deal.expectedShippingEndDate
        ? formatDateShort(deal.expectedShippingEndDate)
        : 'N/A';

    // Check if there are any documents/prospectus available
    const hasProspectus = deal.docs && Array.isArray(deal.docs) && deal.docs.length > 0;
    const isClosedDeal = deal.status === 'finished';

    const getProspectusUrl = (): string | undefined => {
        if (!hasProspectus) return undefined;
        const rawUrl = deal.docs[0]?.url;
        if (!rawUrl) return undefined;

        // If it's a Google Drive \"view\" link, convert it to a direct download URL
        // Example: https://drive.google.com/file/d/<FILE_ID>/view?usp=sharing
        const driveMatch = rawUrl.match(/https?:\/\/drive\.google\.com\/file\/d\/([^/]+)\//);
        if (driveMatch && driveMatch[1]) {
            const fileId = driveMatch[1];
            return `https://drive.google.com/uc?export=download&id=${fileId}`;
        }

        return rawUrl;
    };

    const handleDownloadProspectus = () => {
        const url = getProspectusUrl();
        if (!url) return;
        if (typeof window !== 'undefined') {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    };

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
                        {formatCurrency(minInvestment)}
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
                        {duration > 0 ? `${duration} days` : 'N/A'}
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
                        {maturityDate}
                    </span>
                </div>
            </div>

            <Button
                onClick={onInvest}
                disabled={isClosedDeal}
                className={`w-full rounded-md h-10 ${isClosedDeal
                    ? 'bg-[#E2E8F0] text-[#62748E] cursor-not-allowed'
                    : 'bg-[#4E8C37] hover:bg-[#3A6A28] text-white'
                    }`}
                style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tight }}
            >
                {isClosedDeal ? 'Deal Closed' : 'Invest Now'}
            </Button>

            <Button
                variant="outline"
                disabled={!hasProspectus}
                onClick={handleDownloadProspectus}
                className={`w-full bg-[#FAFAFA] border border-[#CAD5E2] text-[#314158] rounded-md h-10 transition-all duration-150 ${hasProspectus
                    ? 'hover:bg-[#F0F0F0] hover:border-[#A8B8CC] active:bg-[#E5E5E5] active:border-[#8FA0B5] active:scale-[0.98]'
                    : 'opacity-50 cursor-not-allowed'
                    }`}
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


