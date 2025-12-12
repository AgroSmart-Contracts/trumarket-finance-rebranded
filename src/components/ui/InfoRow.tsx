import React from 'react';
import { cn } from '@/lib/utils';
import { TYPOGRAPHY } from '@/lib/constants';
import { LucideIcon } from 'lucide-react';

interface InfoRowProps {
    label: string;
    value: string | React.ReactNode;
    icon?: LucideIcon;
    iconColor?: string;
    subtitle?: string;
    backgroundColor?: string;
    valueColor?: string;
    labelColor?: string;
    className?: string;
    height?: string;
}

/**
 * Reusable info row component for displaying label/value pairs with optional icon
 */
export const InfoRow: React.FC<InfoRowProps> = ({
    label,
    value,
    icon: Icon,
    iconColor = '#45556C',
    subtitle,
    backgroundColor,
    valueColor = '#0F172B',
    labelColor = '#45556C',
    className,
    height,
}) => {
    return (
        <div
            className={cn('flex justify-between items-center px-4 py-3 rounded-lg', className)}
            style={{
                backgroundColor: backgroundColor || undefined,
                height,
            }}
        >
            <div className="flex items-center gap-3">
                {Icon && <Icon className="w-5 h-5" style={{ color: iconColor }} />}
                {subtitle ? (
                    <div className="flex flex-col">
                        <span
                            className="text-base leading-6 font-normal"
                            style={{
                                color: labelColor,
                                letterSpacing: TYPOGRAPHY.letterSpacing.tight,
                            }}
                        >
                            {label}
                        </span>
                        <span
                            className="text-xs leading-4 font-normal text-[#62748E]"
                            style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tighter }}
                        >
                            {subtitle}
                        </span>
                    </div>
                ) : (
                    <span
                        className="text-base leading-6 font-normal"
                        style={{
                            color: labelColor,
                            letterSpacing: TYPOGRAPHY.letterSpacing.tight,
                        }}
                    >
                        {label}
                    </span>
                )}
            </div>
            {typeof value === 'string' ? (
                <span
                    className="text-xl leading-7 font-normal"
                    style={{
                        color: valueColor,
                        letterSpacing: TYPOGRAPHY.letterSpacing.tightest,
                    }}
                >
                    {value}
                </span>
            ) : (
                value
            )}
        </div>
    );
};
