import React from 'react';
import { TYPOGRAPHY } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface DealTermRowProps {
    label: string;
    value: string;
    className?: string;
}

/**
 * Reusable deal term row component (label: value format)
 */
export const DealTermRow: React.FC<DealTermRowProps> = ({ label, value, className }) => {
    return (
        <div
            className={cn('flex justify-between items-start', className)}
            style={{ height: '24px' }}
        >
            <span
                className="text-base leading-6 font-normal text-[#45556C]"
                style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tight }}
            >
                {label}
            </span>
            <span
                className="text-base leading-6 font-normal text-[#0F172B]"
                style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tight }}
            >
                {value}
            </span>
        </div>
    );
};
