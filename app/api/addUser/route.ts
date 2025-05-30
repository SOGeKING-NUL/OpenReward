import {NextRequest, NextResponse} from 'next/server';
import {User,BountyHunter, BountyProvider} from "@/models/User";
import dbConnect from "@/lib/mongodb";

interface BaseUserData {
  walletAddress: string;
  email: string;
  name: string;
  username: string;
  profilePicture?: string;
  bio?: string;
  githubUsername?: string;
  githubId?: string;
  githubConnected?: boolean;
  githubAccessToken?: string;
  githubRefreshToken?: string;
  githubTokenExpiry?: Date;
}

interface BountyHunterData extends BaseUserData {
  userType: 'BountyHunter';
  skills?: string[];
}

interface Repository {
  name: string;
  url: string;
};

interface BountyProviderData extends BaseUserData {
  userType: 'BountyProvider';
  organizationName?: string;
  organizationId?: string;
  organizationWebsite?: string;
  userRoleInOrganization?: string;
  repositories?: Repository[];
}

type UserRegistrationData = BountyHunterData | BountyProviderData;

export async function POST(request: NextRequest){  
    try{

        await dbConnect();

        const data: UserRegistrationData = await request.json();     
        
        //checks

        const { walletAddress, email, name, username, userType } = data;
        if (!walletAddress || !email || !name || !username || !userType){
            return NextResponse.json({
                success: false,
                message: 'Missing required fields',
            },
            {status: 400}
            );
        };

        if (userType === 'BountyProvider') {
            const providerData = data as BountyProviderData;

            if (!providerData.repositories || providerData.repositories.length === 0) {
                return NextResponse.json(
                { 
                    success: false, 
                    message: 'At least one repository is required for Bounty Providers' 
                },
                { status: 400 }
                );
            };

            for (const repo of providerData.repositories) {
                if (!repo.url) {
                    return NextResponse.json(
                        { 
                        success: false, 
                        message: 'Repo with no name or url' 
                        },
                        { status: 400 }
                    );
                };
            };
        };

        const existingUser = await User.findOne({ 
            $or: [
                { walletAddress }, 
                { email },
                { username } 
            ] 
        });
        
        if (existingUser){

            let conflictField = 'user';
            if (existingUser.walletAddress === walletAddress) {
                conflictField = 'wallet address';
            } else if (existingUser.email === email) {
                conflictField = 'email';
            } else if (existingUser.username === username) {
                conflictField = 'username';
            }
            
            return NextResponse.json({
                success: false,
                message: `A user with this ${conflictField} already exists`,
            },
            {status: 409} 
            );
        }

        const baseUserData: BaseUserData = {
            walletAddress,
            email,
            name,
            username,
            profilePicture: data.profilePicture,
            bio: data.bio,
            githubUsername: data.githubUsername,
            githubId: data.githubId,
            githubConnected: data.githubConnected || false,
            githubAccessToken: data.githubAccessToken,
            githubRefreshToken: data.githubRefreshToken,
            githubTokenExpiry: data.githubTokenExpiry
        };

        //create user
        let newUser;
        
        if (userType === 'BountyHunter') {
            const hunterData = data as BountyHunterData;

            newUser = new BountyHunter({
                ...baseUserData, 
                skills: hunterData.skills || []
            });
        }
        else if (userType === 'BountyProvider') {
            const providerData = data as BountyProviderData;

            newUser = new BountyProvider({
                ...baseUserData,
                organizationName: providerData.organizationName,
                organizationId: providerData.organizationId,
                organizationWebsite: providerData.organizationWebsite,
                userRoleInOrganization: providerData.userRoleInOrganization,
                repositories: providerData.repositories
            });
        }
        else {
            return NextResponse.json({
                success: false,
                message: 'Invalid user type',
            },
            {status: 400}
            );
        };

        await newUser.save();
        
        const userResponse = newUser.toObject();
        delete userResponse.githubAccessToken;
        delete userResponse.githubRefreshToken;
        delete userResponse.githubTokenIV;

        return NextResponse.json(
        { 
            success: true, 
            message: 'User registered successfully', 
            user: userResponse 
        },
        { status: 201 }
        );
    }catch(error){
        console.error("Error registering User", error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return NextResponse.json({
            success: false, 
            message: 'Server error', 
            error: errorMessage
        },
        {status: 500}
        );
    };
}
