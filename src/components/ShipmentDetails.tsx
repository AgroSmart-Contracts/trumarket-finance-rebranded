'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { DealDetails } from '@/types';
import { useICPShipment } from '@/hooks/useICPShipments';
import { calculateAPY, calculateInvestmentLimits } from '@/lib/financialCalculations';
import { parseNumericString, formatCurrency } from '@/lib/formatters';
import {
    HEADER_HEIGHT,
    HEADER_PADDING_Y,
    HEADER_CONTENT_HEIGHT,
    TYPOGRAPHY,
    SHADOWS,
    INVESTMENT,
    COPY_TIMEOUT,
} from '@/lib/constants';
import { Button } from '@/components/ui/button';
import InvestmentReview from './InvestmentReview';
import InvestmentSuccess from './InvestmentSuccess';
import { Footer } from '@/components/Scaffold';
import {
    DealOverviewCard,
    FinancialInformationCard,
    InvestmentAmountCard,
    InvestmentSummaryCard,
    InvestmentDetailsCard,
    SmartContractCard,
} from './deals';

interface InvestmentCalculations {
    investmentValue: number;
    estimatedReturns: number;
    managementFee: number;
    netReturns: number;
    totalAtMaturity: number;
}

/**
 * Calculates investment returns based on amount and APY
 */
const calculateInvestmentReturns = (
    investmentAmount: string,
    apy: number
): InvestmentCalculations => {
    const investmentValue = parseNumericString(investmentAmount);
    const daysRatio = INVESTMENT.DEAL_DURATION_DAYS / INVESTMENT.DAYS_PER_YEAR;
    const estimatedReturns = investmentValue * (apy / 100) * daysRatio;
    const managementFee = investmentValue * INVESTMENT.MANAGEMENT_FEE_RATE * daysRatio;
    const netReturns = estimatedReturns - managementFee;
    const totalAtMaturity = investmentValue + netReturns;

    return {
        investmentValue,
        estimatedReturns,
        managementFee,
        netReturns,
        totalAtMaturity,
    };
};

interface ShipmentDetailsPageProps {
    shipment: DealDetails;
}

const ShipmentDetailsPage: React.FC<ShipmentDetailsPageProps> = ({ shipment }) => {
    const router = useRouter();
    const [investmentAmount, setInvestmentAmount] = useState<string>('0');
    const [copied, setCopied] = useState(false);
    const [showReview, setShowReview] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [investmentError, setInvestmentError] = useState<string | null>(null);
    const apy = calculateAPY(shipment);

    const investmentCalculations = calculateInvestmentReturns(investmentAmount, apy);

    // Calculate investment limits based on deal amount
    const { min: minInvestment, max: maxInvestment } = calculateInvestmentLimits(shipment.investmentAmount || 0);

    // Calculate if invest button should be enabled
    const investmentValue = parseNumericString(investmentAmount);
    const isInvestButtonEnabled = investmentValue >= minInvestment && investmentValue <= maxInvestment;

    const handleCopy = useCallback(() => {
        if (shipment.vaultAddress) {
            navigator.clipboard.writeText(shipment.vaultAddress);
            setCopied(true);
            setTimeout(() => setCopied(false), COPY_TIMEOUT);
        }
    }, [shipment.vaultAddress]);

    const handleQuickAmount = useCallback((amount: number) => {
        setInvestmentAmount(amount.toString());
        setInvestmentError(null); // Clear error when amount changes
    }, []);

    // Clear error when investment amount changes
    useEffect(() => {
        setInvestmentError(null);
    }, [investmentAmount]);

    const handleInvest = useCallback(() => {
        const investmentValue = parseNumericString(investmentAmount);
        const { min, max } = calculateInvestmentLimits(shipment.investmentAmount || 0);

        // Clear any previous errors
        setInvestmentError(null);

        // Validate investment amount and show error message if invalid
        if (investmentValue <= 0 || isNaN(investmentValue)) {
            setInvestmentError(`Please enter a valid investment amount. Minimum: ${formatCurrency(min)}, Maximum: ${formatCurrency(max)}`);
            return;
        }

        if (investmentValue < min) {
            setInvestmentError(`Investment amount is too low. Minimum required: ${formatCurrency(min)}. Your amount: ${formatCurrency(investmentValue)}`);
            return;
        }

        if (investmentValue > max) {
            setInvestmentError(`Investment amount exceeds the maximum allowed. Maximum: ${formatCurrency(max)}. Your amount: ${formatCurrency(investmentValue)}`);
            return;
        }

        // If validation passes, proceed to review
        if (investmentValue >= min && investmentValue <= max) {
            setShowReview(true);
        }
    }, [investmentAmount, shipment.investmentAmount]);

    const handleGoBack = useCallback(() => {
        setShowReview(false);
    }, []);

    const handleCompleteInvestment = useCallback(() => {
        // TODO: Implement actual investment completion logic (blockchain transaction, API call, etc.)
        console.log('Completing investment', investmentCalculations);
        // Show success screen after investment completion
        setShowSuccess(true);
    }, [investmentCalculations]);

    // Show success screen if investment is complete
    if (showSuccess) {
        return (
            <InvestmentSuccess
                shipment={shipment}
                investmentAmount={investmentAmount}
            />
        );
    }

    // Show review screen if user clicked invest
    if (showReview) {
        return (
            <InvestmentReview
                shipment={shipment}
                investmentAmount={investmentAmount}
                onGoBack={handleGoBack}
                onComplete={handleCompleteInvestment}
            />
        );
    }

    const headerStyle = {
        padding: `${HEADER_PADDING_Y}px 16px`,
        height: `${HEADER_HEIGHT}px`,
    };

    return (
        <div className="w-full bg-[#FAFAFA] min-h-screen flex flex-col">
            {/* Top Navigation Bar */}
            <div
                className="bg-white border-b border-[#E2E8F0]"
                style={{ ...headerStyle, boxShadow: SHADOWS.card }}
            >
                <div
                    className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-0 px-4 sm:px-8"
                    style={{ minHeight: `${HEADER_CONTENT_HEIGHT}px` }}
                >
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/')}
                        className="flex items-center gap-2 text-[#314158] hover:bg-[#FAFAFA] rounded-md h-10 w-full sm:w-auto justify-center sm:justify-start"
                        style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tight }}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Back to Dashboard</span>
                        <span className="sm:hidden">Back</span>
                    </Button>
                    <Button
                        onClick={handleInvest}
                        className={`bg-[#4E8C37] hover:bg-[#3A6A28] text-white rounded-md h-10 px-4 sm:px-8 w-full sm:w-auto ${!isInvestButtonEnabled ? 'opacity-75 cursor-not-allowed' : ''}`}
                        style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tight }}
                        title={!isInvestButtonEnabled ? `Minimum investment is ${formatCurrency(minInvestment)}, Maximum is ${formatCurrency(maxInvestment)}` : undefined}
                    >
                        Invest Now
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 flex flex-col gap-4 sm:gap-6 w-full">
                {/* Deal Overview Card */}
                <DealOverviewCard shipment={shipment} />

                {/* Two Column Layout */}
                <div className="flex flex-col xl:flex-row gap-4 sm:gap-6">
                    {/* Left Column */}
                    <div className="flex-1 flex flex-col gap-6">
                        <FinancialInformationCard apy={apy} shipment={shipment} />
                        <InvestmentAmountCard
                            investmentAmount={investmentAmount}
                            setInvestmentAmount={setInvestmentAmount}
                            onQuickAmount={handleQuickAmount}
                            shipment={shipment}
                        />
                        <InvestmentSummaryCard
                            apy={apy}
                            calculations={investmentCalculations}
                        />
                    </div>

                    {/* Right Column */}
                    <div className="w-full lg:w-[320px] flex flex-col gap-6">
                        <InvestmentDetailsCard apy={apy} onInvest={handleInvest} investmentError={investmentError} />
                        <SmartContractCard
                            vaultAddress={shipment.vaultAddress}
                            copied={copied}
                            onCopy={handleCopy}
                        />
                    </div>
                </div>
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
};

// Main component wrapper
export default function ShipmentDetails() {
    const [shipmentDetails, setShipmentDetails] = useState<DealDetails | null>(null);
    const params = useParams();
    const id = params?.id as string;

    const { shipment: deal, loading, error } = useICPShipment(id);

    useEffect(() => {
        if (deal) {
            setShipmentDetails(deal);
        }
    }, [deal]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg text-gray-600">Loading...</div>
            </div>
        );
    }

    if (error || !shipmentDetails) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg text-gray-600">Shipment not found</div>
            </div>
        );
    }

    return <ShipmentDetailsPage shipment={shipmentDetails} />;
}
