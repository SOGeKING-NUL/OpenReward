"use client"

import { useEffect, useState } from "react";
import { useAccount, useBalance } from "wagmi";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useUser } from "@civic/auth-web3/react";
import { useRouter } from "next/navigation";
import ProviderDashboard from "@/components/dashboard/ProviderDashboard";
import HunterDashboard from "@/components/dashboard/HunterDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Copy, Calendar, Github } from "lucide-react";

interface UserData {
  walletAddress: string;
  email: string;
  name: string;
  username: string;
  profilePicture?: string;
  bio?: string;
  githubUsername?: string;
  githubConnected: boolean;
  joinedDate: string;
  userType: "BountyHunter" | "BountyProvider";

  skills?: string[];
  bountiesWon?: string[];
  totalAmountWon?: number;
  activeBountySubmissions?: string[];
  organizationName?: string;
  organizationWebsite?: string;
  userRoleInOrganization?: string;
  repositories?: Array<{ name: string; url: string }>;
  bountiesListed?: number;
  totalAmountDistributed?: number;
}

function CopyButton({ textToCopy }: { textToCopy: string | undefined }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Button
      onClick={handleCopy}
      variant="ghost"
      size="sm"
      className="ml-2 h-7 px-2"
      aria-label="Copy wallet address"
    >
      <Copy className="h-3 w-3 mr-1" />
      {copied ? 'Copied!' : 'Copy'}
    </Button>
  );
}

export default function DashboardPage() {
  const { isConnected, address, chain } = useAccount();
  const { data: balanceData, isLoading: isBalanceLoading } = useBalance({ address });
  const { user: civicUser, isLoading: isCivicLoading } = useUser();
  const router = useRouter();

  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isCivicLoading && (!civicUser || !isConnected || !address)) {
      router.push('/signup');
      return;
    }

    const fetchUserData = async () => {
      if (!address) return;

      setIsLoadingData(true);
      try {
        const response = await fetch(`/api/fetchUser?walletAddress=${address}`);
        const data = await response.json();

        if (!response.ok) {
          if (response.status === 404) {

            router.push('/signup');
            return;
          }
          throw new Error(data.message || 'Failed to fetch user data');
        }
        setUserData(data.user);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load user data');
      } finally {
        setIsLoadingData(false);
      }
    };

    if (address && !isCivicLoading && civicUser) {
      fetchUserData();
    }
  }, [address, civicUser, isCivicLoading, router, isConnected]);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isCivicLoading || isLoadingData || isBalanceLoading) {
    return (
      <div>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading your dashboard...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto py-8 px-4">
          <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-4 rounded">
            {error}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!userData) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto py-8 px-4">
          <div className="text-center">
            <p>User data not available. Please try again or contact support.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container mx-auto py-8 px-4">

        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Avatar className="w-24 h-24 ring-2 ring-primary">
                <AvatarImage src={userData.profilePicture} alt={userData.name} />
                <AvatarFallback className="text-3xl">
                  {userData.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-3xl font-bold">{userData.name}</h1>
                <p className="text-muted-foreground">@{userData.username}</p>
                {userData.bio && (
                  <p className="text-sm text-muted-foreground mt-2 max-w-xl">{userData.bio}</p>
                )}
              </div>
              <div className="text-center sm:text-right space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center justify-center sm:justify-end">
                    <Calendar className="h-4 w-4 mr-2" /> Joined: {formatDate(userData.joinedDate)}
                  </p>
                  {userData.githubConnected && userData.githubUsername && (
                    <a
                        href={`https://github.com/${userData.githubUsername}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center justify-center sm:justify-end"
                    >
                        <Github className="h-4 w-4 mr-2" /> @{userData.githubUsername}
                    </a>
                  )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-medium text-muted-foreground">Wallet Address</p>
                <div className="flex items-center">
                  <span className="font-mono break-all">{address}</span>
                  <CopyButton textToCopy={address} />
                </div>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Wallet Balance</p>
                <p className="font-mono">
                  {balanceData ? `${parseFloat(balanceData.formatted).toFixed(4)} ${balanceData.symbol}` : 'Loading...'}
                </p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Connected Network</p>
                <p>{chain?.name || 'Not connected'}</p>
              </div>
            </div>
          </CardContent>
        </Card>


        {userData.userType === 'BountyHunter' ? (
          <HunterDashboard userData={userData} />
        ) : (
          <ProviderDashboard userData={userData} />
        )}

        <div className="mt-8 flex gap-4">
          <Button size="lg">
            {userData.userType === 'BountyHunter' ? 'Find Bounties' : 'Create New Bounty'}
          </Button>
          <Button variant="outline" size="lg">
            Edit Profile
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
