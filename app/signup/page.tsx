// app/signup/page.tsx
"use client";

import { useEffect, useState } from "react";
import { CivicAuthIframeContainer, useUser } from "@civic/auth-web3/react";
import { useAutoConnect } from "@civic/auth-web3/wagmi";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import UserRegistrationForm from "@/components/UserRegistrationForm";

const SignupPage = () => {
  const { user, isLoading } = useUser();
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [isCheckingDb, setIsCheckingDb] = useState(false);
  const [needsRegistration, setNeedsRegistration] = useState(false);
  
  useAutoConnect();

  useEffect(() => {
    const checkUserInDatabase = async () => {
      if (!isConnected || !address) return;
      
      setIsCheckingDb(true);
      try {
        const response = await fetch(`/api/checkUser?walletAddress=${address}`);
        const data = await response.json();
        
        if (data.success && data.exists) {
          router.push('/dashboard');
        } else {
          setNeedsRegistration(true);
        }
      } catch (error) {
        console.error("Error checking user in database:", error);
        setNeedsRegistration(true);
      } finally {
        setIsCheckingDb(false);
      }
    };

    if (!isLoading && user && isConnected) {
      checkUserInDatabase();
    }
  }, [isLoading, user, isConnected, address, router]);

  if (isLoading || isCheckingDb) {
    return (
      <div>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>{isCheckingDb ? "Checking your account..." : "Loading..."}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user || !isConnected) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto py-8 px-4">
          <h1 className="text-3xl font-bold mb-8 text-center">Create Your Account</h1>
          <div className="max-w-md mx-auto">
            <CivicAuthIframeContainer />
          </div>
        </div>
        <Footer />
      </div>  
    );
  }

  if (needsRegistration) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto py-8 px-4">
          <h1 className="text-3xl font-bold mb-8 text-center">Complete Your Registration</h1>
          <UserRegistrationForm 
            walletAddress={address!} 
            onRegistrationComplete={() => router.push('/dashboard')}
          />
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div>
      <Navbar />
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p>Account connected! Redirecting to dashboard...</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default SignupPage;