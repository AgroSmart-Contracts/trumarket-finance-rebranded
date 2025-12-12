import React from 'react';
import { cn } from '@/lib/utils';
import { TYPOGRAPHY } from '@/lib/constants';

interface Step {
    number: number;
    title: string;
    description: string;
}

interface StepIndicatorProps {
    steps: Step[];
    className?: string;
}

/**
 * Reusable step indicator component for "What happens next?" sections
 */
export const StepIndicator: React.FC<StepIndicatorProps> = ({ steps, className }) => {
    return (
        <div className={cn('flex flex-col gap-3', className)}>
            {steps.map((step) => (
                <div key={step.number} className="flex gap-3">
                    <div
                        className="flex items-center justify-center rounded-full bg-[#4E8C37] text-white text-xs leading-4 font-normal flex-shrink-0"
                        style={{ width: '24px', height: '24px' }}
                    >
                        {step.number}
                    </div>
                    <div className="flex flex-col gap-1">
                        <span
                            className="text-sm leading-5 font-normal text-[#0F172B]"
                            style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tighter }}
                        >
                            {step.title}
                        </span>
                        <span
                            className="text-sm leading-5 font-normal text-[#45556C]"
                            style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tighter }}
                        >
                            {step.description}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
};
