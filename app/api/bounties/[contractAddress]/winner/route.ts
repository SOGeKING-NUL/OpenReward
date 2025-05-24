// app/api/bounties/[contractAddress]/winner/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Bounty from '@/models/Bounty';
import dbConnect from '@/lib/mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ contractAddress: string }> }
): Promise<NextResponse> {
  try {
    await dbConnect();
    
    // Await the params Promise in Next.js 15
    const { contractAddress } = await params;

    if (!contractAddress) {
      return NextResponse.json(null, { status: 400 });
    }

    const bounty = await Bounty.findOne({ contractAddress });
    
    if (!bounty) {
      return NextResponse.json(null, { status: 404 });
    }

    const bountyWinner = bounty.bountyWinner;
    
    // Return null if no winner
    if (bountyWinner === null || bountyWinner === undefined) {
      return NextResponse.json(null);
    }

    // Return formatted 20-byte address if winner exists
    if (typeof bountyWinner === 'string') {
      const formattedAddress = bountyWinner.startsWith('0x') 
        ? bountyWinner.toLowerCase() 
        : `0x${bountyWinner.toLowerCase()}`;
      
      return NextResponse.json(formattedAddress);
    }

    // Return null for invalid data
    return NextResponse.json(null);

  } catch (error) {
    console.error('Error checking bounty winner:', error);
    return NextResponse.json(null, { status: 500 });
  }
}
