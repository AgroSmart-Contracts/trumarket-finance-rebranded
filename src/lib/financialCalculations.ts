import { DealDetails } from '@/types';

/**
 * FINANCIAL CALCULATIONS
 * 
 * ⚠️ TEMPORARY FAKE VALUES ⚠️
 * All calculations currently return realistic fake/constant values for testing purposes.
 * These need to be replaced with actual calculations based on real data.
 * 
 * Current fake values:
 * - APY: 15% (flat rate)
 * - Revenue: 0.15 × AUM (investmentAmount)
 * - ROI: 15% (flat rate)
 */

/**
 * Calculate revenue for a deal
 * TEMPORARY: Returns fake constant values for testing
 */
export function calculateRevenue(deal: DealDetails): number {
    // Return 15% of AUM (investment amount)
    return Math.round(deal.investmentAmount * 0.15);
}

/**
 * Calculate APY (Annual Percentage Yield) for a deal
 * TEMPORARY: Returns fake constant values for testing
 */
export function calculateAPY(deal: DealDetails): number {
    // Return flat 15% APY
    return 15;
}

/**
 * Calculate simple ROI (Return on Investment)
 * TEMPORARY: Returns fake constant values for testing
 */
export function calculateROI(deal: DealDetails): number {
    if (deal.investmentAmount === 0) return 0;

    // Return flat 15% ROI
    return 15;
}

/**
 * Calculate annualized return (simpler version)
 * TEMPORARY: Returns fake constant values for testing
 */
export function calculateAnnualizedReturn(deal: DealDetails): number {
    if (deal.investmentAmount === 0) return 0;

    // Return flat 15% annualized return
    return 15;
}

/**
 * Calculate weighted average APY across multiple deals
 * Weighted by investment amount
 */
export function calculateWeightedAverageAPY(deals: DealDetails[]): number {
    if (deals.length === 0) return 0;

    let totalWeightedAPY = 0;
    let totalInvestment = 0;

    deals.forEach(deal => {
        const apy = calculateAPY(deal);
        const weight = deal.investmentAmount;

        // Only include valid APY values
        if (isFinite(apy) && apy > 0 && apy < 1000) {
            totalWeightedAPY += apy * weight;
            totalInvestment += weight;
        }
    });

    const averageAPY = totalInvestment > 0 ? totalWeightedAPY / totalInvestment : 0;

    return Number(averageAPY.toFixed(2));
}

/**
 * Calculate total revenue across all deals
 */
export function calculateTotalRevenue(deals: DealDetails[]): number {
    return deals.reduce((sum, deal) => sum + calculateRevenue(deal), 0);
}

/**
 * Calculate total investment across all deals
 */
export function calculateTotalInvestment(deals: DealDetails[]): number {
    return deals.reduce((sum, deal) => sum + deal.investmentAmount, 0);
}

/**
 * Calculate portfolio metrics
 */
export function calculatePortfolioMetrics(deals: DealDetails[]) {
    const totalInvestment = calculateTotalInvestment(deals);
    const totalRevenue = calculateTotalRevenue(deals);
    const weightedAPY = calculateWeightedAverageAPY(deals);
    const totalROI = totalInvestment > 0 ? (totalRevenue / totalInvestment) * 100 : 0;

    return {
        totalInvestment,
        totalRevenue,
        averageAPY: weightedAPY,
        totalROI,
        netProfit: totalRevenue,
        numberOfDeals: deals.length
    };
}

import { INVESTMENT } from './constants';

/**
 * Calculate investment limits based on deal amount
 * Min investment is 10% of deal amount, max is 100% of deal amount
 */
export function calculateInvestmentLimits(dealAmount: number): { min: number; max: number } {
    const min = dealAmount > 0 ? dealAmount * 0.1 : INVESTMENT.MIN_INVESTMENT;
    const max = dealAmount || INVESTMENT.MAX_INVESTMENT;

    return { min, max };
}

