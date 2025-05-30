"use client"

import * as React from "react"
import Link from "next/link"
import { Menu, Search, LayoutDashboard } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"
import { Input } from "@/components/ui/input"
import { AuthHeader } from "./AuthHeader"
import { useUser } from "@civic/auth-web3/react"
import { useRouter } from "next/navigation"

export function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false)
  const { user, isLoading, walletCreationInProgress } = useUser()
  const router = useRouter()

  const handleGetStarted = () => {
    router.push("/signup")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {/* Logo */}
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold gradient-text text-4xl">OpenReward</span>
          </Link>
        </div>
        
        {/* Search bar - visible on all screen sizes */}
        <div className="flex-1 mx-4 justify-center md:flex">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search rewards..." 
              className="pl-8 w-full md:w-[300px] lg:w-[400px]"
            />
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:space-x-4">
          <ThemeToggle />
          
          {isLoading ? (
            <div className="text-sm">Loading account...</div>
          ) : user ? (
            <>
              <AuthHeader />
              <Link href="/dashboard">
                <Button variant="ghost" size="icon" className="ml-2" title="Dashboard">
                  <LayoutDashboard className="h-5 w-5" />
                  <span className="sr-only">Dashboard</span>
                </Button>
              </Link>
            </>
          ) : (
              <Button 
                className="bg-gradient-green hover:opacity-90 transition-opacity"
                onClick={handleGetStarted}
              >
                Get Started
              </Button>
          )}
        </div>
      </div>
    </header>
  )
}
