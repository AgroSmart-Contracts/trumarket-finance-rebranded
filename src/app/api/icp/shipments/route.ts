import { NextRequest, NextResponse } from 'next/server';
import { deployedDataService } from '@/services/deployedDataService';

export async function GET(request: NextRequest) {
    try {
        const shipments = await deployedDataService.getShipmentsList();
        return NextResponse.json(shipments);
    } catch (error) {
        console.error('Error fetching ICP shipments:', error);
        return NextResponse.json({ error: 'Failed to fetch ICP shipments' }, { status: 500 });
    }
}