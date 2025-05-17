"use client";

import { useEffect, useState } from "react";
import { CivicAuthIframeContainer, useUser } from "@civic/auth-web3/react";
import { useAutoConnect } from "@civic/auth-web3/wagmi";
import { useAccount } from "wagmi";
import { AuthHeader } from "@/components/AuthHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const Page = () => {
  return(
  <div>
    <div>Hello</div>
  </div>)
}

export default Page;