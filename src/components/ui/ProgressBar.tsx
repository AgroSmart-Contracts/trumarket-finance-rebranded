import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
    progress: number; // 0-100
    label?: string;
    showPercentage?: boolean;
    height?: string;
    barColor?: string;
    trackColor?: string;
    showIndicator?: boolean;
    indicatorSize?: string;
    className?: string;
}

/**
 * Reusable progress bar component
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
    progress,
    label,
    showPercentage = false,
    height = '16px',
    barColor = '#4E8C37',
    trackColor = '#F1F5F9',
    showIndicator = false,
    indicatorSize = '44px',
    className,
}) => {
    const clampedProgress = Math.min(Math.max(progress, 0), 100);

    return (
        <div className={cn('flex flex-col gap-2', className)}>
            {label && (
                <div className="flex items-center justify-between" style={{ height: '24px' }}>
                    <span className="text-sm leading-5 font-normal text-[#62748E]">
                        {label}
                    </span>
                    {showPercentage && (
                        <span className="text-base leading-6 font-normal text-[#0F172B]">
                            {clampedProgress}%
                        </span>
                    )}
                </div>
            )}
            <div
                className="w-full rounded-full relative"
                style={{
                    height,
                    backgroundColor: trackColor,
                }}
            >
                <div
                    className="h-full rounded-full relative"
                    style={{
                        width: `${clampedProgress}%`,
                        backgroundColor: barColor,
                    }}
                >
                    {showIndicator && (
                        <div
                            className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 rounded-full border-2 border-white"
                            style={{
                                width: indicatorSize,
                                height: indicatorSize,
                                backgroundColor: barColor,
                                boxShadow: '0px 4px 4px rgba(0,0,0,0.25)',
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};
