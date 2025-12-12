/**
 * Formatting utility functions
 */

/**
 * Formats a number as USD currency
 */
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
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
