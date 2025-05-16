import { CivicAuthIframeContainer, useUser } from "@civic/auth-web3/react";
import axios from "axios";
import { useAutoConnect } from "@civic/auth-web3/wagmi";
import { useAccount, useBalance } from "wagmi";
import { formatEther } from "viem";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Briefcase,
  User,
  Github,
  Globe,
  Award,
  Code,
  Wallet,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { HunterFormData, ProviderFormData } from "@/interfaces/Interface";

// User role types
type UserRole = "hunter" | "provider" | null;

function UserDashboard({
  walletCreationInProgress,
}: {
  walletCreationInProgress?: boolean;
}) {
  const { isConnected, address, chain } = useAccount();
  const { user, isLoading: userLoading } = useUser();
  const isLoading = userLoading || walletCreationInProgress;
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [isCheckingRole, setIsCheckingRole] = useState(false);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);

  const hunterForm = useForm<HunterFormData>({
    defaultValues: {
      name: "",
      bio: "",
      skills: "",
      githubProfile: "",
    },
  });

  const providerForm = useForm<ProviderFormData>({
    defaultValues: {
      name: "",
      bio: "",
      website: "",
      companyName: "",
      githubProfile: "",
    },
  });

  useEffect(() => {
    if (user?.name) {
      hunterForm.setValue("name", user.name);
      providerForm.setValue("name", user.name);
    }
  }, [user, hunterForm, providerForm]);

  const ethBalance = useBalance({
    address,
    query: {
      refetchInterval: false,
    },
  });

  const formatBalanceEth = (balance: bigint | undefined) => {
    if (!balance) return (0.0).toFixed(5);
    return Number.parseFloat(formatEther(balance)).toFixed(5);
  };

  useEffect(() => {
    async function checkUserRole() {
      if (!user?.email || !address) return;

      setIsCheckingRole(true);

      try {
        const response = await fetch(`/api/checkUserRole?email=${user.email}`);
        const data = await response.json();

        if (response.ok) {
          if (data.isHunter) {
            setUserRole("hunter");
            setUserData(data.hunter);
          } else if (data.isProvider) {
            setUserRole("provider");
            setUserData(data.provider);
          } else {
            setShowRoleSelection(true);
          }
        } else {
          console.error("Error checking user role:", data.error);
          setShowRoleSelection(true);
        }
      } catch (error) {
        console.error("Error checking user role:", error);
        setShowRoleSelection(true);
      } finally {
        setIsCheckingRole(false);
      }
    }

    if (user && address) {
      checkUserRole();
    }
  }, [user, address]);

  const handleRoleSelect = (role: UserRole) => {
    setUserRole(role);
    setShowRoleSelection(false);
    setShowOnboarding(true);
  };

  //  const onHunterSubmit = async (data: HunterFormData) => {
  //   if (!user?.email || !address) return;
    
  //   setSaveStatus("saving");
    
  //   try {
  //     const hunterData = {
  //       walletAddress: address,
  //       email: user.email,
  //       name: data.name,
  //       bio: data.bio || null,
  //       skills: data.skills.split(',').map(skill => skill.trim()),
  //       githubProfile: data.githubProfile || null
  //     };
      
  //     const response = await fetch('/api/addBountyHunter', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(hunterData),
  //     });
      
  //     const responseData = await response.json();
      
  //     if (response.ok) {
  //       setSaveStatus("saved");
  //       setUserData(responseData.hunter);
  //       setShowOnboarding(false);
  //     } else {
  //       setSaveStatus("error");
  //       console.error("Error saving hunter data:", responseData.error);
  //     }
  //   } catch (error) {
  //     setSaveStatus("error");
  //     console.error("Error saving hunter data:", error);
  //   }
  // };

  // // Handle provider form submission
  // const onProviderSubmit = async (data: ProviderFormData) => {
  //   if (!user?.email || !address) return;
    
  //   setSaveStatus("saving");
    
  //   try {
  //     const providerData = {
  //       walletAddress: address,
  //       email: user.email,
  //       name: data.name,
  //       bio: data.bio || null,
  //       website: data.website || null,
  //       companyName: data.companyName || null,
  //       githubProfile: data.githubProfile || null
  //     };
      
  //     const response = await fetch('/api/addBountyProvider', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(providerData),
  //     });
      
  //     const responseData = await response.json();
      
  //     if (response.ok) {
  //       setSaveStatus("saved");
  //       setUserData(responseData.provider);
  //       setShowOnboarding(false);
  //     } else {
  //       setSaveStatus("error");
  //       console.error("Error saving provider data:", responseData.error);
  //     }
  //   } catch (error) {
  //     setSaveStatus("error");
  //     console.error("Error saving provider data:", error);
  //   }
  // };

  // will fix them when i have time
  const onHunterSubmit = async (data: HunterFormData) => {
    if (!user?.email || !address) return;

    setSaveStatus("saving");

    try {
      const hunterData = {
        walletAddress: address,
        email: user.email,
        name: data.name,
        bio: data.bio || null,
        skills: data.skills.split(",").map((skill) => skill.trim()),
        githubProfile: data.githubProfile || null,
      };

      const response = await axios.post("/api/addBountyHunter", hunterData);

      setSaveStatus("saved");
      setUserData(response.data.hunter);
      setShowOnboarding(false);
    } catch (error) {
      setSaveStatus("error");
      if ((error as Error).message) {
        console.error("Error saving hunter data:", (error as Error).message);
      } else {
        console.error("Error saving hunter data:", (error as Error).message);
      }
    }
  };

  const onProviderSubmit = async (data: ProviderFormData) => {
    if (!user?.email || !address) return;

    setSaveStatus("saving");

    try {
      const providerData = {
        walletAddress: address,
        email: user.email,
        name: data.name,
        bio: data.bio || null,
        website: data.website || null,
        companyName: data.companyName || null,
        githubProfile: data.githubProfile || null,
      };

      const response = await axios.post("/api/addBountyProvider", providerData);

      setSaveStatus("saved");
      setUserData(response.data);
      setShowOnboarding(false);
    } catch (error) {
      setSaveStatus("error");
      if ((error as Error).message) {
        console.error("Error saving provider data:", (error as Error).message);
      } else {
        console.error("Error saving provider data:", (error as Error).message);
      }
    }
  };

  if (!isConnected || isLoading || isCheckingRole) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="rounded-full bg-primary/10 p-6 mb-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
        </div>
        <p className="text-lg text-muted-foreground">
          Connecting wallet. Please wait...
        </p>
      </div>
    );
  }

  if (showRoleSelection) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md mx-auto"
      >
        <Card className="border border-primary/20 bg-background/50 backdrop-blur-sm p-6">
          <h2 className="text-2xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            Choose Your Role
          </h2>

          <div className="space-y-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleRoleSelect("hunter")}
              className="border border-primary/20 rounded-lg p-4 cursor-pointer hover:bg-primary/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <Code className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Bounty Hunter</h3>
                  <p className="text-muted-foreground">
                    Find and solve bounties to earn rewards
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleRoleSelect("provider")}
              className="border border-primary/20 rounded-lg p-4 cursor-pointer hover:bg-primary/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Bounty Provider</h3>
                  <p className="text-muted-foreground">
                    Create bounties for issues you need solved
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </Card>
      </motion.div>
    );
  }

  if (showOnboarding) {
    if (userRole === "hunter") {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md mx-auto"
        >
          <Card className="border border-primary/20 bg-background/50 backdrop-blur-sm p-6">
            <h2 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              Complete Your Hunter Profile
            </h2>

            <form onSubmit={hunterForm.handleSubmit(onHunterSubmit)}>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    {...hunterForm.register("name", { required: true })}
                    className="w-full px-3 py-2 bg-background/50 border border-primary/20 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  {hunterForm.formState.errors.name && (
                    <p className="text-red-500 text-sm mt-1">
                      Name is required
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Bio</label>
                  <textarea
                    {...hunterForm.register("bio")}
                    className="w-full px-3 py-2 bg-background/50 border border-primary/20 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Skills (comma separated)
                  </label>
                  <input
                    {...hunterForm.register("skills", { required: true })}
                    className="w-full px-3 py-2 bg-background/50 border border-primary/20 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="React, Solidity, Web3"
                  />
                  {hunterForm.formState.errors.skills && (
                    <p className="text-red-500 text-sm mt-1">
                      Skills are required
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    GitHub Profile
                  </label>
                  <input
                    {...hunterForm.register("githubProfile")}
                    className="w-full px-3 py-2 bg-background/50 border border-primary/20 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="https://github.com/username"
                  />
                </div>
              </div>

              {saveStatus === "error" && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-500 rounded-md flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Error saving profile. Please try again.
                </div>
              )}

              <Button
                type="submit"
                disabled={saveStatus === "saving"}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {saveStatus === "saving" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save Profile"
                )}
              </Button>
            </form>
          </Card>
        </motion.div>
      );
    } else if (userRole === "provider") {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md mx-auto"
        >
          <Card className="border border-primary/20 bg-background/50 backdrop-blur-sm p-6">
            <h2 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              Complete Your Provider Profile
            </h2>

            <form onSubmit={providerForm.handleSubmit(onProviderSubmit)}>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    {...providerForm.register("name", { required: true })}
                    className="w-full px-3 py-2 bg-background/50 border border-primary/20 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  {providerForm.formState.errors.name && (
                    <p className="text-red-500 text-sm mt-1">
                      Name is required
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Company Name
                  </label>
                  <input
                    {...providerForm.register("companyName")}
                    className="w-full px-3 py-2 bg-background/50 border border-primary/20 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Bio</label>
                  <textarea
                    {...providerForm.register("bio")}
                    className="w-full px-3 py-2 bg-background/50 border border-primary/20 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Website
                  </label>
                  <input
                    {...providerForm.register("website")}
                    className="w-full px-3 py-2 bg-background/50 border border-primary/20 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    GitHub Profile
                  </label>
                  <input
                    {...providerForm.register("githubProfile")}
                    className="w-full px-3 py-2 bg-background/50 border border-primary/20 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="https://github.com/username"
                  />
                </div>
              </div>

              {saveStatus === "error" && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-500 rounded-md flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Error saving profile. Please try again.
                </div>
              )}

              <Button
                type="submit"
                disabled={saveStatus === "saving"}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {saveStatus === "saving" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save Profile"
                )}
              </Button>
            </form>
          </Card>
        </motion.div>
      );
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full mx-auto p-4"
    >
      <Card className="border flex border-primary/20 bg-background/50 backdrop-blur-sm p-6 ">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-full bg-primary/10 p-2">
            {userRole === "hunter" ? (
              <Code className="h-5 w-5 text-primary" />
            ) : (
              <Briefcase className="h-5 w-5 text-primary" />
            )}
          </div>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            {userRole === "hunter" ? "Bounty Hunter" : "Bounty Provider"}{" "}
            Dashboard
          </h2>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Wallet className="h-4 w-4 text-primary" />
            <h3 className="text-lg font-semibold">Blockchain Info</h3>
          </div>
          <div className="bg-background/30 border border-primary/10 p-4 rounded-lg">
            <p className="flex justify-between py-1">
              <span className="text-muted-foreground">Chain:</span>
              <Badge
                variant="outline"
                className="bg-primary/10 text-primary border-primary/30"
              >
                {chain?.name}
              </Badge>
            </p>
            <p className="flex justify-between py-1">
              <span className="text-muted-foreground">Wallet:</span>
              <span className="text-sm font-mono text-primary">
                {address}
              </span>
            </p>
            <p className="flex justify-between py-1">
              <span className="text-muted-foreground">Balance:</span>
              <span className="font-bold text-primary">
                {formatBalanceEth(ethBalance?.data?.value)} USDC
              </span>
            </p>
          </div>
        </div>

        {userData && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <User className="h-4 w-4 text-primary" />
              <h3 className="text-lg font-semibold">Profile Info</h3>
            </div>
            <div className="bg-background/30 border border-primary/10 p-4 rounded-lg">
              <div className="space-y-2">
                <p className="flex justify-between py-1">
                  <span className="text-muted-foreground">Name:</span>
                  <span>{userData.name}</span>
                </p>
                <p className="flex justify-between py-1">
                  <span className="text-muted-foreground">Email:</span>
                  <span>{userData.email}</span>
                </p>

                {userData.bio && (
                  <div className="py-1">
                    <span className="text-muted-foreground">Bio:</span>
                    <p className="mt-1 text-sm">{userData.bio}</p>
                  </div>
                )}

                {userRole === "hunter" && (
                  <>
                    {userData.skills && userData.skills.length > 0 && (
                      <div className="py-1">
                        <span className="text-muted-foreground">Skills:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {userData.skills.map(
                            (skill: string, index: number) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="bg-primary/10 border-primary/30"
                              >
                                {skill}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-4 py-1">
                      <div className="flex-1">
                        <span className="text-muted-foreground block text-sm">
                          Participated
                        </span>
                        <span className="text-xl font-bold text-primary">
                          {userData.bountiesParticipatedIn || 0}
                        </span>
                      </div>
                      <div className="flex-1">
                        <span className="text-muted-foreground block text-sm">
                          Won
                        </span>
                        <span className="text-xl font-bold text-primary">
                          {userData.bountiesWon || 0}
                        </span>
                      </div>
                    </div>
                  </>
                )}

                {userRole === "provider" && (
                  <>
                    {userData.companyName && (
                      <p className="flex justify-between py-1">
                        <span className="text-muted-foreground">Company:</span>
                        <span>{userData.companyName}</span>
                      </p>
                    )}

                    {userData.website && (
                      <p className="flex justify-between py-1">
                        <span className="text-muted-foreground">Website:</span>
                        <a
                          href={userData.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center"
                        >
                          <Globe className="h-3 w-3 mr-1" />
                          {userData.website.replace(/(^\w+:|^)\/\//, "")}
                        </a>
                      </p>
                    )}

                    <div className="flex gap-4 py-1">
                      <div className="flex-1">
                        <span className="text-muted-foreground block text-sm">
                          Listed
                        </span>
                        <span className="text-xl font-bold text-primary">
                          {userData.bountiesListed || 0}
                        </span>
                      </div>
                      <div className="flex-1">
                        <span className="text-muted-foreground block text-sm">
                          Distributed
                        </span>
                        <span className="text-xl font-bold text-primary">
                          {userData.bountiesDistributed || 0}
                        </span>
                      </div>
                    </div>
                  </>
                )}

                {userData.githubProfile && (
                  <p className="flex justify-between py-1">
                    <span className="text-muted-foreground">GitHub:</span>
                    <a
                      href={userData.githubProfile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center"
                    >
                      <Github className="h-3 w-3 mr-1" />
                      {userData.githubProfile.replace(
                        "https://github.com/",
                        ""
                      )}
                    </a>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <Separator className="my-4 bg-primary/10" />

        {userRole === "hunter" && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Award className="h-4 w-4 text-primary" />
              <h3 className="text-lg font-semibold">Available Bounties</h3>
            </div>
            <div className="bg-background/30 border border-primary/10 p-6 rounded-lg text-center">
              <p className="text-muted-foreground">
                No bounties available at the moment.
              </p>
            </div>
          </div>
        )}

        {userRole === "provider" && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Award className="h-4 w-4 text-primary" />
              <h3 className="text-lg font-semibold">Your Bounties</h3>
            </div>
            <div className="bg-background/30 border border-primary/10 p-6 rounded-lg text-center mb-4">
              <p className="text-muted-foreground mb-4">
                You haven't created any bounties yet.
              </p>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link href="/submit-bounty">Create New Bounty</Link>
              </Button>
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
}

function Dashboard() {
  const { user, isLoading, walletCreationInProgress } = useUser();
  useAutoConnect();

  if (!isLoading && !user) return <CivicAuthIframeContainer />; //hav to modify this coimponent after clicking on register user

  return (
    <>
      <UserDashboard walletCreationInProgress={walletCreationInProgress} />
    </>
  );
}

export { Dashboard };
