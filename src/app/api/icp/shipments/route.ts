import { NextRequest, NextResponse } from 'next/server';
import { deployedDataService } from '@/services/deployedDataService';

export async function GET(request: NextRequest) {
    try {
        const deals = await deployedDataService.getShipmentsList();
        return NextResponse.json(deals);
    } catch (error) {
        console.error('Error fetching shipments:', error);
        return NextResponse.json({ error: 'Failed to fetch shipments' }, { status: 500 });
    }
}