/**
 * Formatting utility functions
 */

/**
 * Formats a number as USD currency
 * - For amounts < $1: Shows 2 decimal places (rounded up to nearest cent)
 * - For amounts >= $1: Rounds up to nearest cent, then displays with no decimals
 * Format: $###,### or $0.XX for small amounts
 */
export const formatCurrency = (amount: number): string => {
    // Round up to nearest cent
    const roundedAmount = Math.ceil(amount * 100) / 100;
    
    // For amounts less than $1, show 2 decimal places
    if (roundedAmount < 1) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(roundedAmount);
    }
    
    // For amounts >= $1, round up to nearest cent, then format with no decimals
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Math.ceil(roundedAmount));
};

/**
 * USD for dashboard metrics: at or above $1M → compact millions (e.g. $7.16M);
 * under $1M → comma grouping via formatCurrency.
 */
export const formatCurrencyUsdMetric = (amount: number): string => {
    const roundedAmount = Math.ceil(amount * 100) / 100;
    if (roundedAmount >= 1_000_000) {
        const m = Math.round((roundedAmount / 1_000_000) * 100) / 100;
        const body = m % 1 === 0 ? String(m) : m.toFixed(2).replace(/\.?0+$/, '');
        return `$${body}M`;
    }
    return formatCurrency(roundedAmount);
};

/**
 * Compact metric amounts: `10k` for thousands, `1.5M` for millions (no currency symbol).
 * Used for pool TVL and dashboard cards alongside a token symbol.
 */
export function formatCompactNumber(amount: number): string {
    if (!Number.isFinite(amount)) return '—';
    const sign = amount < 0 ? '-' : '';
    const a = Math.abs(amount);
    if (a >= 1_000_000) {
        const m = a / 1_000_000;
        const body = m % 1 === 0 ? String(m) : m.toFixed(2).replace(/\.?0+$/, '');
        return `${sign}${body}M`;
    }
    if (a >= 1_000) {
        const k = Math.round(a / 1_000);
        return `${sign}${k}k`;
    }
    return `${sign}${a.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
}

/**
 * Formats a number with commas and no decimal places
 * Format: ###,###
 */
export const formatNumber = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

/**
 * Formats a date string to a readable format
 */
export const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
};

/**
 * Truncates an address to show first N and last M characters
 */
export const truncateAddress = (address: string, start: number = 20, end: number = 4): string => {
    if (!address) return '';
    if (address.length <= start + end) return address;
    return `${address.slice(0, start)}...${address.slice(-end)}`;
};

/**
 * Parses a numeric string, removing non-numeric characters
 */
export const parseNumericString = (value: string): number => {
    return parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
};
