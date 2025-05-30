// app/api-test/page.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ApiTestPage() {
  const [activeTab, setActiveTab] = useState<string>("checkUser");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Check User API
  const [checkUserParams, setCheckUserParams] = useState({
    walletAddress: "",
    email: "",
    username: ""
  });
  
  // Fetch User API
  const [fetchUserParams, setFetchUserParams] = useState({
    walletAddress: ""
  });

  const handleCheckUserParamChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCheckUserParams(prev => ({ ...prev, [name]: value }));
  };

  const handleFetchUserParamChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFetchUserParams(prev => ({ ...prev, [name]: value }));
  };

  const testCheckUserApi = async () => {
    setIsLoading(true);
    setResponse(null);
    setError(null);
    
    try {
      // Build query string
      const params = new URLSearchParams();
      if (checkUserParams.walletAddress) params.append("walletAddress", checkUserParams.walletAddress);
      if (checkUserParams.email) params.append("email", checkUserParams.email);
      if (checkUserParams.username) params.append("username", checkUserParams.username);
      
      const response = await fetch(`/api/checkUser?${params.toString()}`);
      const data = await response.json();
      
      setResponse(data);
      
      if (!response.ok) {
        throw new Error(data.message || "API request failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const testFetchUserApi = async () => {
    setIsLoading(true);
    setResponse(null);
    setError(null);
    
    try {
      // Build query string
      const params = new URLSearchParams();
      if (fetchUserParams.walletAddress) params.append("walletAddress", fetchUserParams.walletAddress);
      
      const response = await fetch(`/api/fetchUser?${params.toString()}`);
      const data = await response.json();
      
      setResponse(data);
      
      if (!response.ok) {
        throw new Error(data.message || "API request failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">API Testing Page</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-3xl mx-auto">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="checkUser">Check User API</TabsTrigger>
          <TabsTrigger value="fetchUser">Fetch User API</TabsTrigger>
        </TabsList>
        
        <TabsContent value="checkUser">
          <Card>
            <CardHeader>
              <CardTitle>Test /api/checkUser Endpoint</CardTitle>
              <CardDescription>
                Check if a user exists in the database by wallet address, email, or username
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="walletAddress">Wallet Address</Label>
                <Input
                  id="walletAddress"
                  name="walletAddress"
                  value={checkUserParams.walletAddress}
                  onChange={handleCheckUserParamChange}
                  placeholder="0x..."
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={checkUserParams.email}
                  onChange={handleCheckUserParamChange}
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  value={checkUserParams.username}
                  onChange={handleCheckUserParamChange}
                  placeholder="username"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={testCheckUserApi} 
                disabled={isLoading || (!checkUserParams.walletAddress && !checkUserParams.email && !checkUserParams.username)}
              >
                {isLoading ? "Testing..." : "Test API"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="fetchUser">
          <Card>
            <CardHeader>
              <CardTitle>Test /api/fetchUser Endpoint</CardTitle>
              <CardDescription>
                Fetch complete user data by wallet address
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="fetchWalletAddress">Wallet Address</Label>
                <Input
                  id="fetchWalletAddress"
                  name="walletAddress"
                  value={fetchUserParams.walletAddress}
                  onChange={handleFetchUserParamChange}
                  placeholder="0x..."
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={testFetchUserApi} 
                disabled={isLoading || !fetchUserParams.walletAddress}
              >
                {isLoading ? "Testing..." : "Test API"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Response Display */}
      {(response || error) && (
        <div className="mt-8 max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>API Response</CardTitle>
            </CardHeader>
            <CardContent>
              {error ? (
                <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-4 rounded">
                  {error}
                </div>
              ) : (
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto max-h-96">
                  {JSON.stringify(response, null, 2)}
                </pre>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
