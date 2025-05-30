import { NextRequest, NextResponse } from 'next/server';
import { User } from "@/models/User";
import dbConnect from '@/lib/mongodb';


export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    await dbConnect();
    
    const searchParams = request.nextUrl.searchParams;
    const walletAddress = searchParams.get('walletAddress');
    const email = searchParams.get('email');
    const username = searchParams.get('username');
    
    if (!walletAddress && !email && !username) {
      return NextResponse.json(
        { success: false, message: 'At least one search parameter is required' },
        { status: 400 }
      );
    }

    let user = null;

    if (walletAddress) {
      user = await User.findOne({ walletAddress }).select('userType');
    } else if (email) {
      user = await User.findOne({ email }).select('userType');
    } else if (username) {
      user = await User.findOne({ username }).select('userType');
    };


    if (user) {
      return NextResponse.json({
        success: true,
        exists: true,
        userType: user.userType
      });
    }

    return NextResponse.json({
      success: true,
      exists: false
    });

  } catch (error) {
    console.error('Error checking user:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { success: false, message: 'Server error', error: errorMessage },
      { status: 500 }
    );
  }
}
