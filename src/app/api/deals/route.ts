import { NextResponse } from 'next/server';
import { deployedDataService } from '@/services/deployedDataService';

/** Published trade-finance programs (MongoDB `deals` collection). */
export async function GET() {
  try {
    const deals = await deployedDataService.getShipmentsList();
    return NextResponse.json(deals);
  } catch (error) {
    console.error('Error fetching deals:', error);
    return NextResponse.json({ error: 'Failed to fetch deals' }, { status: 500 });
  }
}
