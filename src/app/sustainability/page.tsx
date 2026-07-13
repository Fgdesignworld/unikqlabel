import { motion } from "framer-motion"
import { Leaf, Recycle, Globe, Shield, Heart, Award, ArrowRight, Sparkles, Compass, CheckCircle } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PageHeader } from "@/components/page-header"
import { useSeo } from "@/hooks/use-seo"
import { Link } from "react-router-dom"

const PILLARS = [
  {
    icon: Leaf,
    title: "Botanical-Inspired Actives",
    tagline: "Pure Plant-Based Quality",
    desc: "Every formulation is crafted from plant-derived ingredients and cold-pressed botanical extracts. We choose biodegradable bases that deliver a refreshing experience without relying on harsh synthetic fillers.",
  },
  {
    icon: Recycle,
    title: "Circular Packaging Lifecycle",
    tagline: "Reducing Plastic Footprint",
    desc: "We prioritize amber glass and post-consumer recycled (PCR) containers. Our product roadmap features a refill pouch model designed to reduce plastic waste and support a circular home wellness ritual.",
  },
  {
    icon: Globe,
    title: "Carbon-Conscious Transit",
    tagline: "Minimizing Logistics Footprint",
    desc: "From crop harvesting to home delivery, we work with shipping partners committed to climate-neutral operations, optimizing transport routes to keep emissions low.",
  },
  {
    icon: Compass,
    title: "Regenerative Sourcing Practices",
    tagline: "Ethical & Fair Farming",
    desc: "We collaborate with local farmers who employ regenerative cultivation, protecting regional biodiversity while securing high-quality, traceable raw ingredients.",
  },
  {
    icon: Shield,
    title: "Pure Formulation Philosophy",
    tagline: "Thoughtfully Crafted Solutions",
    desc: "Our products are strictly formulated without sulfates, parabens, silicones, synthetic colorants, or common hormone disruptors, ensuring everyday home care you can trust.",
  },
  {
    icon: Heart,
    title: "Reforestation & Soil Regeneration",
    tagline: "Giving Back to the Earth",
    desc: "1% of all revenue is dedicated to soil regeneration projects and planting native Australian botanical trees in partnership with verified environmental charities.",
  },
]

const STATS = [
  {
    value: "100%",
    label: "Biodegradable Formulas",
    sub: "Gentle on soil and waterways",
  },
  {
    value: "98%",
    label: "PCR & Glass Pack",
    sub: "Refillable and highly recyclable",
  },
  {
    value: "1%",
    label: "Reforestation Fund",
    sub: "Dedicated to planting native trees",
  },
  {
    value: "0%",
    label: "Harsh Synthetics",
    sub: "No parabens, sulfates, or silicones",
  },
]

const STORY_SECTIONS = [
  {
    badge: "Sourcing Integrity",
    title: "Made with Carefully Selected Ingredients",
    body: "We believe true quality begins at the source. We select botanical-inspired ingredients like Neem, Lemongrass, and Tulsi, cultivated under ethical conditions. By harvesting these plants through cold-press methods, we preserve their natural attributes to formulate home care products that are pleasant to use and gentle on the environment.",
    img: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=600&auto=format&fit=crop",
    benefits: ["Regenerative soil cultivation", "Traceable farming partnerships", "High-performance botanical actives"],
  },
  {
    badge: "Packaging Roadmap",
    title: "Circular Design and Refillable Rituals",
    body: "Packaging should not become waste. We package our cleaning essentials in amber glass and high-grade PCR bottles to minimize virgin plastic creation. Furthermore, our upcoming refill program will allow customers to purchase lightweight concentrate pouches, cutting down packaging weight and transport emissions.",
    img: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=600&auto=format&fit=crop",
    benefits: ["Amber glass & PCR plastic focus", "Upcoming lightweight refill system", "Zero single-use waste targets"],
  },
  {
    badge: "Conscious Footprint",
    title: "Traceable Supply Chains & Carbon Care",
    body: "AARVIA traces each step of the product journey from raw botanical harvest to your doorstep. We work with freight partners who offset logistics emissions, consolidating shipments to decrease logistics impact. We are committed to achieving verified carbon-neutral transit benchmarks.",
    img: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=600&auto=format&fit=crop",
    benefits: ["Consolidated shipping logistics", "Climate-neutral delivery options", "Low-waste fulfillment center"],
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  }),
}

export default function SustainabilityPage() {
  useSeo({ pageType: "page", pageSlug: "sustainability", fallbackTitle: "Sustainability Commitment — Aarvia" })

  return (
    <main className="min-h-screen" style={{ background: "#F7F4ED" }}>
      <Navbar />
      <PageHeader
        title="Our Commitment to Earth"
        subtitle="AARVIA is built on transparency, respect for the environment, and a commitment to leaving the planet better than we found it."
        backgroundImage="https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=1200&auto=format&fit=crop"
      />

      {/* Intro Summary Section */}
      <section className="py-20 bg-white border-b border-[#C8A96B]/10">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[10px] font-bold tracking-[0.3em] uppercase"
            style={{ color: "#C8A96B" }}
          >
            Sustainable Home Care
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4.5xl leading-tight font-serif text-[#1F4D3A] font-light"
          >
            Formulated to Care for Your Space,<br />
            <span className="italic" style={{ color: "#C8A96B" }}>Designed to Respect Our Planet</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm md:text-base leading-relaxed text-[#6A6A60] font-light max-w-2xl mx-auto"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            We believe everyday home wellness shouldn't come at a cost to the ecosystem. Our approach balances 
            botanical-inspired ingredient quality with circular packaging guidelines, establishing safe home care 
            rituals that align with responsible, everyday living.
          </motion.p>
        </div>
      </section>

      {/* Visual Impact Pillars */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute top-[20%] -left-48 w-96 h-96 rounded-full blur-3xl bg-[#C8A96B]/5 pointer-events-none" />
        <div className="absolute bottom-[20%] -right-48 w-96 h-96 rounded-full blur-3xl bg-[#1F4D3A]/4 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 space-y-3">
            <p className="text-[11px] font-bold tracking-[0.26em] uppercase" style={{ color: "#C8A96B" }}>
              Circular Pillars
            </p>
            <h2 className="text-4xl md:text-5xl font-serif font-light text-[#1F4D3A]">
              Our Ethical Commitments
            </h2>
            <div className="w-12 h-0.5 bg-[#C8A96B] mx-auto mt-4" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {PILLARS.map((item, i) => (
              <motion.div
                key={item.title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                className="p-8 group relative bg-white border border-[#C8A96B]/15 rounded-3xl hover:border-[#C8A96B]/40 hover:shadow-xl transition-all duration-500 flex flex-col justify-between"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-[#C8A96B]/3 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
                
                <div>
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#1F4D3A] group-hover:text-white transition-all duration-500"
                    style={{ background: "rgba(31,77,58,0.04)", border: "1px solid rgba(200,169,107,0.18)", color: "#1F4D3A" }}
                  >
                    <item.icon className="w-5 h-5 transition-colors duration-300" />
                  </div>
                  <p className="text-[9px] font-bold tracking-widest uppercase text-[#C8A96B] mb-2">{item.tagline}</p>
                  <h3
                    className="text-xl font-serif font-medium mb-3"
                    style={{ color: "#1F4D3A" }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: "#6A6A60", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    {item.desc}
                  </p>
                </div>

                <div className="w-full h-px bg-[#1F4D3A]/5 my-5" />
                
                <span className="text-[9px] font-black text-[#C8A96B] select-none opacity-40 group-hover:opacity-100 transition-opacity">
                  0{i + 1} / AARVIA COMMITMENT
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Eco-Impact Metrics Section */}
      <section className="py-24 bg-[#1F4D3A] text-[#F7F4ED] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(200,169,107,0.8) 1px, transparent 0)", backgroundSize: "28px 28px" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[140px] opacity-[0.06] pointer-events-none" style={{ background: "#C8A96B" }} />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 space-y-4">
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#C8A96B]">Eco Achievements</span>
            <h2 className="text-3xl md:text-5xl font-serif font-light leading-tight">Quantifying Our Eco Footprint</h2>
            <p className="text-sm font-light text-[#F7F4ED]/70 max-w-lg mx-auto">
              We hold our formulations and supply chain processes to high environmental standards. 
              Here is how we verify our sustainability commitment.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="text-center p-8 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm shadow-xl"
              >
                <span className="font-serif text-5xl md:text-6xl font-light text-[#C8A96B] block mb-2">{stat.value}</span>
                <span className="text-xs font-bold uppercase tracking-wider text-[#F7F4ED] block mb-1">{stat.label}</span>
                <span className="text-[10px] text-[#F7F4ED]/60 font-light block">{stat.sub}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Deep-Dive Alternating Storytelling Rows */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-24">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#C8A96B] block">Corporate Transparency</span>
            <h2 className="text-3xl md:text-4.5xl font-serif text-[#1F4D3A] font-light">From Seed to Home Space</h2>
            <p className="text-xs tracking-wider font-semibold text-[#C8A96B] uppercase">Verifying Every Phase of the Product Journey</p>
          </div>

          {STORY_SECTIONS.map((sec, idx) => (
            <div key={sec.badge} className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Left text column, shifted to right on alternate rows */}
              <div className={`space-y-6 ${idx % 2 === 1 ? "lg:order-2" : ""}`}>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#C8A96B] border-b border-[#C8A96B]/30 pb-1 inline-block">
                  {sec.badge}
                </span>
                <h3 className="text-2xl md:text-3.5xl font-serif font-medium text-[#1F4D3A] leading-tight">
                  {sec.title}
                </h3>
                <p className="text-sm leading-relaxed text-[#6A6A60] font-light" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {sec.body}
                </p>
                <div className="space-y-3 pt-2">
                  {sec.benefits.map((b, bIdx) => (
                    <div key={bIdx} className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-[#C8A96B] shrink-0" />
                      <span className="text-xs text-[#1F4D3A] font-medium tracking-wide">{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right image column */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className={`relative overflow-hidden aspect-[4/3] rounded-3xl border border-[#C8A96B]/15 shadow-xl ${idx % 2 === 1 ? "lg:order-1" : ""}`}
              >
                <img
                  src={sec.img}
                  alt={sec.title}
                  className="w-full h-full object-cover transition-transform duration-[8000ms] hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1F4D3A]/25 via-transparent to-transparent pointer-events-none" />
              </motion.div>
            </div>
          ))}
        </div>
      </section>

      {/* Certifications Showcase */}
      <section className="py-16 border-t border-b border-[#C8A96B]/15" style={{ background: "#FAF8F4" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-around gap-8 text-[#1F4D3A]/40 text-center">
            {[
              { icon: Shield, title: "Cruelty Free", desc: "No Animal Testing" },
              { icon: Leaf, title: "100% Vegan", desc: "Plant-Derived Ingredients" },
              { icon: Sparkles, title: "Biodegradable", desc: "Clean Soil Impact" },
              { icon: Globe, title: "Carbon Aware", desc: "Neutral Logistics" },
              { icon: Recycle, title: "Circular Pack", desc: "Amber Glass & PCR" },
            ].map((cert, i) => (
              <div key={i} className="flex flex-col items-center max-w-[150px] space-y-2 group">
                <cert.icon className="w-6 h-6 text-[#1F4D3A]/50 group-hover:text-[#C8A96B] transition-colors duration-300" />
                <span className="text-xs font-serif font-bold text-[#1F4D3A]">{cert.title}</span>
                <span className="text-[9px] uppercase tracking-wider text-[#6A6A60]">{cert.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive visual quotes section */}
      <section className="py-28 relative overflow-hidden" style={{ background: "#1F4D3A" }}>
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(200,169,107,0.9) 1px, transparent 0)", backgroundSize: "32px 32px" }} />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10 space-y-6">
          <Award className="w-10 h-10 mx-auto text-[#C8A96B] opacity-80" />
          <h2
            className="text-3xl md:text-5.5xl font-serif font-light leading-tight"
            style={{ color: "#F7F4ED" }}
          >
            "We do not inherit the earth from our ancestors; we borrow it from our children."
          </h2>
          <div className="w-12 h-0.5 bg-[#C8A96B] mx-auto my-6" />
          <p
            className="text-[10px] uppercase tracking-[0.25em] font-bold"
            style={{ color: "#C8A96B" }}
          >
            The Aarvia Philosophy
          </p>
        </div>
      </section>

      {/* DTC Shop Invitation (CTA) */}
      <section className="py-28 bg-[#F7F4ED] relative">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8 relative z-10">
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#C8A96B] block">
            Clean Home Essentials
          </span>
          <h2 className="text-4xl md:text-5.5xl font-serif font-light text-[#1F4D3A] leading-tight">
            Embrace a Cleaner Ritual.<br />
            <span className="italic" style={{ color: "#C8A96B" }}>Harness Botanical Care.</span>
          </h2>
          <p className="text-sm text-[#6A6A60] font-light max-w-md mx-auto leading-relaxed" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Experience thoughtsfully crafted floor care, dish care, and everyday hand collections inspired by plant science.
          </p>
          <div className="pt-4">
            <Link
              to="/shop"
              className="inline-flex items-center gap-3 px-10 py-5 font-bold tracking-widest uppercase transition-all duration-300 hover:gap-5 hover:bg-[#b89859] active:scale-95 shadow-[0_10px_30px_rgba(0,0,0,0.15)] rounded-full text-[10px]"
              style={{ background: "#C8A96B", color: "#1F4D3A" }}
            >
              Shop Collection <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
