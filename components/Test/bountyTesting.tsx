// app/test-bounty-api/page.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

interface Bounty {
  _id: string;
  contractAddress: string;
  bountyProvider: string;
  bountyAmount: number;
  timeInterval: number;
  initialTimestamp: number;
  status: string;
  bountyHunters: Array<{
    email: string;
    walletAddress: string;
    joinedAt: string;
    prRaised: boolean;
    prUrl?: string;
    prRaisedAt?: string;
    status: string;
  }>;
  bountyWinner?: string;
  issueURL: string;
  title: string;
  description: string;
  createdAt: string;
  expiresAt: string;
  lastSyncedAt: string;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  bounty?: Bounty;
  bounties?: Bounty[];
  error?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export default function TestBountyAPI() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [error, setError] = useState("");

  // Create Bounty Form State
  const [createForm, setCreateForm] = useState({
    contractAddress: "",
    bountyProvider: "",
    bountyAmount: "",
    timeInterval: "",
    initialTimestamp: "",
    issueURL: "",
    title: "",
    description: "",
    expiresAt: ""
  });

  // Join Bounty Form State
  const [joinForm, setJoinForm] = useState({
    contractAddress: "",
    email: "",
    walletAddress: ""
  });

  // Submit PR Form State
  const [submitForm, setSubmitForm] = useState({
    contractAddress: "",
    walletAddress: "",
    prUrl: ""
  });

  // Fetch Bounties Form State
  const [fetchForm, setFetchForm] = useState({
    status: "",
    bountyProvider: "",
    limit: "10",
    page: "1"
  });

  const handleCreateBounty = async () => {
    setLoading(true);
    setError("");
    setResponse(null);

    try {
      const response = await fetch("/api/createBounty", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...createForm,
          bountyAmount: Number(createForm.bountyAmount),
          timeInterval: Number(createForm.timeInterval),
          initialTimestamp: Number(createForm.initialTimestamp),
        }),
      });

      const data = await response.json();
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create bounty");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinBounty = async () => {
    setLoading(true);
    setError("");
    setResponse(null);

    try {
      const response = await fetch(`/api/bounties/${joinForm.contractAddress}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: joinForm.email,
          walletAddress: joinForm.walletAddress,
        }),
      });

      const data = await response.json();
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join bounty");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPR = async () => {
    setLoading(true);
    setError("");
    setResponse(null);

    try {
      const response = await fetch(`/api/bounties/${submitForm.contractAddress}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress: submitForm.walletAddress,
          prUrl: submitForm.prUrl,
        }),
      });

      const data = await response.json();
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit PR");
    } finally {
      setLoading(false);
    }
  };

  const handleFetchBounties = async () => {
    setLoading(true);
    setError("");
    setResponse(null);

    try {
      const params = new URLSearchParams();
      if (fetchForm.status) params.append("status", fetchForm.status);
      if (fetchForm.bountyProvider) params.append("bountyProvider", fetchForm.bountyProvider);
      if (fetchForm.limit) params.append("limit", fetchForm.limit);
      if (fetchForm.page) params.append("page", fetchForm.page);

      const response = await fetch(`/api/getBounty?${params.toString()}`);
      const data = await response.json();
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch bounties");
    } finally {
      setLoading(false);
    }
  };

  const generateSampleData = () => {
    const now = new Date();
    const futureDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    
    setCreateForm({
      contractAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
      bountyProvider: `0x${Math.random().toString(16).substr(2, 40)}`,
      bountyAmount: "1000",
      timeInterval: "604800", // 7 days in seconds
      initialTimestamp: Math.floor(now.getTime() / 1000).toString(),
      issueURL: "https://github.com/example/repo/issues/123",
      title: "Fix authentication bug in login system",
      description: "There's a critical bug in the authentication system that prevents users from logging in properly.",
      expiresAt: futureDate.toISOString()
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Bounty API Test Page</h1>
        
        <Tabs defaultValue="create" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="create">Create Bounty</TabsTrigger>
            <TabsTrigger value="join">Join Bounty</TabsTrigger>
            <TabsTrigger value="submit">Submit PR</TabsTrigger>
            <TabsTrigger value="fetch">Fetch Bounties</TabsTrigger>
          </TabsList>

          {/* Create Bounty Tab */}
          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle>Create New Bounty</CardTitle>
                <CardDescription>Test the POST /api/createBounty endpoint</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-end">
                  <Button variant="outline" onClick={generateSampleData}>
                    Generate Sample Data
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contractAddress">Contract Address</Label>
                    <Input
                      id="contractAddress"
                      value={createForm.contractAddress}
                      onChange={(e) => setCreateForm({...createForm, contractAddress: e.target.value})}
                      placeholder="0x..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="bountyProvider">Bounty Provider</Label>
                    <Input
                      id="bountyProvider"
                      value={createForm.bountyProvider}
                      onChange={(e) => setCreateForm({...createForm, bountyProvider: e.target.value})}
                      placeholder="0x..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="bountyAmount">Bounty Amount</Label>
                    <Input
                      id="bountyAmount"
                      type="number"
                      value={createForm.bountyAmount}
                      onChange={(e) => setCreateForm({...createForm, bountyAmount: e.target.value})}
                      placeholder="1000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="timeInterval">Time Interval (seconds)</Label>
                    <Input
                      id="timeInterval"
                      type="number"
                      value={createForm.timeInterval}
                      onChange={(e) => setCreateForm({...createForm, timeInterval: e.target.value})}
                      placeholder="604800"
                    />
                  </div>
                  <div>
                    <Label htmlFor="initialTimestamp">Initial Timestamp</Label>
                    <Input
                      id="initialTimestamp"
                      type="number"
                      value={createForm.initialTimestamp}
                      onChange={(e) => setCreateForm({...createForm, initialTimestamp: e.target.value})}
                      placeholder={Math.floor(Date.now() / 1000).toString()}
                    />
                  </div>
                  <div>
                    <Label htmlFor="expiresAt">Expires At</Label>
                    <Input
                      id="expiresAt"
                      type="datetime-local"
                      value={createForm.expiresAt.slice(0, 16)}
                      onChange={(e) => setCreateForm({...createForm, expiresAt: new Date(e.target.value).toISOString()})}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="issueURL">Issue URL</Label>
                  <Input
                    id="issueURL"
                    value={createForm.issueURL}
                    onChange={(e) => setCreateForm({...createForm, issueURL: e.target.value})}
                    placeholder="https://github.com/org/repo/issues/123"
                  />
                </div>
                
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={createForm.title}
                    onChange={(e) => setCreateForm({...createForm, title: e.target.value})}
                    placeholder="Bug fix title"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={createForm.description}
                    onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
                    placeholder="Detailed description of the bounty"
                  />
                </div>
                
                <Button onClick={handleCreateBounty} disabled={loading} className="w-full">
                  {loading ? "Creating..." : "Create Bounty"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Join Bounty Tab */}
          <TabsContent value="join">
            <Card>
              <CardHeader>
                <CardTitle>Join Bounty</CardTitle>
                <CardDescription>Test the POST /api/bounties/[contractAddress]/join endpoint</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="joinContractAddress">Contract Address</Label>
                  <Input
                    id="joinContractAddress"
                    value={joinForm.contractAddress}
                    onChange={(e) => setJoinForm({...joinForm, contractAddress: e.target.value})}
                    placeholder="0x..."
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={joinForm.email}
                    onChange={(e) => setJoinForm({...joinForm, email: e.target.value})}
                    placeholder="hunter@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="walletAddress">Wallet Address</Label>
                  <Input
                    id="walletAddress"
                    value={joinForm.walletAddress}
                    onChange={(e) => setJoinForm({...joinForm, walletAddress: e.target.value})}
                    placeholder="0x..."
                  />
                </div>
                <Button onClick={handleJoinBounty} disabled={loading} className="w-full">
                  {loading ? "Joining..." : "Join Bounty"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Submit PR Tab */}
          <TabsContent value="submit">
            <Card>
              <CardHeader>
                <CardTitle>Submit PR</CardTitle>
                <CardDescription>Test the POST /api/bounties/[contractAddress]/submit endpoint</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="submitContractAddress">Contract Address</Label>
                  <Input
                    id="submitContractAddress"
                    value={submitForm.contractAddress}
                    onChange={(e) => setSubmitForm({...submitForm, contractAddress: e.target.value})}
                    placeholder="0x..."
                  />
                </div>
                <div>
                  <Label htmlFor="submitWalletAddress">Wallet Address</Label>
                  <Input
                    id="submitWalletAddress"
                    value={submitForm.walletAddress}
                    onChange={(e) => setSubmitForm({...submitForm, walletAddress: e.target.value})}
                    placeholder="0x..."
                  />
                </div>
                <div>
                  <Label htmlFor="prUrl">PR URL</Label>
                  <Input
                    id="prUrl"
                    value={submitForm.prUrl}
                    onChange={(e) => setSubmitForm({...submitForm, prUrl: e.target.value})}
                    placeholder="https://github.com/org/repo/pull/123"
                  />
                </div>
                <Button onClick={handleSubmitPR} disabled={loading} className="w-full">
                  {loading ? "Submitting..." : "Submit PR"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fetch Bounties Tab */}
          <TabsContent value="fetch">
            <Card>
              <CardHeader>
                <CardTitle>Fetch Bounties</CardTitle>
                <CardDescription>Test the GET /api/getBounty endpoint with filters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status">Status (optional)</Label>
                    <Input
                      id="status"
                      value={fetchForm.status}
                      onChange={(e) => setFetchForm({...fetchForm, status: e.target.value})}
                      placeholder="OPEN, UNDER_REVIEW, COMPLETED, etc."
                    />
                  </div>
                  <div>
                    <Label htmlFor="fetchBountyProvider">Bounty Provider (optional)</Label>
                    <Input
                      id="fetchBountyProvider"
                      value={fetchForm.bountyProvider}
                      onChange={(e) => setFetchForm({...fetchForm, bountyProvider: e.target.value})}
                      placeholder="0x..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="limit">Limit</Label>
                    <Input
                      id="limit"
                      type="number"
                      value={fetchForm.limit}
                      onChange={(e) => setFetchForm({...fetchForm, limit: e.target.value})}
                      placeholder="10"
                    />
                  </div>
                  <div>
                    <Label htmlFor="page">Page</Label>
                    <Input
                      id="page"
                      type="number"
                      value={fetchForm.page}
                      onChange={(e) => setFetchForm({...fetchForm, page: e.target.value})}
                      placeholder="1"
                    />
                  </div>
                </div>
                <Button onClick={handleFetchBounties} disabled={loading} className="w-full">
                  {loading ? "Fetching..." : "Fetch Bounties"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Separator className="my-8" />

        {/* Response Section */}
        <Card>
          <CardHeader>
            <CardTitle>API Response</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-4">
                <AlertDescription className="text-red-600">{error}</AlertDescription>
              </Alert>
            )}
            
            {response && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant={response.success ? "default" : "destructive"}>
                    {response.success ? "Success" : "Error"}
                  </Badge>
                  {response.message && <span className="text-sm">{response.message}</span>}
                </div>
                
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                  <pre className="text-sm overflow-auto max-h-96">
                    {JSON.stringify(response, null, 2)}
                  </pre>
                </div>
                
                {response.bounties && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Bounties Found: {response.bounties.length}</h3>
                    {response.pagination && (
                      <p className="text-sm text-gray-600 mb-4">
                        Page {response.pagination.currentPage} of {response.pagination.totalPages} 
                        (Total: {response.pagination.totalCount})
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {!response && !error && (
              <p className="text-gray-500">No response yet. Try testing an API endpoint above.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
