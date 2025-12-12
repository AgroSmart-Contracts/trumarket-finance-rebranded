import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TYPOGRAPHY } from '@/lib/constants';

interface InfoBoxProps {
    children: React.ReactNode;
    icon?: LucideIcon;
    iconColor?: string;
    variant?: 'info' | 'warning' | 'success';
    className?: string;
}

const variantStyles = {
    info: {
        bg: 'bg-[#ECFDF5]',
        border: 'border border-[rgba(78,140,55,0.2)]',
        iconColor: '#4E8C37',
    },
    warning: {
        bg: 'bg-[#FFFBEB]',
        border: 'border border-[rgba(238,186,50,0.2)]',
        iconColor: '#EEBA32',
    },
    success: {
        bg: 'bg-[#ECFDF5]',
        border: 'border border-[rgba(78,140,55,0.2)]',
        iconColor: '#4E8C37',
    },
};

/**
 * Reusable info box component for alerts, notices, and information
 */
export const InfoBox: React.FC<InfoBoxProps> = ({
    children,
    icon: Icon,
    iconColor,
    variant = 'info',
    className,
}) => {
    const style = variantStyles[variant];

    return (
        <div
            className={cn(
                'rounded-lg flex gap-4 p-[17px]',
                style.bg,
                style.border,
                className
            )}
        >
            {Icon && (
                <Icon
                    className="flex-shrink-0 mt-0.5"
                    style={{
                        width: '20px',
                        height: '20px',
                        color: iconColor || style.iconColor,
                    }}
                />
            )}
            <div className="flex flex-col gap-2 flex-1">{children}</div>
        </div>
    );
};
