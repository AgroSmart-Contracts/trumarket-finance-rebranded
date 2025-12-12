import React from 'react';
import { LucideIcon } from 'lucide-react';
import { TYPOGRAPHY } from '@/lib/constants';

interface CurrencyInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    icon?: LucideIcon;
    iconClassName?: string;
    className?: string;
    inputClassName?: string;
    disabled?: boolean;
}

/**
 * Reusable currency input component with optional icon
 */
export const CurrencyInput: React.FC<CurrencyInputProps> = ({
    value,
    onChange,
    placeholder = '0',
    icon: Icon,
    iconClassName = 'w-6 h-6 text-[#90A1B9]',
    className,
    inputClassName,
    disabled = false,
}) => {
    return (
        <div className={`relative ${className || ''}`}>
            {Icon && (
                <Icon className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${iconClassName}`} />
            )}
            <input
                type="text"
                value={value === '0' ? '' : value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                className={`w-full ${Icon ? 'pl-12' : 'pl-4'} pr-4 py-4 bg-[#FAFAFA] border border-[#CAD5E2] rounded-md text-2xl leading-7 font-normal text-[#64748B] focus:outline-none focus:border-[#4E8C37] disabled:opacity-50 disabled:cursor-not-allowed ${inputClassName || ''}`}
                style={{ height: '64px', letterSpacing: TYPOGRAPHY.letterSpacing.normal }}
            />
        </div>
    );
};
