import { NextRequest, NextResponse } from 'next/server';
import { User } from "@/models/User";
import dbConnect from '@/lib/mongodb';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    await dbConnect();
    
    const searchParams = request.nextUrl.searchParams;
    const walletAddress = searchParams.get('walletAddress');
    
    if (!walletAddress) {
      return NextResponse.json(
        { success: false, message: 'Wallet address is required' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ walletAddress })
      .select('-githubAccessToken -githubRefreshToken -githubTokenIV');
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Error fetching user:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { success: false, message: 'Server error', error: errorMessage },
      { status: 500 }
    );
  }
}
