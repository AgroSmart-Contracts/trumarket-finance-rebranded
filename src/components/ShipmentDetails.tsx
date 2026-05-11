'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { DealDetails } from '@/types';
import { usePublishedDeal } from '@/hooks/usePublishedDeals';
import useTruMarketDeal from '@/hooks/useTruMarketDeal';
import { useWalletContext } from '@/context/wallet-context';
import { calculateAPY, calculateInvestmentLimits, calcYieldFromAPY } from '@/lib/financialCalculations';
import { calculateDuration } from '@/lib/dealUtils';
import { parseNumericString, formatCurrency } from '@/lib/formatters';
import {
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

// Hardcoded dealId for now - replace with actual dealId from shipment when available
// Format: uint256 (can be a hex string or decimal number)
const HARDCODED_DEAL_ID = '93774477864711353617895906050021268663475913441009956224925437412286814751714';

// TruMarket Deal / "Safe" contract address — sourced from env to match
// `useTruMarketDeal` and to keep deployment configuration in one place.
const SMART_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_SAFE_CONTRACT_ADDRESS || '';

interface InvestmentCalculations {
    investmentValue: number;
    estimatedReturns: number;
    managementFee: number;
    netReturns: number;
    totalAtMaturity: number;
}

/**
 * Calculates investment returns based on amount and APY using compound formula
 * Formula: TotalReturn = P × (1 + a)^t, where a = APY/100, t = days/365
 */
const calculateInvestmentReturns = (
    investmentAmount: string,
    apy: number,
    shipment: DealDetails
): InvestmentCalculations => {
    const investmentValue = parseNumericString(investmentAmount);

    // Get start and end dates from shipment
    const startDate = shipment.shippingStartDate
        ? new Date(shipment.shippingStartDate)
        : new Date();
    const endDate = shipment.expectedShippingEndDate
        ? new Date(shipment.expectedShippingEndDate)
        : new Date(Date.now() + INVESTMENT.DEAL_DURATION_DAYS * 24 * 60 * 60 * 1000);

    // Calculate yield and total return using compound formula
    const { yourYield, totalReturn } = calcYieldFromAPY({
        principal: investmentValue,
        apyPercent: apy,
        startDate,
        endDate,
        dayCountBasis: 365,
    });

    // Calculate management fee (0% currently, but keeping structure for future)
    const daysRatio = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24) / INVESTMENT.DAYS_PER_YEAR;
    const managementFee = investmentValue * INVESTMENT.MANAGEMENT_FEE_RATE * daysRatio;

    // Estimated returns = yield (profit)
    const estimatedReturns = yourYield;
    const netReturns = estimatedReturns - managementFee;
    const totalAtMaturity = totalReturn - managementFee;

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
    const { wallet, refreshBalances } = useWalletContext();
    const [investmentAmount, setInvestmentAmount] = useState<string>('0');
    const [copied, setCopied] = useState(false);
    const [showReview, setShowReview] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [investmentError, setInvestmentError] = useState<string | null>(null);
    const [isCompletingInvestment, setIsCompletingInvestment] = useState(false);
    const [userInvestedAmount, setUserInvestedAmount] = useState<number>(0);
    const [isLoadingInvestedAmount, setIsLoadingInvestedAmount] = useState(false);
    const { fundDeal, getUserInvestedAmount } = useTruMarketDeal();
    const fetchingRef = useRef<string | null>(null); // Track which address we're currently fetching
    const apy = calculateAPY(shipment);

    // Use input field value for calculations (always reflects what user is entering)
    // Only use contract value if user has invested AND input is empty/zero
    // This ensures Investment Summary always reflects the user's input when they're entering an amount
    const effectiveInvestmentAmount = useMemo(() => {
        const inputValue = parseNumericString(investmentAmount);

        // If user is entering an amount (input > 0), always use input value
        if (inputValue > 0) {
            return investmentAmount;
        }

        // If input is empty/zero and user has invested, show their invested amount
        if (wallet?.address && userInvestedAmount > 0) {
            return Math.round(userInvestedAmount).toString();
        }

        // Otherwise, use input value (even if 0)
        return investmentAmount;
    }, [wallet?.address, userInvestedAmount, investmentAmount]);

    const investmentCalculations = useMemo(() => {
        return calculateInvestmentReturns(effectiveInvestmentAmount, apy, shipment);
    }, [effectiveInvestmentAmount, apy, shipment]);

    // Calculate actual deal duration in days using the same utility function as other components
    const dealDurationDays = useMemo(() => {
        if (shipment.shippingStartDate && shipment.expectedShippingEndDate) {
            return calculateDuration(shipment.shippingStartDate, shipment.expectedShippingEndDate);
        }
        return INVESTMENT.DEAL_DURATION_DAYS; // Fallback to default if dates are missing
    }, [shipment.shippingStartDate, shipment.expectedShippingEndDate]);

    // Calculate investment limits based on deal amount
    const { min: minInvestment, max: maxInvestment } = calculateInvestmentLimits(shipment.investmentAmount || 0);

    // Calculate if invest button should be enabled
    const investmentValue = parseNumericString(investmentAmount);
    const isInvestButtonEnabled = investmentValue >= minInvestment && investmentValue <= maxInvestment;

    const handleCopy = useCallback(async () => {
        const { useCopyToClipboard } = await import('@/lib/clipboard');
        const copyFn = useCopyToClipboard(setCopied, COPY_TIMEOUT);
        await copyFn(SMART_CONTRACT_ADDRESS, 'Contract address copied', 'Failed to copy address');
    }, [setCopied]);

    const handleQuickAmount = useCallback((amount: number) => {
        // Format amount with no decimal places
        const formattedAmount = Math.round(amount).toString();
        setInvestmentAmount(formattedAmount);
        setInvestmentError(null); // Clear error when amount changes
    }, []);

    // Clear error when investment amount changes
    useEffect(() => {
        setInvestmentError(null);
    }, [investmentAmount]);

    // Fetch user's invested amount when wallet address changes
    // This calls balanceOf on the TruMarketDeal contract to get the LP tokens
    // (amount deposited when user called fundDeal)
    useEffect(() => {
        let isMounted = true;
        let timeoutId: NodeJS.Timeout | null = null;

        const fetchUserInvestedAmount = async () => {
            if (!wallet?.address) {
                if (isMounted) {
                    setUserInvestedAmount(0);
                    setIsLoadingInvestedAmount(false);
                    fetchingRef.current = null;
                }
                return;
            }

            // Don't fetch if already fetching for this address
            if (fetchingRef.current === wallet.address) {
                return;
            }

            // Mark that we're fetching for this address
            fetchingRef.current = wallet.address;

            if (isMounted) {
                setIsLoadingInvestedAmount(true);
            }

            try {
                // Add timeout to prevent infinite loading
                const timeoutPromise = new Promise<number>((_, reject) => {
                    timeoutId = setTimeout(() => {
                        reject(new Error('Timeout: Failed to fetch invested amount'));
                    }, 10000); // 10 second timeout
                });

                const fetchPromise = getUserInvestedAmount(HARDCODED_DEAL_ID, wallet.address);

                const invested = await Promise.race([fetchPromise, timeoutPromise]);

                if (isMounted) {
                    setUserInvestedAmount(invested);
                    setIsLoadingInvestedAmount(false);
                    fetchingRef.current = null; // Clear fetching flag on success
                }
            } catch (error) {
                console.error('Error fetching invested amount:', error);
                if (isMounted) {
                    setUserInvestedAmount(0);
                    setIsLoadingInvestedAmount(false);
                    fetchingRef.current = null; // Clear fetching flag on error
                }
            } finally {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
            }
        };

        // Small delay to ensure wallet is fully initialized
        const timer = setTimeout(() => {
            fetchUserInvestedAmount();
        }, 300);

        return () => {
            isMounted = false;
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            clearTimeout(timer);
        };
        // Only depend on wallet address, not getUserInvestedAmount to prevent re-fetch loops
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [wallet?.address]);

    // Refresh invested amount after successful investment
    const handleCompleteInvestment = useCallback(async () => {
        const investmentValue = parseNumericString(investmentAmount);

        if (investmentValue <= 0) {
            setInvestmentError('Invalid investment amount');
            return;
        }

        // Use hardcoded dealId for now
        const dealId = HARDCODED_DEAL_ID;

        setIsCompletingInvestment(true);
        setInvestmentError(null);

        try {
            // Call fundDeal on the TruMarketDeal contract
            await fundDeal(dealId, investmentValue);

            // Refresh user's invested amount after successful investment
            if (wallet?.address) {
                const invested = await getUserInvestedAmount(dealId, wallet.address);
                setUserInvestedAmount(invested);
            }

            // Show success screen after successful transaction
            setShowSuccess(true);
        } catch (error: any) {
            setInvestmentError(error.message || 'Failed to complete investment. Please try again.');
            // Don't show success screen on error
        } finally {
            setIsCompletingInvestment(false);
        }
    }, [investmentAmount, investmentCalculations, fundDeal, wallet?.address, getUserInvestedAmount]);

    const handleInvest = useCallback(async () => {
        console.log('Invest Now clicked', { investmentAmount, wallet: wallet?.address });

        const investmentValue = parseNumericString(investmentAmount);
        const { min, max } = calculateInvestmentLimits(shipment.investmentAmount || 0);

        console.log('Validation check', { investmentValue, min, max, walletAddress: wallet?.address, walletBalance: wallet?.balanceUnderlying });

        // Clear any previous errors
        setInvestmentError(null);

        // Step 1: Check if wallet is available (should already be connected via Web3Auth)
        if (!wallet?.address) {
            console.log('Wallet not connected');
            setInvestmentError('Wallet not connected. Please ensure you are logged in.');
            return;
        }

        // Validate investment amount and show error message if invalid
        if (investmentValue <= 0 || isNaN(investmentValue)) {
            setInvestmentError(`Please enter a valid investment amount. Minimum: ${formatCurrency(min)}, Maximum: ${formatCurrency(max)}`);
            return;
        }

        // if (investmentValue < min) {
        //     setInvestmentError(`Investment amount is too low. Minimum required: ${formatCurrency(min)}. Your amount: ${formatCurrency(investmentValue)}`);
        //     return;
        // }

        if (investmentValue > max) {
            setInvestmentError(`Investment amount exceeds the maximum allowed. Maximum: ${formatCurrency(max)}. Your amount: ${formatCurrency(investmentValue)}`);
            return;
        }

        // Step 2: Check wallet balance
        const walletBalance = wallet.balanceUnderlying ?? 0;
        if (walletBalance < investmentValue) {
            setInvestmentError(`Insufficient wallet balance. You have ${formatCurrency(walletBalance)} USDC, but need ${formatCurrency(investmentValue)} USDC to invest.`);
            return;
        }

        // If all validation passes, proceed to review
        console.log('All validations passed, showing review screen');
        setShowReview(true);
    }, [investmentAmount, shipment.investmentAmount, wallet]);

    const handleGoBack = useCallback(() => {
        setShowReview(false);
    }, []);

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
                isLoading={isCompletingInvestment}
                error={investmentError}
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
                            dealDurationDays={dealDurationDays}
                        />
                    </div>

                    {/* Right Column */}
                    <div className="w-full lg:w-[320px] flex flex-col gap-6">
                        {/* Your Info Card - Desktop only, shown above Investment Details */}
                        <div className="hidden lg:block">
                            <YourInfoCard
                                apy={apy}
                                shipment={shipment}
                                userInvestedAmount={userInvestedAmount}
                                isLoadingInvestedAmount={isLoadingInvestedAmount}
                            />
                        </div>
                        <InvestmentDetailsCard apy={apy} deal={shipment} onInvest={handleInvest} investmentError={investmentError} />
                        <SmartContractCard
                            vaultAddress={SMART_CONTRACT_ADDRESS}
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

    const { deal, loading, error } = usePublishedDeal(id);

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
