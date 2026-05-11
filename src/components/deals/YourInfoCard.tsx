import React, { useMemo } from 'react';
import { Wallet } from 'lucide-react';
import { useAccount, useReadContract } from 'wagmi';
import { erc20Abi, formatUnits } from 'viem';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { DealDetails } from '@/types';
import { InfoCard, SectionHeader } from '@/components/ui';
import { formatCurrency } from '@/lib/formatters';
import { calcYieldFromAPY } from '@/lib/financialCalculations';
import { TYPOGRAPHY, INVESTMENT } from '@/lib/constants';

interface YourInfoCardProps {
    apy: number;
    shipment: DealDetails;
    userInvestedAmount?: number;
    isLoadingInvestedAmount?: boolean;
}

export const YourInfoCard: React.FC<YourInfoCardProps> = ({
    apy,
    shipment,
    userInvestedAmount = 0,
    isLoadingInvestedAmount = false,
}) => {
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

    const walletBalance = useMemo(() => {
        if (tokenBalanceRaw == null) return 0;
        return Number(formatUnits(tokenBalanceRaw, tokenDecimals));
    }, [tokenBalanceRaw, tokenDecimals]);

    // Use the invested amount passed as prop (from TruMarketDeal contract)
    const userPosition = useMemo(() => {
        if (!isConnected || !address || !userInvestedAmount || userInvestedAmount === 0) return 0;
        return userInvestedAmount;
    }, [isConnected, address, userInvestedAmount]);

    // Calculate yield based on position and APY using compound formula
    // Shows projected yield at maturity (from start date to end date)
    const yieldAmount = useMemo(() => {
        if (!isConnected || !address || !userPosition || userPosition === 0 || !apy) return 0;

        // Use shipping start date as the start date, or current date if not available
        const startDate = shipment.shippingStartDate
            ? new Date(shipment.shippingStartDate)
            : new Date();
        // Use expected shipping end date for projected yield at maturity
        const endDate = shipment.expectedShippingEndDate
            ? new Date(shipment.expectedShippingEndDate)
            : new Date(startDate.getTime() + INVESTMENT.DEAL_DURATION_DAYS * 24 * 60 * 60 * 1000);

        // Calculate yield using compound formula: TotalReturn = P × (1 + a)^t, Yield = TotalReturn - P
        const { yourYield } = calcYieldFromAPY({
            principal: userPosition,
            apyPercent: apy,
            startDate,
            endDate,
            dayCountBasis: 365,
        });

        return yourYield;
    }, [isConnected, address, userPosition, apy, shipment.shippingStartDate, shipment.expectedShippingEndDate]);

    return (
        <InfoCard style={{ padding: '25px 25px 25px', gap: '24px' }}>
            <SectionHeader as="h2">Your info</SectionHeader>

            {!isConnected ? (
                <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                    <p
                        className="mb-4 max-w-sm text-sm font-normal leading-5 text-[#62748E]"
                        style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tighter }}
                    >
                        Connect your wallet to view your balance, position, and yield for this deal.
                    </p>
                    <ConnectButton chainStatus="icon" showBalance={false} />
                </div>
            ) : (
                // Logged in State: Show wallet balance, position, and yield
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
                                    {formatCurrency(walletBalance)} USDC
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Your Position Section */}
                    <div className="flex justify-between items-center">
                        <span
                            className="text-sm leading-5 font-normal text-[#45556C]"
                            style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tighter }}
                        >
                            Amount Invested
                        </span>
                        <span
                            className="text-base leading-6 font-normal text-[#0F172B]"
                            style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tight }}
                        >
                            {isLoadingInvestedAmount ? (
                                <span className="text-[#62748E]">Loading...</span>
                            ) : (
                                formatCurrency(userPosition) + ' USDC'
                            )}
                        </span>
                    </div>

                    {/* Your Yield Section */}
                    <div className="flex justify-between items-center">
                        <span
                            className="text-sm leading-5 font-normal text-[#45556C]"
                            style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tighter }}
                        >
                            Your Yield
                        </span>
                        <span
                            className="text-base leading-6 font-normal text-[#4E8C37]"
                            style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tight }}
                        >
                            {yieldAmount.toFixed(2)} USDC
                        </span>
                    </div>
                </div>
            )}
        </InfoCard>
    );
};
