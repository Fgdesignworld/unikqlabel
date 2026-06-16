import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { Footer } from "@/components/footer"
import { TrustBar } from "@/components/aarvia/trust-bar"
import { FeaturedCollections } from "@/components/aarvia/featured-collections"
import { BestSellers } from "@/components/aarvia/best-sellers"
import { IngredientPhilosophy } from "@/components/aarvia/ingredient-philosophy"
import { SustainabilityStory } from "@/components/aarvia/sustainability-story"
import { SolutionsHair } from "@/components/aarvia/solutions-hair"
import { SolutionsBody } from "@/components/aarvia/solutions-body"
import { TestimonialsSection } from "@/components/aarvia/testimonials-section"
import { InstagramGallery } from "@/components/aarvia/instagram-gallery"
import { NewsletterSection } from "@/components/aarvia/newsletter-section"
import { useSeo } from "@/hooks/use-seo"

export default function Home() {
  useSeo({
    pageType: 'home',
    pageSlug: 'home',
    fallbackTitle: 'Aarvia — Premium Botanical Wellness',
  })

  return (
    <main className="min-h-screen" style={{ background: '#F7F4ED' }}>
      <Navbar />
      <HeroSection />
      <TrustBar />
      <FeaturedCollections />
      <BestSellers />
      <IngredientPhilosophy />
      <SustainabilityStory />
      <SolutionsHair />
      <SolutionsBody />
      <TestimonialsSection />
      {/* <InstagramGallery />
      <NewsletterSection /> */}
      <Footer />
    </main>
  )
}