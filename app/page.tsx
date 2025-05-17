import { Hero } from "@/components/hero"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { AuthHeader } from "@/components/AuthHeader"
import { Web3Zone } from "@/components/Web3Zone"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <AuthHeader/>
      {/* <Web3Zone/> */}
      
      <Footer />
    </main>
  )
}