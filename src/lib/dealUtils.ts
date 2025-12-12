/**
 * Utility functions for deal/shipment operations
 */

/**
 * Gets the status label for a deal based on status and milestone
 */
export function getStatusLabel(status: string, currentMilestone: number): string {
    switch (status) {
        case 'proposal':
            return 'Active';
        case 'confirmed':
            return currentMilestone === 0 ? 'Active' : 'In Progress';
        case 'finished':
            return 'Completed';
        default:
            return status;
    }
}

/**
 * Calculates the duration in days between two dates
 */
export function calculateDuration(startDate: string, endDate: string): number {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}
