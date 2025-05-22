// app/dashboard/ProviderDashboard.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Github, Globe, FileText, DollarSign, Users } from "lucide-react";

// Ensure UserData here matches or is compatible with the one in DashboardPage
interface Repository {
  name: string;
  url: string;
}
interface UserData {
  organizationName?: string;
  userRoleInOrganization?: string;
  organizationWebsite?: string;
  repositories?: Repository[];
  bountiesListed?: number;
  totalAmountDistributed?: number;
  // other fields if needed by this component
}

interface ProviderDashboardProps {
  userData: UserData;
}

export default function ProviderDashboard({ userData }: ProviderDashboardProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Provider Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bounties Listed</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userData.bountiesListed || 0}</div>
            <p className="text-xs text-muted-foreground">Total bounties you have created</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Distributed</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(userData.totalAmountDistributed || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total value of rewards paid out</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Repositories Linked</CardTitle>
            <Github className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userData.repositories?.length || 0}</div>
            <p className="text-xs text-muted-foreground">GitHub repositories connected</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organization Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {userData.organizationName && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Organization</p>
              <p className="text-lg flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> {userData.organizationName}</p>
            </div>
          )}
          {userData.userRoleInOrganization && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Your Role</p>
              <p className="text-lg">{userData.userRoleInOrganization}</p>
            </div>
          )}
          {userData.organizationWebsite && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Website</p>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <a
                  href={userData.organizationWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {userData.organizationWebsite}
                </a>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {userData.repositories && userData.repositories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Linked Repositories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userData.repositories.map((repo, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                  <div className="flex items-center gap-2">
                    <Github className="h-5 w-5 text-muted-foreground" />
                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium hover:underline"
                    >
                      {repo.name}
                    </a>
                  </div>
                  <Button variant="outline" size="sm">Manage</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
