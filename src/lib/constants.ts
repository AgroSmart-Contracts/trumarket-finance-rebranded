/**
 * Design system constants
 * Centralized values for consistent styling across the application
 */

// Header dimensions
export const HEADER_HEIGHT = 72; // px
export const HEADER_PADDING_Y = 16; // px (top and bottom)
export const HEADER_CONTENT_HEIGHT = 40; // px

// Colors
export const COLORS = {
    primary: {
        green: '#4E8C37',
        greenDark: '#3A6A28',
        greenLight: '#3B7A2A',
        greenBright: '#398F45',
    },
    background: {
        white: '#FFFFFF',
        lightGray: '#FAFAFA',
        cardGray: '#F8FAFC',
        sectionGray: '#F1F5F9',
    },
    text: {
        dark: '#0F172B',
        medium: '#314158',
        light: '#62748E',
        lighter: '#64748B',
        muted: '#45556C',
    },
    border: {
        light: '#E2E8F0',
        medium: '#CAD5E2',
    },
    chart: {
        yellow: '#EEBA32',
        yellowLight: '#FFFBEB',
        green: '#BDD156',
        greenLight: '#ECFDF5',
        red: '#E16468',
    },
} as const;

// Typography
export const TYPOGRAPHY = {
    letterSpacing: {
        tight: '-0.3125px',
        tighter: '-0.150391px',
        tightest: '-0.449219px',
        normal: '0.0703125px',
        wide: '0.395508px',
    },
} as const;

// Shadows
export const SHADOWS = {
    card: '0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)',
} as const;

// Investment constants
export const INVESTMENT = {
    DEFAULT_PRINCIPAL: 230000,
    DEFAULT_TOTAL_RETURN: 2730000,
    DEFAULT_PRINCIPAL_REQUIRED: 2500000,
    MIN_INVESTMENT: 100000,
    MAX_INVESTMENT: 5000000,
    DEFAULT_AVAILABLE_BALANCE: 10000000,
    MANAGEMENT_FEE_RATE: 0, // 0% annually
    DEAL_DURATION_DAYS: 180,
    DAYS_PER_YEAR: 365,
} as const;

// Copy timeout
export const COPY_TIMEOUT = 2000; // ms
