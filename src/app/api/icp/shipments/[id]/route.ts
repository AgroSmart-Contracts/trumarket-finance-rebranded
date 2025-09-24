import { NextRequest, NextResponse } from 'next/server';
import { deployedDataService } from '@/services/deployedDataService';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const shipment = await deployedDataService.getShipmentDetails(id);

        return NextResponse.json(shipment);
    } catch (error) {
        console.error('Error fetching ICP shipment details:', error);
        return NextResponse.json({ error: 'Failed to fetch ICP shipment details' }, { status: 500 });
    }
}