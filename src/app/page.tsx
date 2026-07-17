import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { Footer } from "@/components/footer"
import { TrustBar } from "@/components/aarvia/trust-bar"
import { FeaturedCollections } from "@/components/aarvia/featured-collections"
import { NewArrivals } from "@/components/aarvia/new-arrivals"
import { BestSellers } from "@/components/aarvia/best-sellers"
import { PromotionalBanner } from "@/components/aarvia/promotional-banner"
import { TestimonialsSection } from "@/components/aarvia/testimonials-section"
import { FaqSection } from "@/components/aarvia/faq-section"
import { InstagramGallery } from "@/components/aarvia/instagram-gallery"
import { NewsletterSection } from "@/components/aarvia/newsletter-section"
import { PhilosophySection } from "@/components/aarvia/philosophy-section"
import { useSeo } from "@/hooks/use-seo"

export default function Home() {
  useSeo({
    pageType: 'home',
    pageSlug: 'home',
    fallbackTitle: 'Aarvia — Premium Botanical Wellness',
  })

  return (
    <main className="min-h-screen relative overflow-hidden" style={{ background: '#FDFBF7' }}>
      <Navbar />
      <HeroSection />
      <TrustBar />
      <FeaturedCollections />
      <BestSellers />
      <PromotionalBanner />
      <NewArrivals />
      <PhilosophySection />
      <TestimonialsSection />
      <FaqSection />
      {/* <InstagramGallery />
      <NewsletterSection /> */}
      <Footer />
    </main>
  )
}