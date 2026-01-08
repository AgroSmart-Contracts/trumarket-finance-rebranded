import React, { useMemo, useEffect } from 'react';
import { Wallet } from 'lucide-react';
import { DealDetails } from '@/types';
import { InfoCard, SectionHeader, Button } from '@/components/ui';
import { formatCurrency } from '@/lib/formatters';
import { calculateYEARFRAC } from '@/lib/financialCalculations';
import { TYPOGRAPHY } from '@/lib/constants';
import useWallet from '@/hooks/useWallet';
import useDealOwnership from '@/hooks/useDealOwnership';

interface YourInfoCardProps {
    apy: number;
    shipment: DealDetails;
}

export const YourInfoCard: React.FC<YourInfoCardProps> = ({ apy, shipment }) => {
    // Wallet and position hooks
    const { wallet, connectMetaMask } = useWallet();
    const { shares, refresh } = useDealOwnership(shipment.vaultAddress || '', shipment.nftID || 0);

    // Refresh position when wallet connects or shipment changes
    useEffect(() => {
        if (wallet?.address && shipment.vaultAddress) {
            refresh();
        }
    }, [wallet?.address, shipment.vaultAddress, refresh]);

    // Calculate user's position (convert shares to assets)
    const userPosition = useMemo(() => {
        if (!wallet?.address || !shares || shares === 0) return 0;
        return shares; // shares is already in USDC format from useDealOwnership
    }, [wallet?.address, shares]);

    // Calculate yield based on position and APY using YEARFRAC
    const yieldAmount = useMemo(() => {
        if (!wallet?.address || !userPosition || userPosition === 0 || !apy) return 0;

        // Use shipping start date as the start date, or current date if not available
        const startDate = shipment.shippingStartDate
            ? new Date(shipment.shippingStartDate)
            : new Date();
        const today = new Date();

        // Calculate fractional years using YEARFRAC (convention 1 = Actual/Actual)
        const yearFrac = calculateYEARFRAC(startDate, today, 1);

        // Yield = position * (apy / 100) * YEARFRAC
        // This gives the total yield earned so far
        return userPosition * (apy / 100) * yearFrac;
    }, [wallet?.address, userPosition, apy, shipment.shippingStartDate]);

    const walletBalance = wallet?.balanceUnderlying ?? 0;

    return (
        <InfoCard style={{ padding: '25px 25px 25px', gap: '24px' }}>
            <SectionHeader as="h2">Your info</SectionHeader>

            {!wallet?.address ? (
                // Disconnected State: Show message and connect button (inspired by Aave)
                <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                    <p
                        className="text-sm leading-5 font-normal text-[#62748E] mb-4 max-w-sm"
                        style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tighter }}
                    >
                        Please connect a wallet to view your personal information here.
                    </p>
                    <Button
                        onClick={connectMetaMask}
                        className="bg-[#4E8C37] hover:bg-[#3A6A28] text-white flex items-center gap-2 shadow-sm hover:shadow-md transition-all duration-200"
                        style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tight }}
                    >
                        <Wallet className="w-4 h-4" />
                        <span className="font-normal">Connect wallet</span>
                    </Button>
                </div>
            ) : (
                // Connected State: Show wallet balance, position, and yield (inspired by Aave)
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
                            Your Position
                        </span>
                        <span
                            className="text-base leading-6 font-normal text-[#0F172B]"
                            style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tight }}
                        >
                            {formatCurrency(userPosition)} USDC
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
                            {formatCurrency(yieldAmount)} USDC
                        </span>
                    </div>
                </div>
            )}
        </InfoCard>
    );
};

