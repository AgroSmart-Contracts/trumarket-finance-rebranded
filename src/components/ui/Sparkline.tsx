import React from 'react';
import { cn } from '@/lib/utils';

interface SparklineProps {
    color?: string;
    width?: number;
    height?: number;
    className?: string;
    path?: string;
}

const defaultPath = 'M 0 26 L 32 22 L 64 17 L 96 12 L 128 8 L 160 4';

/**
 * Reusable sparkline component for metric cards
 */
export const Sparkline: React.FC<SparklineProps> = ({
    color = '#4E8C37',
    width = 160,
    height = 32,
    className,
    path = defaultPath,
}) => {
    return (
        <div className={cn('h-8 w-[160px] -ml-2', className)}>
            <svg
                width={width}
                height={height}
                viewBox={`0 0 ${width} ${height}`}
                className="overflow-visible"
            >
                <path
                    d={path}
                    stroke={color}
                    strokeWidth="1.5"
                    fill="none"
                />
            </svg>
        </div>
    );
};
