import { NextRequest, NextResponse } from 'next/server';
import { deployedDataService } from '@/services/deployedDataService';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const nftId = parseInt(id, 10);
    if (Number.isNaN(nftId)) {
      return NextResponse.json({ error: 'Invalid deal id for activities (numeric dealId expected)' }, { status: 400 });
    }
    const activities = await deployedDataService.getShipmentActivity(nftId);
    return NextResponse.json(activities);
  } catch (error) {
    console.error('Error fetching deal activities:', error);
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
  }
}
