import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface IconContainerProps {
    icon: LucideIcon;
    iconColor?: string;
    backgroundColor?: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const sizeClasses = {
    sm: 'w-8 h-8 p-2',
    md: 'w-11 h-11 p-3',
    lg: 'w-16 h-16 p-4',
};

const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
};

/**
 * Reusable icon container with colored background
 */
export const IconContainer: React.FC<IconContainerProps> = ({
    icon: Icon,
    iconColor = '#4E8C37',
    backgroundColor = '#ECFDF5',
    size = 'md',
    className,
}) => {
    return (
        <div
            className={cn(
                'rounded-lg flex items-center justify-center',
                sizeClasses[size],
                className
            )}
            style={{ backgroundColor }}
        >
            <Icon className={iconSizeClasses[size]} style={{ color: iconColor }} />
        </div>
    );
};
