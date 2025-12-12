import React from 'react';
import { TYPOGRAPHY } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface SectionHeaderProps extends React.HTMLAttributes<HTMLHeadingElement> {
    children: React.ReactNode;
    as?: 'h2' | 'h3' | 'h4';
}

/**
 * Reusable section header component with consistent styling
 */
export const SectionHeader: React.FC<SectionHeaderProps> = ({
    children,
    as: Component = 'h3',
    className,
    ...props
}) => {
    return (
        <Component
            className={cn('text-base leading-6 font-normal text-[#0F172B]', className)}
            style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tight }}
            {...props}
        >
            {children}
        </Component>
    );
};
