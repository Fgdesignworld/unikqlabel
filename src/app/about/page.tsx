import { motion } from "framer-motion"
import { Crown, Leaf, Award, Users, ArrowRight, Star, Zap, Shield } from "lucide-react"
import { Link } from "react-router-dom"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PageHeader } from "@/components/page-header"
import { useSeo } from "@/hooks/use-seo"

const pillars = [
  {
    icon: Crown,
    title: "Royal Craftsmanship",
    description: "Every garment is tailored with precision and an eye for luxury detail that stands apart.",
  },
  {
    icon: Leaf,
    title: "Sustainable Fabrics",
    description: "We choose eco-conscious materials that feel premium without compromising the planet.",
  },
  {
    icon: Shield,
    title: "Premium Quality",
    description: "Rigorous quality checks ensure every piece meets royal standards before it reaches you.",
  },
  {
    icon: Users,
    title: "Inclusive Sizing",
    description: "Designed for every body — because every king and queen deserves to feel regal.",
  },
]

const stats = [
  { value: "2024", label: "Year Founded" },
  { value: "2K+", label: "Happy Customers" },
  { value: "100%", label: "Premium Quality" },
  { value: "3", label: "Collections" },
]

const sections = [
  {
    title: "Our Story",
    image: "/images/about-lifestyle.jpg",
    content:
      "UNIKQ LABEL was born from a single belief: fashion should feel like royalty, not a compromise. Founded in 2024, we set out to create a brand that bridges the gap between high-end luxury and everyday streetwear. What began as a vision for bold, unapologetic self-expression has grown into a movement — worn by kings, queens, and everyone who dares to rule their own narrative.",
    badge: "Est. 2024",
  },
  {
    title: "Our Design Philosophy",
    image: "/images/collection-king.jpg",
    content:
      "We draw inspiration from the intersection of royalty and street culture — the confidence of a crown balanced with the energy of the streets. Every collection begins with a mood board of contrasts: sharp tailoring meets relaxed silhouettes, gold hardware meets matte black fabric, minimalism meets bold statements. The result is a wardrobe that speaks without words.",
    badge: "Streetwear × Luxury",
  },
  {
    title: "Our Commitment",
    image: "/images/collection-essentials.jpg",
    content:
      "UNIKQ LABEL is built on three pillars: quality, inclusivity, and sustainability. We use premium fabrics that age well and feel exceptional. Our sizing is intentionally inclusive because fashion has no fixed body type. And we work with conscious suppliers to ensure our supply chain reflects the values we wear on our sleeves — literally.",
    badge: "Conscious Fashion",
  },
]

export default function AboutPage() {
  useSeo({ pageType: 'page', pageSlug: 'about', fallbackTitle: 'About Us — UNIKQ LABEL' })

  return (
    <main className="min-h-screen" style={{ background: '#0D0D0D' }}>
      <Navbar />
      <PageHeader
        title="About UNIKQ LABEL"
        subtitle="The story behind the crown — premium streetwear born from royal attitude"
        backgroundImage="/images/about-lifestyle.jpg"
      />

      {/* ── Stats Row ── */}
      <section className="px-4 py-16" style={{ background: 'rgba(212,175,55,0.03)', borderBottom: '1px solid rgba(212,175,55,0.08)' }}>
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center p-6 rounded-2xl"
                style={{ background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.10)' }}
              >
                <p className="font-heading text-3xl md:text-4xl font-black mb-2" style={{
                  background: 'linear-gradient(135deg, color-mix(in srgb, var(--theme-color) 90%, white), var(--theme-color))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>{stat.value}</p>
                <p className="font-body text-xs uppercase tracking-widest" style={{ color: 'rgba(245,240,232,0.5)' }}>{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pillars Grid ── */}
      <section className="px-4 py-20">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="section-badge mb-4 inline-block">What We Stand For</span>
            <h2 className="font-heading text-4xl md:text-5xl font-black mt-3" style={{ color: '#F5F0E8' }}>
              Our{' '}
              <span style={{
                background: 'linear-gradient(135deg, color-mix(in srgb, var(--theme-color) 90%, white), var(--theme-color))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>Values</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {pillars.map((pillar, index) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-7 rounded-2xl group hover:-translate-y-1 transition-all duration-300"
                style={{
                  background: 'rgba(20,18,14,0.7)',
                  border: '1px solid rgba(212,175,55,0.08)',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
                }}
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-5 group-hover:scale-110 transition-transform"
                  style={{ background: 'rgba(212,175,55,0.10)', border: '1px solid rgba(212,175,55,0.20)' }}>
                  <pillar.icon className="w-5 h-5 text-amber-500" />
                </div>
                <h3 className="font-heading text-lg font-bold mb-3" style={{ color: '#F5F0E8' }}>{pillar.title}</h3>
                <p className="font-body text-sm leading-relaxed" style={{ color: 'rgba(245,240,232,0.55)' }}>{pillar.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Story Sections ── */}
      {sections.map((section, index) => (
        <section key={section.title} className="px-4 pb-20">
          <div className="container mx-auto max-w-7xl">
            <div className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-14 items-center`}>
              {/* Image */}
              <motion.div
                initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="w-full lg:w-1/2 relative"
              >
                {/* Corner accents */}
                <div className="absolute -top-4 -left-4 w-14 h-14 pointer-events-none"
                  style={{ borderTop: '2px solid rgba(212,175,55,0.3)', borderLeft: '2px solid rgba(212,175,55,0.3)', borderRadius: '4px 0 0 0' }} />
                <div className="absolute -bottom-4 -right-4 w-14 h-14 pointer-events-none"
                  style={{ borderBottom: '2px solid rgba(212,175,55,0.3)', borderRight: '2px solid rgba(212,175,55,0.3)', borderRadius: '0 0 4px 0' }} />
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden"
                  style={{ border: '1px solid rgba(212,175,55,0.12)', boxShadow: '0 30px 80px rgba(0,0,0,0.6)' }}>
                  <img src={section.image} alt={section.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(13,13,13,0.5) 0%, transparent 60%)' }} />
                  <span className="absolute bottom-4 left-4 section-badge text-xs">{section.badge}</span>
                </div>
              </motion.div>

              {/* Content */}
              <motion.div
                initial={{ opacity: 0, x: index % 2 === 0 ? 40 : -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.15 }}
                className="w-full lg:w-1/2"
              >
                <h2 className="font-heading text-3xl md:text-4xl font-black mb-5 leading-tight" style={{ color: '#F5F0E8' }}>
                  {section.title}
                </h2>
                <div className="w-16 h-0.5 mb-6" style={{ background: 'linear-gradient(90deg, var(--theme-color), transparent)' }} />
                <p className="font-body text-lg leading-relaxed" style={{ color: 'rgba(245,240,232,0.65)' }}>
                  {section.content}
                </p>
              </motion.div>
            </div>
          </div>
        </section>
      ))}

      {/* ── CTA ── */}
      <section className="px-4 pb-24">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative p-10 md:p-16 rounded-3xl text-center overflow-hidden"
            style={{
              background: 'rgba(20,18,14,0.8)',
              border: '1px solid rgba(212,175,55,0.18)',
              boxShadow: '0 40px 100px rgba(0,0,0,0.5)',
            }}
          >
            {/* Background glow */}
            <div className="absolute inset-0 pointer-events-none" style={{
              backgroundImage: 'radial-gradient(ellipse at 50% 80%, rgba(212,175,55,0.15) 0%, transparent 60%)',
            }} />
            <Crown className="w-10 h-10 mx-auto mb-5 text-amber-500" />
            <h3 className="font-heading text-3xl md:text-4xl font-black mb-4" style={{ color: '#F5F0E8' }}>
              Wear the{' '}
              <span style={{
                background: 'linear-gradient(135deg, color-mix(in srgb, var(--theme-color) 90%, white), var(--theme-color))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>Crown</span>
            </h3>
            <p className="font-body text-base mb-9 max-w-lg mx-auto" style={{ color: 'rgba(245,240,232,0.6)' }}>
              Join thousands of fashion royals who choose UNIKQ LABEL for their everyday kingdom.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products" className="btn-primary text-sm justify-center">
                <Crown size={15} /> Shop Collections
              </Link>
              <Link to="/contact" className="btn-outline-gold text-sm justify-center">
                Get in Touch <ArrowRight size={15} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
