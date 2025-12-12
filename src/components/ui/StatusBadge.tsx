import React from 'react';
import { cn } from '@/lib/utils';
import { TYPOGRAPHY } from '@/lib/constants';

export type StatusType = 'active' | 'in-progress' | 'completed' | string;

interface StatusBadgeProps {
    status: StatusType;
    className?: string;
}

const statusStyles: Record<string, { bg: string; text: string }> = {
    active: {
        bg: 'bg-[#F8FAFC]',
        text: 'text-[#0F172A]',
    },
    'in-progress': {
        bg: 'bg-[#F8FAFC]',
        text: 'text-[#0F172A]',
    },
    completed: {
        bg: 'bg-[#F1F5F9]',
        text: 'text-[#45556C]',
    },
    default: {
        bg: 'bg-[#F1F5F9]',
        text: 'text-[#45556C]',
    },
};

/**
 * Reusable status badge component
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
    const style = statusStyles[status.toLowerCase()] || statusStyles.default;

    return (
        <span
            className={cn(
                'px-[10px] py-0.5 rounded-full text-base font-normal',
                style.bg,
                style.text,
                className
            )}
            style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tight }}
        >
            {status}
        </span>
    );
};
