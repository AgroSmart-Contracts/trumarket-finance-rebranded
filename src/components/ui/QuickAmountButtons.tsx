import React from 'react';
import { Button } from './button';
import { formatCurrency } from '@/lib/formatters';
import { INVESTMENT, TYPOGRAPHY } from '@/lib/constants';

interface QuickAmountButtonsProps {
    onSelect: (amount: number) => void;
    amounts?: number[];
    className?: string;
    minAmount?: number;
}

const defaultAmounts = [
    INVESTMENT.MIN_INVESTMENT,
    500000,
    1000000,
    2000000,
];

/**
 * Reusable quick amount selection buttons
 */
export const QuickAmountButtons: React.FC<QuickAmountButtonsProps> = ({
    onSelect,
    amounts = defaultAmounts,
    className,
    minAmount,
}) => {
    const getLabel = (amount: number, index: number) => {
        // Check if this is the minimum amount
        const isMinAmount = (minAmount !== undefined && amount === minAmount) || (index === 0 && amounts && amount === amounts[0]);

        if (isMinAmount) {
            return `Min: ${formatCurrency(amount)}`;
        }

        // Format large amounts
        if (amount >= 1000000) {
            return `$${(amount / 1000000).toFixed(0)}M`;
        }

        return `$${(amount / 1000).toFixed(0)}K`;
    };

    return (
        <div className={className || 'flex flex-wrap px-8 justify-between'}>
            {amounts.map((amount, index) => (
                <Button
                    key={amount}
                    variant="outline"
                    onClick={() => onSelect(amount)}
                    className="flex-1 min-w-[120px] sm:flex-initial bg-[#FAFAFA] border border-[#CAD5E2] text-[#0F172A] hover:bg-gray-50 rounded-md h-10 text-sm sm:text-base"
                    style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tight }}
                >
                    {getLabel(amount, index)}
                </Button>
            ))}
        </div>
    );
};
