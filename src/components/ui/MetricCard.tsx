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
    height = '230px',
}) => {
    return (
        <InfoCard
            className={cn('p-4 sm:p-6 pb-1 w-full', className)}
            style={{ height, maxWidth: width }}
        >
            <div className="flex flex-col gap-4">
                {/* Icon and Change Badge */}
                <div className="flex items-start justify-between">
                    <IconContainer
                        icon={icon}
                        iconColor={iconColor}
                        backgroundColor={iconBackgroundColor}
                        size="md"
                    />
                    {change && (
                        <span
                            className={cn(
                                'px-2 py-1 rounded text-sm font-normal',
                                change.isPositive
                                    ? 'bg-[#ECFDF5] text-[#4E8C37]'
                                    : 'bg-red-50 text-red-600'
                            )}
                        >
                            {change.value}
                        </span>
                    )}
                </div>

                {/* Value */}
                <div>
                    <div
                        className="text-[30px] leading-9 font-normal text-[#0F172B]"
                        style={{ letterSpacing: '0.395508px' }}
                    >
                        {value}
                    </div>
                    <div
                        className="text-sm leading-5 font-normal text-[#62748E]"
                        style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tighter }}
                    >
                        {label}
                    </div>
                </div>

                {/* Sparkline */}
                {sparkline && <div className="mt-auto">{sparkline}</div>}
            </div>
        </InfoCard>
    );
};
