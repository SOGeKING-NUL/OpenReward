import { Github, Send, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Footer() {
  return (
    <footer className="w-full border-t bg-background dark:bg-black">
      <div className="container px-4 py-12 md:px-6 md:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold gradient-text">OpenReward</h3>
            <p className="text-muted-foreground">
              Revolutionizing open source collaboration through decentralized bounties and rewards.
            </p>
            <Button variant="outline" className="flex items-center gap-2">
              <Github className="h-4 w-4" />
              <span>Star on Github</span>
            </Button>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">Subscribe</h3>
            <p className="text-muted-foreground">Stay updated with the latest bounties and platform news.</p>
            <div className="flex max-w-md gap-2">
              <Input type="email" placeholder="Enter your email" className="bg-background dark:bg-zinc-900" />
              <Button className="bg-gradient-green hover:opacity-90 transition-opacity" size="icon">
                <Send className="h-4 w-4" />
                <span className="sr-only">Subscribe</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 border-t pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} OpenReward. All rights reserved.</p>
          <p className="text-sm text-muted-foreground flex items-center mt-4 md:mt-0">
            Made with <Heart className="h-4 w-4 mx-1 text-red-500 fill-red-500" /> by team{" "}
            <span className="gradient-text ml-1">OpenReward</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
