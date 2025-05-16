import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { BountyProvider } from '@/models/BountyProviderModel';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { walletAddress } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'walletAddress is required in the request body' },
        { status: 400 }
      );
    }

    const provider = await BountyProvider.findOne({ walletAddress });

    if (!provider) {
      return NextResponse.json(
        { error: 'No bounty provider found with the given wallet address' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { provider },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching bounty provider:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
