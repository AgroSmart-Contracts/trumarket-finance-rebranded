import React from 'react';
import { cn } from '@/lib/utils';
import { SHADOWS } from '@/lib/constants';

interface InfoCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    variant?: 'default' | 'no-shadow';
}

/**
 * Reusable card component with consistent styling
 */
export const InfoCard: React.FC<InfoCardProps> = ({
    children,
    className,
    variant = 'default',
    ...props
}) => {
    return (
        <div
            className={cn(
                'bg-white border border-[#E2E8F0] rounded-lg flex flex-col',
                variant === 'default' && 'shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]',
                className
            )}
            style={variant === 'default' ? { boxShadow: SHADOWS.card } : undefined}
            {...props}
        >
            {children}
        </div>
    );
};
