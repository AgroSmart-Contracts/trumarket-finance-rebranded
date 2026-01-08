import React, { useMemo } from 'react';
import { DollarSign } from 'lucide-react';
import { DealDetails } from '@/types';
import { InfoCard, SectionHeader, QuickAmountButtons, CurrencyInput, InvestmentInfoDisplay } from '@/components/ui';
import { calculateInvestmentLimits } from '@/lib/financialCalculations';
import { INVESTMENT, TYPOGRAPHY } from '@/lib/constants';
import useWallet from '@/hooks/useWallet';

interface InvestmentAmountCardProps {
    investmentAmount: string;
    setInvestmentAmount: (value: string) => void;
    onQuickAmount: (amount: number) => void;
    shipment: DealDetails;
}

export const InvestmentAmountCard: React.FC<InvestmentAmountCardProps> = ({
    investmentAmount,
    setInvestmentAmount,
    onQuickAmount,
    shipment,
}) => {
    // Get wallet connection status and balance
    const { wallet } = useWallet();

    // Calculate min and max investment based on deal amount
    const { min: minInvestment, max: maxInvestment } = useMemo(
        () => calculateInvestmentLimits(shipment.investmentAmount || 0),
        [shipment.investmentAmount]
    );

    // Calculate quick amount options
    const quickAmounts = useMemo(
        () => [minInvestment, minInvestment * 2, minInvestment * 5, maxInvestment],
        [minInvestment, maxInvestment]
    );

    // Investment info items - show wallet balance only if connected
    const investmentInfoItems = useMemo(
        () => {
            const items: Array<{ label: string; value: number; valueColor?: string }> = [
            { label: 'Minimum Investment', value: minInvestment },
            { label: 'Maximum Investment', value: maxInvestment },
            ];

            // Only show Available Balance if wallet is connected
            if (wallet?.address && wallet.balanceUnderlying !== undefined) {
                items.push({
                    label: 'Available Balance',
                    value: wallet.balanceUnderlying,
                    valueColor: 'text-[#4E8C37]',
                });
            }

            return items;
        },
        [minInvestment, maxInvestment, wallet?.address, wallet?.balanceUnderlying]
    );

    return (
        <InfoCard style={{ padding: '33px 33px 33px', gap: '24px' }}>
            <SectionHeader>Investment Amount</SectionHeader>

            <div className="flex flex-col gap-3">
                <div>
                    <label
                        className="text-base leading-6 font-normal text-[#314158] mb-3 block"
                        style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tight }}
                    >
                        Enter Amount (USD)
                    </label>
                    <CurrencyInput
                        value={investmentAmount}
                        onChange={setInvestmentAmount}
                        icon={DollarSign}
                    />
                </div>

                <InvestmentInfoDisplay items={investmentInfoItems} />

                <QuickAmountButtons
                    onSelect={onQuickAmount}
                    amounts={quickAmounts}
                    minAmount={minInvestment}
                    maxAmount={maxInvestment}
                    showPercentages={true}
                />
            </div>
        </InfoCard>
    );
};


