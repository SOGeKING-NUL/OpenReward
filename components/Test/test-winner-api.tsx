// app/test-winner-api/page.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Copy, CheckCircle, XCircle, AlertCircle } from "lucide-react";

export default function TestWinnerAPI() {
  const [contractAddress, setContractAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);

  const handleTest = async () => {
    if (!contractAddress.trim()) {
      setError("Contract address is required");
      return;
    }

    setLoading(true);
    setError("");
    setResponse(null);
    setStatusCode(null);
    setResponseTime(null);

    const startTime = Date.now();

    try {
      const apiResponse = await fetch(`/api/bounties/${contractAddress}/winner`);
      const endTime = Date.now();
      setResponseTime(endTime - startTime);
      setStatusCode(apiResponse.status);

      if (apiResponse.ok) {
        const data = await apiResponse.json();
        setResponse(data);
      } else {
        const errorData = await apiResponse.json().catch(() => null);
        setError(`HTTP ${apiResponse.status}: ${apiResponse.statusText}`);
        setResponse(errorData);
      }
    } catch (err) {
      const endTime = Date.now();
      setResponseTime(endTime - startTime);
      setError(err instanceof Error ? err.message : "Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  const generateSampleAddress = () => {
    // Generate a random 40-character hex string for testing
    const randomHex = Array.from({ length: 40 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    setContractAddress(`0x${randomHex}`);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getStatusBadge = () => {
    if (statusCode === null) return null;
    
    if (statusCode >= 200 && statusCode < 300) {
      return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Success</Badge>;
    } else if (statusCode >= 400 && statusCode < 500) {
      return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Client Error</Badge>;
    } else if (statusCode >= 500) {
      return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Server Error</Badge>;
    }
    return <Badge variant="secondary">Unknown</Badge>;
  };

  const formatResponse = () => {
    if (response === null) {
      return "null";
    }
    if (typeof response === "string") {
      return `"${response}"`;
    }
    return JSON.stringify(response, null, 2);
  };

  const getResponseAnalysis = () => {
    if (response === null) {
      return {
        type: "No Winner",
        description: "The bounty has no winner selected yet",
        isValid: true,
        color: "text-yellow-600"
      };
    }
    
    if (typeof response === "string") {
      const isValidAddress = /^0x[a-fA-F0-9]{40}$/.test(response);
      if (isValidAddress) {
        return {
          type: "Winner Address",
          description: "Valid 20-byte Ethereum address",
          isValid: true,
          color: "text-green-600"
        };
      } else {
        return {
          type: "Invalid Address",
          description: "The returned address format is invalid",
          isValid: false,
          color: "text-red-600"
        };
      }
    }
    
    return {
      type: "Unexpected Response",
      description: "Response is neither null nor a valid address string",
      isValid: false,
      color: "text-red-600"
    };
  };

  const analysis = response !== undefined ? getResponseAnalysis() : null;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Bounty Winner API Test</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Test Bounty Winner Endpoint</CardTitle>
            <CardDescription>
              Test the GET /api/bounties/[contractAddress]/winner endpoint
              <br />
              <span className="text-sm text-muted-foreground">
                Returns: null (no winner) or "0x..." (20-byte address)
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="contractAddress">Contract Address</Label>
              <div className="flex gap-2">
                <Input
                  id="contractAddress"
                  value={contractAddress}
                  onChange={(e) => setContractAddress(e.target.value)}
                  placeholder="0x1234567890abcdef1234567890abcdef12345678"
                  className="flex-1"
                />
                <Button variant="outline" onClick={generateSampleAddress}>
                  Generate Sample
                </Button>
              </div>
            </div>
            
            <Button onClick={handleTest} disabled={loading} className="w-full">
              {loading ? "Testing..." : "Test API"}
            </Button>
          </CardContent>
        </Card>

        <Separator className="my-6" />

        {/* Response Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>API Response</CardTitle>
              <div className="flex items-center gap-2">
                {getStatusBadge()}
                {statusCode && (
                  <Badge variant="outline">
                    {statusCode}
                  </Badge>
                )}
                {responseTime && (
                  <Badge variant="outline">
                    {responseTime}ms
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-600">{error}</AlertDescription>
              </Alert>
            )}
            
            {response !== undefined && !error && (
              <div className="space-y-4">
                {/* Response Analysis */}
                {analysis && (
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">Response Analysis:</h3>
                      <Badge variant={analysis.isValid ? "default" : "destructive"}>
                        {analysis.type}
                      </Badge>
                    </div>
                    <p className={`text-sm ${analysis.color}`}>{analysis.description}</p>
                  </div>
                )}
                
                {/* Raw Response */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Raw Response:</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(formatResponse())}
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                    <pre className="text-sm overflow-auto">
                      {formatResponse()}
                    </pre>
                  </div>
                </div>

                {/* Response Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 border rounded">
                    <p className="text-sm font-medium text-muted-foreground">Data Type</p>
                    <p className="font-mono">{response === null ? "null" : typeof response}</p>
                  </div>
                  <div className="p-3 border rounded">
                    <p className="text-sm font-medium text-muted-foreground">Response Size</p>
                    <p className="font-mono">{JSON.stringify(response).length} bytes</p>
                  </div>
                  <div className="p-3 border rounded">
                    <p className="text-sm font-medium text-muted-foreground">Gas Efficient</p>
                    <p className="font-mono">{JSON.stringify(response).length < 100 ? "✅ Yes" : "❌ No"}</p>
                  </div>
                </div>
              </div>
            )}
            
            {response === undefined && !error && !loading && (
              <p className="text-gray-500">No response yet. Enter a contract address and test the API.</p>
            )}
          </CardContent>
        </Card>

        {/* Test Cases */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Test Cases</CardTitle>
            <CardDescription>Common scenarios to test</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 border rounded">
                <span className="text-sm">Valid contract with no winner</span>
                <Badge variant="outline">Should return: null</Badge>
              </div>
              <div className="flex justify-between items-center p-2 border rounded">
                <span className="text-sm">Valid contract with winner</span>
                <Badge variant="outline">Should return: "0x..."</Badge>
              </div>
              <div className="flex justify-between items-center p-2 border rounded">
                <span className="text-sm">Invalid contract address</span>
                <Badge variant="outline">Should return: 404</Badge>
              </div>
              <div className="flex justify-between items-center p-2 border rounded">
                <span className="text-sm">Malformed contract address</span>
                <Badge variant="outline">Should return: 400</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
