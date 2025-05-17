import { Hero } from "@/components/hero"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Web3Zone } from "./onboarding/page"
import { AuthHeader } from "@/components/AuthHeader"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <AuthHeader/>
      <Web3Zone/>
      
      <Footer />
    </main>
  )
}
