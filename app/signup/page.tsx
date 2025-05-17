"use client";

import { useEffect } from "react";
import { CivicAuthIframeContainer, useUser } from "@civic/auth-web3/react";
import { useAutoConnect } from "@civic/auth-web3/wagmi";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const SignupPage = () => {
  const { user, isLoading } = useUser();
  const router = useRouter();
  
  useAutoConnect();

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard');
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto py-8 px-4">
          <h1 className="text-3xl font-bold mb-8 text-center">Create Your Account</h1>
          <CivicAuthIframeContainer />
        </div>
        <Footer />
      </div>  
    );
  }
  
  // This should not be visible due to the redirect, but as a fallback
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p>Account connected! Redirecting to dashboard...</p>
      </div>
    </div>
  );
}

export default SignupPage;
