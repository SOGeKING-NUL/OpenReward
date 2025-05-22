// components/UserRegistrationForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useUser } from "@civic/auth-web3/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface UserRegistrationFormProps {
  walletAddress: string;
  onRegistrationComplete: () => void;
}

const UserRegistrationForm = ({ walletAddress, onRegistrationComplete }: UserRegistrationFormProps) => {
  const { user } = useUser();
  const [userType, setUserType] = useState<"BountyHunter" | "BountyProvider">("BountyHunter");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isConnectingGithub, setIsConnectingGithub] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  
  const [formData, setFormData] = useState({
    walletAddress,
    email: user?.email || "",
    name: user?.name || "",
    username: "",
    bio: "",
    // GitHub info
    githubUsername: "",
    githubId: "",
    githubConnected: false,
    // Hunter specific
    skills: [] as string[],
    // Provider specific
    organizationName: "",
    organizationGithubUrl: "",
    organizationWebsite: "",
    userRoleInOrganization: "",
    repositories: [{ name: "", url: "" }]
  });

  // Update form data when Civic user data changes
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email || prev.email,
        name: user.name || prev.name
      }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Reset username availability check when username changes
    if (name === "username") {
      setUsernameAvailable(null);
    }
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const skills = e.target.value.split(',').map(skill => skill.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, skills }));
  };

  // Extract organization name from GitHub URL
  const extractOrgName = (url: string): string => {
    try {
      // Handle GitHub URLs like https://github.com/organization
      if (url.includes('github.com')) {
        const urlParts = url.split('/');
        // Get the organization name (assuming it's the part after github.com)
        if (urlParts.length >= 4) {
          return urlParts[3];
        }
      }
      return "";
    } catch (error) {
      return "";
    }
  };

  const handleOrgUrlChange = (value: string) => {
    const orgName = extractOrgName(value);
    setFormData(prev => ({
      ...prev,
      organizationGithubUrl: value,
      organizationName: orgName
    }));
  };

  // Extract repo name from URL
  const extractRepoName = (url: string): string => {
    try {
      // Handle GitHub URLs like https://github.com/username/repo
      if (url.includes('github.com')) {
        const urlParts = url.split('/');
        // Get the last part of the URL (the repo name)
        return urlParts[urlParts.length - 1].replace('.git', '');
      }
      return "";
    } catch (error) {
      return "";
    }
  };

  const handleRepoUrlChange = (index: number, value: string) => {
    const updatedRepos = [...formData.repositories];
    updatedRepos[index].url = value;
    updatedRepos[index].name = extractRepoName(value);
    setFormData(prev => ({ ...prev, repositories: updatedRepos }));
  };

  const addRepository = () => {
    setFormData(prev => ({
      ...prev,
      repositories: [...prev.repositories, { name: "", url: "" }]
    }));
  };

  const removeRepository = (index: number) => {
    if (formData.repositories.length > 1) {
      const updatedRepos = formData.repositories.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, repositories: updatedRepos }));
    }
  };

  const connectGithub = async () => {
    setIsConnectingGithub(true);
    try {
      // In a real implementation, you would redirect to GitHub OAuth flow
      // For this example, we'll simulate a successful connection
      const githubData = {
        username: "example-user",
        id: "12345678"
      };
      
      setFormData(prev => ({
        ...prev,
        githubUsername: githubData.username,
        githubId: githubData.id,
        githubConnected: true
      }));
    } catch (error) {
      setError("Failed to connect GitHub account");
    } finally {
      setIsConnectingGithub(false);
    }
  };

  const checkUsernameAvailability = async () => {
    if (!formData.username) return;
    
    setIsCheckingUsername(true);
    try {
      const response = await fetch(`/api/checkUser?username=${formData.username}`);
      const data = await response.json();
      
      setUsernameAvailable(!data.exists);
    } catch (error) {
      console.error("Error checking username:", error);
      setError("Failed to check username availability");
    } finally {
      setIsCheckingUsername(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Check username availability
      const usernameResponse = await fetch(`/api/checkUser?username=${formData.username}`);
      const usernameData = await usernameResponse.json();
      
      if (usernameData.exists) {
        throw new Error("Username is already taken. Please choose another one.");
      }

      // Validate GitHub connection
      if (!formData.githubConnected) {
        throw new Error("Please connect your GitHub account");
      }

      // Validate form based on user type
      if (userType === "BountyProvider") {
        if (!formData.organizationGithubUrl) {
          throw new Error("Please provide your organization's GitHub URL");
        }
        
        if (!formData.organizationName) {
          throw new Error("Could not extract organization name from URL");
        }
        
        if (!formData.repositories.length || formData.repositories.some(repo => !repo.url)) {
          throw new Error("Please provide at least one repository URL");
        }
      }

      // Clean up repository data to ensure names are extracted from URLs
      const cleanedRepositories = formData.repositories.map(repo => ({
        name: repo.name || extractRepoName(repo.url),
        url: repo.url
      })).filter(repo => repo.url);

      const response = await fetch("/api/addUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          repositories: cleanedRepositories,
          userType
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to register user");
      }

      // Registration successful
      onRegistrationComplete();
    } catch (error) {
      setError(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="BountyHunter" onValueChange={(value) => setUserType(value as "BountyHunter" | "BountyProvider")}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="BountyHunter">Bounty Hunter</TabsTrigger>
              <TabsTrigger value="BountyProvider">Bounty Provider</TabsTrigger>
            </TabsList>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Common Fields */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    readOnly={!!user?.email}
                    className={user?.email ? "bg-gray-100 dark:bg-gray-800" : ""}
                  />
                </div>
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={user?.name ? "bg-gray-100 dark:bg-gray-800" : ""}
                  />
                </div>
                <div>
                  <Label htmlFor="username">Username</Label>
                  <div className="flex gap-2">
                    <Input
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      className={
                        usernameAvailable === true
                          ? "border-green-500"
                          : usernameAvailable === false
                          ? "border-red-500"
                          : ""
                      }
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={checkUsernameAvailability}
                      disabled={isCheckingUsername || !formData.username}
                    >
                      {isCheckingUsername ? "Checking..." : "Check"}
                    </Button>
                  </div>
                  {usernameAvailable === true && (
                    <p className="text-xs text-green-500 mt-1">Username is available</p>
                  )}
                  {usernameAvailable === false && (
                    <p className="text-xs text-red-500 mt-1">Username is already taken</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell us about yourself"
                  />
                </div>

                {/* GitHub Connection Section */}
                <div className="border p-4 rounded-md">
                  <div className="flex justify-between items-center mb-4">
                    <Label>GitHub Account</Label>
                    {!formData.githubConnected ? (
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={connectGithub}
                        disabled={isConnectingGithub}
                      >
                        {isConnectingGithub ? "Connecting..." : "Connect GitHub"}
                      </Button>
                    ) : (
                      <div className="text-green-600 dark:text-green-400 text-sm font-medium">
                        Connected: {formData.githubUsername}
                      </div>
                    )}
                  </div>
                  {!formData.githubConnected && (
                    <p className="text-sm text-gray-500">
                      Connecting your GitHub account is required to use OpenReward.
                    </p>
                  )}
                </div>
              </div>

              {/* User Type Specific Fields */}
              <TabsContent value="BountyHunter" className="space-y-4">
                <div>
                  <Label htmlFor="skills">Skills (comma-separated)</Label>
                  <Input
                    id="skills"
                    name="skills"
                    value={formData.skills.join(', ')}
                    onChange={handleSkillsChange}
                    placeholder="JavaScript, Solidity, React..."
                  />
                </div>
              </TabsContent>

              <TabsContent value="BountyProvider" className="space-y-4">
                <div>
                  <Label htmlFor="organizationGithubUrl">Organization GitHub URL</Label>
                  <Input
                    id="organizationGithubUrl"
                    name="organizationGithubUrl"
                    value={formData.organizationGithubUrl}
                    onChange={(e) => handleOrgUrlChange(e.target.value)}
                    placeholder="https://github.com/your-organization"
                    required={userType === "BountyProvider"}
                  />
                  {formData.organizationName && (
                    <p className="text-xs text-gray-500 mt-1">
                      Organization name: <span className="font-medium">{formData.organizationName}</span>
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="organizationWebsite">Organization Website</Label>
                  <Input
                    id="organizationWebsite"
                    name="organizationWebsite"
                    value={formData.organizationWebsite}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="userRoleInOrganization">Your Role</Label>
                  <Input
                    id="userRoleInOrganization"
                    name="userRoleInOrganization"
                    value={formData.userRoleInOrganization}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>GitHub Repositories</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={addRepository}
                    >
                      Add Repository
                    </Button>
                  </div>
                  
                  {formData.repositories.map((repo, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <div className="flex-1 space-y-2">
                        <Input
                          placeholder="Repository URL (e.g., https://github.com/username/repo)"
                          value={repo.url}
                          onChange={(e) => handleRepoUrlChange(index, e.target.value)}
                          required={userType === "BountyProvider"}
                        />
                        {repo.name && (
                          <div className="text-sm text-gray-500">
                            Repository name: <span className="font-medium">{repo.name}</span>
                          </div>
                        )}
                      </div>
                      {formData.repositories.length > 1 && (
                        <Button 
                          type="button" 
                          variant="destructive" 
                          size="icon" 
                          onClick={() => removeRepository(index)}
                        >
                          &times;
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>

              {error && (
                <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-4 rounded">
                  {error}
                </div>
              )}

              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting || !formData.githubConnected || usernameAvailable === false}
                >
                  {isSubmitting ? "Creating Account..." : "Complete Registration"}
                </Button>
              </div>
            </form>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserRegistrationForm;
