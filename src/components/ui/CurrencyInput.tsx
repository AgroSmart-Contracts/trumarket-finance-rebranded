import React, { useState, useEffect } from 'react';
import { LucideIcon } from 'lucide-react';
import { TYPOGRAPHY } from '@/lib/constants';
import { formatNumber, parseNumericString } from '@/lib/formatters';

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
 * Formats displayed value with commas (###,###) while storing numeric value
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
    // Parse the numeric value from the stored string
    const numericValue = parseNumericString(value);
    
    // Format for display with commas
    const displayValue = numericValue > 0 ? formatNumber(numericValue) : '';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        // Remove all non-numeric characters (including commas)
        const numericString = inputValue.replace(/[^0-9]/g, '');
        // Update with the numeric string (parent will handle formatting on next render)
        onChange(numericString);
    };

    return (
        <div className={`relative ${className || ''}`}>
            {Icon && (
                <Icon className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${iconClassName}`} />
            )}
            <input
                type="text"
                value={displayValue}
                onChange={handleChange}
                placeholder={placeholder}
                disabled={disabled}
                className={`w-full ${Icon ? 'pl-12' : 'pl-4'} pr-4 py-4 bg-[#FAFAFA] border border-[#CAD5E2] rounded-md text-2xl leading-7 font-normal text-[#64748B] focus:outline-none focus:border-[#4E8C37] disabled:opacity-50 disabled:cursor-not-allowed ${inputClassName || ''}`}
                style={{ height: '64px', letterSpacing: TYPOGRAPHY.letterSpacing.normal }}
            />
        </div>
    );
};
