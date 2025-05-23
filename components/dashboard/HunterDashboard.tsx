"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, DollarSign, FileText, Briefcase } from "lucide-react";

interface UserData {
  skills?: string[];
  bountiesWon?: string[];
  totalAmountWon?: number;
  activeBountySubmissions?: string[];
  bountiesParticipatedIn?: string[];
}

interface HunterDashboardProps {
  userData: UserData;
}

export default function HunterDashboard({ userData }: HunterDashboardProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Hunter Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bounties Won</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userData.bountiesWon?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Successfully completed bounties</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount Won</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(userData.totalAmountWon || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total rewards earned</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Submissions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userData.activeBountySubmissions?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Bounties you are currently working on</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" /> Your Skills
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userData.skills && userData.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {userData.skills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-sm px-3 py-1">{skill}</Badge>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">You haven't listed any skills yet. Add skills to your profile to get better bounty matches!</p>
          )}
        </CardContent>
      </Card>

      <Card>
          <CardHeader>
              <CardTitle>Activity Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
                <span className="text-muted-foreground">Bounties Participated In:</span>
                <span className="font-semibold">{userData.bountiesParticipatedIn?.length || 0}</span>
            </div>
             <div className="flex justify-between">
                <span className="text-muted-foreground">Success Rate:</span>
                <span className="font-semibold">
                    {userData.bountiesParticipatedIn?.length && userData.bountiesParticipatedIn.length > 0
                        ? `${(( (userData.bountiesWon?.length || 0) / userData.bountiesParticipatedIn.length) * 100).toFixed(1)}%`
                        : 'N/A'}
                </span>
            </div>
          </CardContent>
      </Card>
    </div>
  );
}

