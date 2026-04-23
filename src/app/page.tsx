

import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { CategorySection } from "@/components/category-section"
import { BestSellers } from "@/components/best-sellers"
import { TraditionSection } from "@/components/tradition-section"
import { ReviewsSection } from "@/components/reviews-section"
import { GallerySection } from "@/components/gallery-section"
import { CTASection } from "@/components/cta-section"
import { Footer } from "@/components/footer"
import { useSeo } from "@/hooks/use-seo"

export default function Home() {
  useSeo({ pageType: 'home', pageSlug: 'home', fallbackTitle: 'UNIKQ LABEL — Premium Fashion • Everyday Royalty' })
  return (
    <main className="min-h-screen" style={{ background: 'var(--surface-page)' }}>
      <Navbar />
      <HeroSection />
      <CategorySection />
      <section id="bestsellers">
        <BestSellers />
      </section>
      <section id="tradition">
        <TraditionSection />
      </section>
      <ReviewsSection />
      <GallerySection />
      <section id="contact">
        <CTASection />
      </section>
      <Footer />
    </main>
  )
}
