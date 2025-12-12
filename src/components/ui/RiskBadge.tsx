import React from 'react';
import { cn } from '@/lib/utils';

export type RiskLevel = 'low' | 'medium' | 'high';

interface RiskBadgeProps {
    risk: RiskLevel;
    showLabel?: boolean;
    size?: 'sm' | 'md';
    className?: string;
}

const riskConfig: Record<RiskLevel, { color: string; letter: string; label: string }> = {
    low: {
        color: '#398F45',
        letter: 'A',
        label: 'Low Risk',
    },
    medium: {
        color: '#F9B922',
        letter: 'B',
        label: 'Medium Risk',
    },
    high: {
        color: '#BB1818',
        letter: 'C',
        label: 'High Risk',
    },
};

/**
 * Reusable risk badge component with letter grade
 */
export const RiskBadge: React.FC<RiskBadgeProps> = ({
    risk,
    showLabel = false,
    size = 'md',
    className,
}) => {
    const config = riskConfig[risk];
    const sizeClasses = size === 'sm' ? 'w-4 h-4 text-xs' : 'w-5 h-5 text-xs';

    return (
        <div className={cn('flex items-center gap-2', className)}>
            <div
                className={cn(
                    'rounded-full flex items-center justify-center text-white font-semibold border-2',
                    sizeClasses
                )}
                style={{
                    backgroundColor: config.color,
                    borderColor: config.color,
                }}
            >
                {config.letter}
            </div>
            {showLabel && (
                <span className="text-base leading-6 font-normal text-[#0F172B]">
                    {config.label}
                </span>
            )}
        </div>
    );
};
