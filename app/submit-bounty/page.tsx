"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useUser } from "@civic/auth-web3/react";
import { useAccount } from "wagmi";
import { Navbar } from "@/components/main-components/navbar";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  AlertCircle, 
  Loader2, 
  Clock, 
  Link as LinkIcon,
  FileText, 
  DollarSign,
  Wallet,
  CheckCircle,
  Github
} from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { TimeIntervalSelector } from "@/components/TimeIntervalSelector";

interface BountyFormData {
  title: string;
  issueURL: string;
  description: string;
  bountyAmount: number;
  timeInterval: number;
}

const Page = () => {
  const router = useRouter();
  const { user } = useUser();
  const { address, chain } = useAccount();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [providerData, setProviderData] = useState<any>(null);
  const [isLoadingProvider, setIsLoadingProvider] = useState(false);
  
  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<BountyFormData>({
    defaultValues: {
      title: "",
      issueURL: "",
      description: "",
      bountyAmount: 0.1,
      timeInterval: 604800, // 1 week in seconds
    }
  });
  
  const issueURL = watch("issueURL");
  
  // Fetch provider data when wallet address is available
  useEffect(() => {
    const fetchProviderData = async () => {
      if (!address) return;
      
      setIsLoadingProvider(true);
      try {
        const response = await axios.post("/api/getUserByWalletAddress", {
          walletAddress: address
        });
        
        if (response.data && response.data.provider) {
          setProviderData(response.data.provider);
        }
      } catch (error) {
        console.error("Error fetching provider data:", error);
      } finally {
        setIsLoadingProvider(false);
      }
    };
    
    fetchProviderData();
  }, [address]);
  
  // Validate if issue belongs to provider's organization
  const validateIssueURL = async (issueURL: string) => {
    if (!issueURL || !providerData?.organizationGithub) return true;
    
    // Extract organization and repo from GitHub issue URL
    // Format: https://github.com/organization/repo/issues/number
    const match = issueURL.match(/github\.com\/([^/]+)\/([^/]+)/);
    
    if (!match) return "Invalid GitHub issue URL";
    
    const [, organization] = match;
    
    // Check if the organization matches the provider's organization
    if (organization.toLowerCase() !== providerData.organizationGithub.toLowerCase()) {
      return "Issue must belong to your organization's repository";
    }
    
    return true;
  };
  
  const onSubmit = async (data: BountyFormData) => {
    if (!user?.email || !address) {
      setError("You must be logged in with a connected wallet to submit a bounty");
      return;
    }
    
    // Validate if issue belongs to provider's organization
    const issueValidation = await validateIssueURL(data.issueURL);
    if (typeof issueValidation === "string") {
      setError(issueValidation);
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // In a real implementation, you would deploy the contract here
      // For now, we'll simulate it with a placeholder contract address
      const contractAddress = "0x" + Math.random().toString(16).substring(2, 42);
      
      const bountyData = {
        contractAddress,
        bountyProvider: address,
        bountyAmount: data.bountyAmount,
        timeInterval: data.timeInterval,
        initialTimestamp: Math.floor(Date.now() / 1000),
        status: "OPEN",
        issueURL: data.issueURL,
        title: data.title,
        description: data.description,
        expiresAt: new Date(Date.now() + data.timeInterval * 1000),
      };
      
      const response = await axios.post("/api/submitBounty", bountyData);
      
      setSuccess(true);
      setTimeout(() => {
        router.push(`/bounties/${response.data.bounty._id}`);
      }, 2000);
    } catch (err: any) {
      setError(err.message || "An error occurred while submitting the bounty");
      console.error("Error submitting bounty:", err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-20 w-64 h-64 bg-primary/10 rounded-full filter blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-primary/10 rounded-full filter blur-3xl animate-pulse-slow" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full filter blur-3xl animate-pulse-slow" />
        <div className="noise" />
      </div>
      <Navbar />
      
      <div className="container mx-auto py-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <h1 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            Create New Bounty
          </h1>
          
          <Card className="border border-primary/20 bg-background/50 backdrop-blur-sm p-6">
            {success ? (
              <div className="flex flex-col items-center justify-center py-10">
                <div className="rounded-full bg-green-500/10 p-6 mb-4">
                  <CheckCircle className="h-16 w-16 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Bounty Created Successfully!</h2>
                <p className="text-muted-foreground mb-6">
                  Redirecting you to the bounty page...
                </p>
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 rounded-md flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                )}
                
                <div className="bg-background/30 border border-primary/10 p-4 rounded-lg mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Wallet className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold">Blockchain Info</h3>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Chain:</span>
                      <span className="font-medium text-primary">{chain?.name || "Sepolia"}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Provider Address:</span>
                      <span className="font-mono text-xs text-primary truncate max-w-[250px]">
                        {address || "Not connected"}
                      </span>
                    </div>
                    
                    {providerData?.organizationGithub && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">GitHub Organization:</span>
                        <div className="flex items-center gap-1">
                          <Github className="h-3 w-3" />
                          <span className="font-medium text-primary">{providerData.organizationGithub}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="h-4 w-4 text-primary" />
                    <label htmlFor="title" className="font-semibold">
                      Bounty Title *
                    </label>
                  </div>
                  <input
                    id="title"
                    {...register("title", { required: "Title is required" })}
                    className="w-full px-3 py-2 bg-background/50 border border-primary/20 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="E.g., Fix Memory Leak in Authentication Service"
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                  )}
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <LinkIcon className="h-4 w-4 text-primary" />
                    <label htmlFor="issueURL" className="font-semibold">
                      GitHub Issue URL *
                    </label>
                  </div>
                  <input
                    id="issueURL"
                    {...register("issueURL", { 
                      required: "Issue URL is required",
                      pattern: {
                        value: /^https:\/\/github\.com\/.+\/.+\/issues\/\d+$/,
                        message: "Must be a valid GitHub issue URL"
                      },
                      validate: validateIssueURL
                    })}
                    className="w-full px-3 py-2 bg-background/50 border border-primary/20 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="https://github.com/username/repo/issues/123"
                  />
                  {errors.issueURL && (
                    <p className="text-red-500 text-sm mt-1">{errors.issueURL.message}</p>
                  )}
                  {providerData?.organizationGithub && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Issue must belong to your organization: {providerData.organizationGithub}
                    </p>
                  )}
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="h-4 w-4 text-primary" />
                    <label htmlFor="description" className="font-semibold">
                      Description
                    </label>
                  </div>
                  <textarea
                    id="description"
                    {...register("description")}
                    rows={4}
                    className="w-full px-3 py-2 bg-background/50 border border-primary/20 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Provide details about the bounty..."
                  />
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <label htmlFor="bountyAmount" className="font-semibold">
                      Bounty Amount (ETH) *
                    </label>
                  </div>
                  <input
                    id="bountyAmount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    {...register("bountyAmount", { 
                      required: "Bounty amount is required",
                      min: {
                        value: 0.01,
                        message: "Minimum amount is 0.01 ETH"
                      }
                    })}
                    className="w-full px-3 py-2 bg-background/50 border border-primary/20 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  {errors.bountyAmount && (
                    <p className="text-red-500 text-sm mt-1">{errors.bountyAmount.message}</p>
                  )}
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="h-4 w-4 text-primary" />
                    <label htmlFor="timeInterval" className="font-semibold">
                      Duration *
                    </label>
                  </div>
                  <Controller
                    name="timeInterval"
                    control={control}
                    rules={{ required: "Duration is required" }}
                    render={({ field }) => (
                      <TimeIntervalSelector
                        value={field.value}
                        onChange={field.onChange}
                        error={errors.timeInterval?.message}
                      />
                    )}
                  />
                </div>
                
                <Separator className="my-4 bg-primary/10" />
                
                <Button
                  type="submit"
                  disabled={isSubmitting || !address || isLoadingProvider}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Bounty...
                    </>
                  ) : isLoadingProvider ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading Provider Data...
                    </>
                  ) : (
                    "Create Bounty"
                  )}
                </Button>
                
                {!address && (
                  <p className="text-center text-amber-500 text-sm">
                    Please connect your wallet to create a bounty
                  </p>
                )}
              </form>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Page;
