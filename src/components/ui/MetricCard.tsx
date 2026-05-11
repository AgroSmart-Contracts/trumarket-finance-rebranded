import React from 'react';
import { LucideIcon } from 'lucide-react';
import { IconContainer } from './IconContainer';
import { InfoCard } from './InfoCard';
import { TYPOGRAPHY } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface MetricCardProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    iconColor?: string;
    iconBackgroundColor?: string;
    change?: {
        value: string;
        isPositive: boolean;
    };
    sparkline?: React.ReactNode;
    className?: string;
    width?: string;
    /** Fixed card height; omit for compact content-sized cards */
    height?: string;
}

/**
 * Reusable metric/KPI card component with icon, value, and optional change indicator
 */
export const MetricCard: React.FC<MetricCardProps> = ({
    label,
    value,
    icon,
    iconColor = '#4E8C37',
    iconBackgroundColor = '#ECFDF5',
    change,
    sparkline,
    className,
    width,
    height,
}) => {
    return (
        <InfoCard
            className={cn('flex h-full min-h-0 w-full flex-col p-3 sm:p-4', className)}
            style={{ maxWidth: width, ...(height ? { height } : {}) }}
        >
            <div className="flex min-h-0 flex-1 flex-col gap-2">
                {/* Icon and Change Badge */}
                <div className="flex shrink-0 items-start justify-between gap-2">
                    <IconContainer
                        icon={icon}
                        iconColor={iconColor}
                        backgroundColor={iconBackgroundColor}
                        size="sm"
                    />
                    {change && (
                        <span
                            className={cn(
                                'rounded px-1.5 py-0.5 text-[11px] font-medium leading-tight',
                                change.isPositive
                                    ? 'bg-[#ECFDF5] text-[#4E8C37]'
                                    : 'bg-red-50 text-red-600'
                            )}
                        >
                            {change.value}
                        </span>
                    )}
                </div>

                <div className="shrink-0">
                    <div className="text-2xl font-semibold leading-tight tracking-tight text-[#0F172B] sm:text-3xl">
                        {value}
                    </div>
                    <div
                        className="mt-0.5 text-[11px] leading-4 font-normal text-[#62748E]"
                        style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tighter }}
                    >
                        {label}
                    </div>
                </div>

                {/* Same bottom band as <Sparkline /> so row heights match when sparkline is omitted */}
                <div className="mt-auto shrink-0 pt-0.5">
                    {sparkline ?? <div className="h-8" aria-hidden />}
                </div>
            </div>
        </InfoCard>
    );
};
