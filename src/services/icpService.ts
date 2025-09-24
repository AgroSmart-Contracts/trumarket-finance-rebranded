import { deployedDataService } from './deployedDataService';
import { ShipmentDetails, Activity, MilestoneDetails } from '@/types/icp';

export class ICPService {
    async getVersion(): Promise<string> {
        return await deployedDataService.getVersion();
    }

    async getShipmentsList(): Promise<ShipmentDetails[]> {
        return await deployedDataService.getShipmentsList();
    }

    async getShipmentDetails(id: string): Promise<ShipmentDetails> {
        return await deployedDataService.getShipmentDetails(id);
    }

    async getShipmentActivity(id: string): Promise<Activity[]> {
        return await deployedDataService.getShipmentActivity(id);
    }

    async createShipment(shipment: ShipmentDetails): Promise<void> {
        // For now, just log - can be implemented later
        console.log('Creating shipment:', shipment.id);
        throw new Error('Create shipment not implemented yet');
    }

    async updateMilestone(id: string, milestone: MilestoneDetails): Promise<void> {
        // For now, just log - can be implemented later
        console.log('Updating milestone:', id, milestone.id);
        throw new Error('Update milestone not implemented yet');
    }

    async createActivity(
        shipmentId: string,
        activityType: string,
        description: string,
        txHash: string,
        timestamp: Date,
    ): Promise<void> {
        // For now, just log - can be implemented later
        console.log('Creating activity:', shipmentId, activityType);
        throw new Error('Create activity not implemented yet');
    }
}

export const icpService = new ICPService();