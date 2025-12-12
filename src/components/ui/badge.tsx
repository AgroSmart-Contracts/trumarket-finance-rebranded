import React from 'react';
import { cn } from '@/lib/utils';
import { TYPOGRAPHY } from '@/lib/constants';

export type BadgeVariant = 'status' | 'commodity' | 'risk' | 'verified' | 'featured';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    children: React.ReactNode;
    variant?: BadgeVariant;
}

const badgeStyles: Record<BadgeVariant, string> = {
    status: 'bg-[#F8FAFC] text-[#0F172A]',
    commodity: 'bg-[#F1F5F9] text-[#314158]',
    risk: 'bg-[#F8FAFC] text-[#0F172A]',
    verified: 'bg-[#4E8C37] text-white',
    featured: 'bg-[#FFFBEB] text-[#EEBA32] border border-[rgba(238,186,50,0.2)]',
};

/**
 * Reusable badge component for status, commodity, risk, etc.
 */
export const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'status',
    className,
    ...props
}) => {
    return (
        <span
            className={cn(
                'px-[10px] py-0.5 rounded-full text-base font-normal',
                badgeStyles[variant],
                className
            )}
            style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tight }}
            {...props}
        >
            {children}
        </span>
    );
};
