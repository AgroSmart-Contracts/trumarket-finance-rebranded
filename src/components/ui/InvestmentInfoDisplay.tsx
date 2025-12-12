import React from 'react';
import { formatCurrency } from '@/lib/formatters';
import { TYPOGRAPHY, INVESTMENT } from '@/lib/constants';

interface InvestmentInfoItem {
    label: string;
    value: number;
    valueColor?: string;
}

interface InvestmentInfoDisplayProps {
    items: InvestmentInfoItem[];
    className?: string;
    separatorClassName?: string;
}

/**
 * Reusable component for displaying investment information (min, max, available balance, etc.)
 */
export const InvestmentInfoDisplay: React.FC<InvestmentInfoDisplayProps> = ({
    items,
    className = 'bg-[#F8FAFC] rounded-lg p-4 flex items-center gap-4',
    separatorClassName = 'text-base leading-6 font-normal text-[#CAD5E2]',
}) => {
    return (
        <div className={className}>
            {items.map((item, index) => (
                <React.Fragment key={item.label}>
                    {index > 0 && (
                        <span
                            className={separatorClassName}
                            style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tight }}
                        >
                            |
                        </span>
                    )}
                    <div className="flex flex-col gap-1">
                        <span
                            className="text-sm leading-5 font-normal text-[#45556C]"
                            style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tighter }}
                        >
                            {item.label}
                        </span>
                        <span
                            className={`text-base leading-6 font-normal ${item.valueColor || 'text-[#0F172B]'}`}
                            style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tight }}
                        >
                            {formatCurrency(item.value)}
                        </span>
                    </div>
                </React.Fragment>
            ))}
        </div>
    );
};
