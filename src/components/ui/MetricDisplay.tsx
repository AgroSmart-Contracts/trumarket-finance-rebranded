import React from 'react';
import { TYPOGRAPHY } from '@/lib/constants';
import { IconContainer } from './IconContainer';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricDisplayProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    iconColor?: string;
    iconBackgroundColor?: string;
    valueColor?: string;
    labelColor?: string;
    width?: string;
    valueSize?: 'sm' | 'md' | 'lg';
}

/**
 * Reusable metric display component (icon + label + value)
 */
export const MetricDisplay: React.FC<MetricDisplayProps> = ({
    label,
    value,
    icon,
    iconColor = '#4E8C37',
    iconBackgroundColor = '#ECFDF5',
    valueColor = '#0F172B',
    labelColor = '#62748E',
    width,
    valueSize = 'md',
}) => {
    const valueSizeClasses = {
        sm: 'text-base leading-6',
        md: 'text-xl leading-7',
        lg: 'text-2xl leading-8',
    };

    return (
        <div className={cn("flex items-center gap-3", width && "w-full")} style={width ? { maxWidth: width } : undefined}>
            <IconContainer
                icon={icon}
                iconColor={iconColor}
                backgroundColor={iconBackgroundColor}
                size="md"
            />
            <div className="flex-1 min-w-0">
                <div
                    className="text-sm leading-5 font-normal mb-0.5"
                    style={{
                        color: labelColor,
                        letterSpacing: TYPOGRAPHY.letterSpacing.tighter,
                    }}
                >
                    {label}
                </div>
                <div
                    className={cn(valueSizeClasses[valueSize], 'font-normal truncate')}
                    style={{
                        color: valueColor,
                        letterSpacing:
                            valueSize === 'md'
                                ? TYPOGRAPHY.letterSpacing.tightest
                                : TYPOGRAPHY.letterSpacing.tight,
                    }}
                >
                    {value}
                </div>
            </div>
        </div>
    );
};
