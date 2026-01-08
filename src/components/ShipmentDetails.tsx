'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { DealDetails } from '@/types';
import { useICPShipment } from '@/hooks/useICPShipments';
import { calculateAPY, calculateInvestmentLimits } from '@/lib/financialCalculations';
import { parseNumericString, formatCurrency } from '@/lib/formatters';
import useWallet from '@/hooks/useWallet';
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
    YourInfoCard,
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
    const { wallet, connectMetaMask, refreshBalances } = useWallet();
    const [investmentAmount, setInvestmentAmount] = useState<string>('0');
    const [copied, setCopied] = useState(false);
    const [showReview, setShowReview] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [investmentError, setInvestmentError] = useState<string | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);
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

    const handleInvest = useCallback(async () => {
        const investmentValue = parseNumericString(investmentAmount);
        const { min, max } = calculateInvestmentLimits(shipment.investmentAmount || 0);

        // Clear any previous errors
        setInvestmentError(null);

        // Step 1: Check if wallet is connected, if not, connect it
        if (!wallet?.address) {
            setIsConnecting(true);
            try {
                await connectMetaMask();
                // Wait for wallet state to update and balances to refresh
                // Poll for wallet state update (check multiple times)
                let attempts = 0;
                const maxAttempts = 10;
                while (attempts < maxAttempts && !wallet?.address) {
                    await new Promise(resolve => setTimeout(resolve, 200));
                    attempts++;
                }
                await refreshBalances();
            } catch (error) {
                setInvestmentError('Failed to connect wallet. Please try again.');
                setIsConnecting(false);
                return;
            } finally {
                setIsConnecting(false);
            }

            // After connecting, check if wallet is now available
            // If still not connected after polling, ask user to try again
            if (!wallet?.address) {
                setInvestmentError('Wallet connected. Please click "Invest Now" again to proceed.');
                return;
            }
        }

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

        // Step 2: Ensure wallet is connected (double-check after validations)
        if (!wallet?.address) {
            setInvestmentError('Please connect your wallet to proceed with the investment.');
            return;
        }

        // Step 3: Check wallet balance
        const walletBalance = wallet.balanceUnderlying ?? 0;
        if (walletBalance < investmentValue) {
            setInvestmentError(`Insufficient wallet balance. You have ${formatCurrency(walletBalance)} USDC, but need ${formatCurrency(investmentValue)} USDC to invest.`);
            return;
        }

        // If all validation passes, proceed to review
        if (investmentValue >= min && investmentValue <= max && walletBalance >= investmentValue) {
            setShowReview(true);
        }
    }, [investmentAmount, shipment.investmentAmount, wallet, connectMetaMask, refreshBalances]);

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

    return (
        <div className="w-full bg-[#FAFAFA] min-h-screen flex flex-col">
            {/* Header - Matching Dashboard Structure */}
            <header
                className="fixed top-0 w-full z-50 bg-white border-b border-[#E2E8F0]"
                style={{ boxShadow: SHADOWS.card }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        {/* Left Section: Logo and Branding */}
                        <div className="flex items-center gap-2 sm:gap-4">
                            <Button
                                variant="ghost"
                                onClick={() => router.push('/')}
                                className="flex items-center gap-2 text-[#314158] hover:bg-[#FAFAFA] rounded-md h-8 p-2 -ml-2"
                                style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tight }}
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span className=" text-sm">Back</span>
                            </Button>

                        </div>

                        {/* Right Section: Invest Now Button */}
                        <div className="flex items-center gap-3">
                            <Button
                                onClick={handleInvest}
                                disabled={isConnecting || !isInvestButtonEnabled}
                                className={`bg-[#4E8C37] hover:bg-[#3A6A28] text-white flex items-center gap-2 shadow-sm hover:shadow-md transition-all duration-200 ${!isInvestButtonEnabled ? 'opacity-75 cursor-not-allowed' : ''} ${isConnecting ? 'opacity-75 cursor-not-allowed' : ''}`}
                                style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tight }}
                                title={!isInvestButtonEnabled ? `Minimum investment is ${formatCurrency(minInvestment)}, Maximum is ${formatCurrency(maxInvestment)}` : undefined}
                            >
                                <span className="font-medium">{isConnecting ? 'Connecting...' : 'Invest Now'}</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content - With padding-top to account for fixed header */}
            <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 flex flex-col gap-4 sm:gap-6 w-full mt-[72px]">
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
                        {/* Your Info Card - Desktop only, shown above Investment Details */}
                        <div className="hidden lg:block">
                            <YourInfoCard apy={apy} shipment={shipment} />
                        </div>
                        <InvestmentDetailsCard apy={apy} onInvest={handleInvest} investmentError={investmentError} isConnecting={isConnecting} />
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
