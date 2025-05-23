import { NextRequest, NextResponse } from 'next/server';
import Bounty from '@/models/Bounty';
import dbConnect from '@/lib/mongodb';

interface CreateBountyRequest {
  contractAddress: string;
  bountyProvider: string;
  bountyAmount: number;
  timeInterval: number;
  initialTimestamp: number;
  issueURL: string;
  title: string;
  description?: string;
  expiresAt: string; 
}

// GET endpoint to retrieve bounties with optional filtering
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const bountyProvider = searchParams.get('bountyProvider');
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');

    // Build query object
    const query: any = {};
    if (status) query.status = status;
    if (bountyProvider) query.bountyProvider = bountyProvider;

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Fetch bounties with pagination
    const bounties = await Bounty.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    // Get total count for pagination
    const totalCount = await Bounty.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      bounties,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching bounties:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { success: false, message: 'Server error', error: errorMessage },
      { status: 500 }
    );
  }
}