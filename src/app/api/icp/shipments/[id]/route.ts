import { NextRequest, NextResponse } from 'next/server';
import { deployedDataService } from '@/services/deployedDataService';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const deal = await deployedDataService.getDealDetails(id);

        return NextResponse.json(deal);
    } catch (error) {
        console.error('Error fetching shipment details:', error);
        return NextResponse.json({ error: 'Failed to fetch shipment details' }, { status: 500 });
    }
}