"use client"

import { useEffect, useState } from "react";
import { useAccount, useBalance } from "wagmi";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useUser } from "@civic/auth-web3/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Github, Globe, Calendar, Award, DollarSign, FileText, Copy } from "lucide-react";

interface UserData {
  walletAddress: string;
  email: string;
  name: string;
  username: string;
  profilePicture?: string;
  bio?: string;
  githubUsername?: string;
  githubId?: string;
  githubConnected: boolean;
  joinedDate: string;
  userType: "BountyHunter" | "BountyProvider";
  // BountyHunter specific
  skills?: string[];
  bountiesParticipatedIn?: string[];
  bountiesWon?: string[];
  totalAmountWon?: number;
  activeBountySubmissions?: string[];
  // BountyProvider specific
  organizationName?: string;
  organizationWebsite?: string;
  userRoleInOrganization?: string;
  repositories?: Array<{ name: string; url: string }>;
  bountiesListed?: number;
  totalAmountDistributed?: number;
}

export default function DashboardPage() {
  const { isConnected, address, chain } = useAccount();
  const { data: balanceData } = useBalance({ address });
  const { user: civicUser, isLoading: isCivicLoading } = useUser();
  const router = useRouter();
  
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Redirect to signup if not connected to wallet or civic
    if (!isCivicLoading && (!civicUser || !isConnected || !address)) {
      router.push('/signup');
      return;
    }

    const fetchUserData = async () => {
      if (!address) return;
      
      setIsLoading(true);
      try {
        const response = await fetch(`/api/fetchUser?walletAddress=${address}`);
        const data = await response.json();
        
        if (!response.ok) {
          if (response.status === 404) {
            // User not found in database, redirect to complete registration
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
        setIsLoading(false);
      }
    };

    if (address && !isCivicLoading && civicUser) {
      fetchUserData();
    }
  }, [address, civicUser, isCivicLoading, router, isConnected]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  if (isCivicLoading || isLoading) {
    return (
      <div>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white mx-auto mb-4"></div>
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
            <p>No user data found. Redirecting to registration...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div>
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        {/* Header Section */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={userData.profilePicture} alt={userData.name} />
                  <AvatarFallback className="text-lg">
                    {userData.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-3xl font-bold">{userData.name}</h1>
                    <Badge variant={userData.userType === 'BountyHunter' ? 'default' : 'secondary'}>
                      {userData.userType === 'BountyHunter' ? 'Bounty Hunter' : 'Bounty Provider'}
                    </Badge>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">@{userData.username}</p>
                  {userData.bio && (
                    <p className="mt-2 text-gray-700 dark:text-gray-300">{userData.bio}</p>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-black dark:text-white" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Joined</p>
                  <p className="text-2xl font-bold">{formatDate(userData.joinedDate)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {userData.userType === 'BountyHunter' ? (
            <>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Award className="h-8 w-8 text-black dark:text-white" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Bounties Won</p>
                      <p className="text-2xl font-bold">{userData.bountiesWon?.length || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-black dark:text-white" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Earned</p>
                      <p className="text-2xl font-bold">${userData.totalAmountWon || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-black dark:text-white" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Submissions</p>
                      <p className="text-2xl font-bold">{userData.activeBountySubmissions?.length || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-black dark:text-white" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Bounties Listed</p>
                      <p className="text-2xl font-bold">{userData.bountiesListed || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-black dark:text-white" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Distributed</p>
                      <p className="text-2xl font-bold">${userData.totalAmountDistributed || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</p>
                <p className="text-lg">{userData.email}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Wallet Address</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded break-all flex-1">
                    {userData.walletAddress}
                  </p>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(userData.walletAddress)}
                    className="shrink-0"
                    title="Copy wallet address"
                  >
                    <Copy className="h-4 w-4 text-black dark:text-white" />
                  </Button>
                </div>
                {copied && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    Copied to clipboard!
                  </p>
                )}
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Wallet Balance</p>
                <p className="text-lg font-semibold">
                  {balanceData?.formatted ? 
                    `${parseFloat(balanceData.formatted).toFixed(4)} ${balanceData.symbol}` : 
                    'Loading...'
                  }
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Network</p>
                <p className="text-lg">{chain?.name || 'Not connected'}</p>
              </div>

              {userData.githubConnected && userData.githubUsername && (
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">GitHub</p>
                  <div className="flex items-center gap-2">
                    <Github className="h-4 w-4 text-black dark:text-white" />
                    <a 
                      href={`https://github.com/${userData.githubUsername}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-black dark:text-white hover:underline"
                    >
                      @{userData.githubUsername}
                    </a>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* User Type Specific Information */}
          <Card>
            <CardHeader>
              <CardTitle>
                {userData.userType === 'BountyHunter' ? 'Skills & Expertise' : 'Organization Details'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userData.userType === 'BountyHunter' ? (
                <div className="space-y-4">
                  {userData.skills && userData.skills.length > 0 ? (
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {userData.skills.map((skill, index) => (
                          <Badge key={index} variant="outline">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">No skills listed yet</p>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Bounties Participated</p>
                    <p className="text-lg">{userData.bountiesParticipatedIn?.length || 0}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {userData.organizationName && (
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Organization</p>
                      <p className="text-lg">{userData.organizationName}</p>
                    </div>
                  )}
                  {userData.userRoleInOrganization && (
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Role</p>
                      <p className="text-lg">{userData.userRoleInOrganization}</p>
                    </div>
                  )}
                  {userData.organizationWebsite && (
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Website</p>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-black dark:text-white" />
                        <a 
                          href={userData.organizationWebsite}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-black dark:text-white hover:underline"
                        >
                          {userData.organizationWebsite}
                        </a>
                      </div>
                    </div>
                  )}
                  {userData.repositories && userData.repositories.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Repositories</p>
                      <div className="space-y-2">
                        {userData.repositories.map((repo, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Github className="h-4 w-4 text-black dark:text-white" />
                            <a 
                              href={repo.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-black dark:text-white hover:underline"
                            >
                              {repo.name}
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <Button size="lg">
            {userData.userType === 'BountyHunter' ? 'Find Bounties' : 'Create Bounty'}
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
