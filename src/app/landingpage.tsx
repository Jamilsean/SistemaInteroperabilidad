// import { FeaturedDocuments } from "@/components/landing/featured-documents";
import { HeroSection } from "@/components/landing/hero-section";
import { SearchSection } from "@/components/landing/search-section";
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
     
      <main>
        <HeroSection />
        <SearchSection />
      </main>
    </div>
  )
}
