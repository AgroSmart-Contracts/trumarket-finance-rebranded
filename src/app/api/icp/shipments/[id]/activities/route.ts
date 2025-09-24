import { NextRequest, NextResponse } from 'next/server';
import { deployedDataService } from '@/services/deployedDataService';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const activities = await deployedDataService.getShipmentActivity(id);

        return NextResponse.json(activities);
    } catch (error) {
        console.error('Error fetching ICP activities:', error);
        return NextResponse.json({ error: 'Failed to fetch ICP activities' }, { status: 500 });
    }
}