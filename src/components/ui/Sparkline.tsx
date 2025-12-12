import React from 'react';
import { cn } from '@/lib/utils';

interface SparklineProps {
    color?: string;
    width?: number;
    height?: number;
    className?: string;
    path?: string;
}

const defaultPath = 'M 0 40 L 25 35 L 50 30 L 75 25 L 100 20 L 125 15 L 150 10 L 175 8 L 200 5';

/**
 * Reusable sparkline component for metric cards
 */
export const Sparkline: React.FC<SparklineProps> = ({
    color = '#4E8C37',
    width = 200,
    height = 48,
    className,
    path = defaultPath,
}) => {
    return (
        <div className={cn('w-[200px] h-12 -ml-4', className)}>
            <svg
                width={width}
                height={height}
                viewBox={`0 0 ${width} ${height}`}
                className="overflow-visible"
            >
                <path
                    d={path}
                    stroke={color}
                    strokeWidth="2"
                    fill="none"
                />
            </svg>
        </div>
    );
};
