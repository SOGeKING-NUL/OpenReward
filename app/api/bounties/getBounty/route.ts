import { NextRequest, NextResponse } from 'next/server';
import Bounty from '@/models/Bounty';
import dbConnect from '@/lib/mongodb';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    await dbConnect();
    
    const searchParams = request.nextUrl.searchParams;
    const contractAddress = searchParams.get('contractAddress');
    const bountyProvider = searchParams.get('bountyProvider');
    const status = searchParams.get('status');

    if (contractAddress) {
      const bounty = await Bounty.findOne({ contractAddress });
      
      if (!bounty) {
        return NextResponse.json(
          { success: false, message: 'Bounty not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        bounty
      });
    }

    if (bountyProvider) {
      const query: any = { bountyProvider };
      if (status) query.status = status;

      const bounties = await Bounty.find(query).sort({ createdAt: -1 });

      return NextResponse.json({
        success: true,
        bounties,
        totalCount: bounties.length
      });
    }

    return NextResponse.json(
      { success: false, message: 'Either contractAddress or bountyProvider is required' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error fetching bounty data:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { success: false, message: 'Server error', error: errorMessage },
      { status: 500 }
    );
  }
}