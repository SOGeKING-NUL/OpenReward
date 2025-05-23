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

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    await dbConnect();

    const data: CreateBountyRequest = await request.json();

    // Validate required fields
    const { 
      contractAddress, 
      bountyProvider, 
      bountyAmount, 
      timeInterval, 
      initialTimestamp, 
      issueURL, 
      title, 
      expiresAt 
    } = data;

    if (!contractAddress || !bountyProvider || !bountyAmount || !timeInterval || 
        !initialTimestamp || !issueURL || !title || !expiresAt) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate bounty amount is positive
    if (bountyAmount <= 0) {
      return NextResponse.json(
        { success: false, message: 'Bounty amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Validate time interval is positive
    if (timeInterval <= 0) {
      return NextResponse.json(
        { success: false, message: 'Time interval must be greater than 0' },
        { status: 400 }
      );
    }

    // Validate expiry date is in the future
    const expiryDate = new Date(expiresAt);
    if (expiryDate <= new Date()) {
      return NextResponse.json(
        { success: false, message: 'Expiry date must be in the future' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(issueURL);
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid issue URL format' },
        { status: 400 }
      );
    }

    // Check if bounty with same contract address already exists
    const existingBounty = await Bounty.findOne({ contractAddress });
    if (existingBounty) {
      return NextResponse.json(
        { success: false, message: 'Bounty with this contract address already exists' },
        { status: 409 }
      );
    }

    // Create new bounty
    const newBounty = new Bounty({
      contractAddress,
      bountyProvider,
      bountyAmount,
      timeInterval,
      initialTimestamp,
      issueURL,
      title,
      description: data.description || '',
      expiresAt: expiryDate,
      lastSyncedAt: new Date()
    });

    await newBounty.save();

    return NextResponse.json(
      { 
        success: true, 
        message: 'Bounty created successfully', 
        bounty: newBounty 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating bounty:', error);
    
    // Handle duplicate key error
    if ((error as any).code === 11000) {
      return NextResponse.json(
        { success: false, message: 'Bounty with this contract address already exists' },
        { status: 409 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Server error', 
        error: errorMessage 
      },
      { status: 500 }
    );
  }
}


