import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                <span className="gradient-text">Revolutionizing</span> open source collaboration
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Decentralized bounties and rewards for open source projects. Get started today.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button asChild className="bg-gradient-green hover:opacity-90 transition-opacity">
                <Link href="#features">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline">Learn More</Button>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative h-[300px] w-full overflow-hidden rounded-lg bg-muted md:h-[400px] lg:h-[500px]">
              {/* You can add an image here */}
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">Hero Image</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
