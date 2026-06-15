import { motion } from "framer-motion"
import { Leaf, Recycle, Globe, Compass, ShieldCheck, Heart } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PageHeader } from "@/components/page-header"
import { useSeo } from "@/hooks/use-seo"

const COMMITMENTS = [
  {
    icon: Leaf,
    title: "100% Vegan & Bio-based Formulas",
    desc: "Every product we develop is entirely plant-derived, biodegradable, and cruelty-free. We bypass synthetic fillers in favor of cold-pressed botanicals.",
  },
  {
    icon: Recycle,
    title: "Circular & Refillable Packaging",
    desc: "We prioritize amber glass and post-consumer recycled (PCR) materials. Our goal is 100% circularity through our upcoming refill program.",
  },
  {
    icon: Globe,
    title: "Carbon-Aware Logistics",
    desc: "From farm to formulation, we trace and offset our supply chain footprint. We partner with climate-neutral shipping services.",
  },
  {
    icon: Compass,
    title: "Ethical & Fair Sourcing",
    desc: "We collaborate with local farmers and indigenous harvesters who practice regenerative agriculture. Ensuring biodiversity is protected.",
  },
  {
    icon: ShieldCheck,
    title: "Zero Harm Chemicals",
    desc: "Strictly formulated without parabens, sulfates, silicones, synthetic fragrances, or endocrine disruptors. Pure safety for you and the planet.",
  },
  {
    icon: Heart,
    title: "Giving Back to the Earth",
    desc: "1% of all sales are dedicated to local soil regeneration and planting native Australian botanical trees in partnership with global green charities.",
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  }),
}

export default function SustainabilityPage() {
  useSeo({ pageType: "page", pageSlug: "sustainability", fallbackTitle: "Sustainability Commitment — Aarvia" })

  return (
    <main className="min-h-screen" style={{ background: "#F7F4ED" }}>
      <Navbar />
      <PageHeader
        title="Our Commitment to Earth"
        subtitle="AARVIA is built on absolute transparency, respect for the environment, and a commitment to leaving the planet better than we found it."
        backgroundImage="https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=1200&auto=format&fit=crop"
      />

      {/* Grid of Commitments */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-[11px] font-bold tracking-[0.26em] uppercase mb-3" style={{ color: "#C8A96B" }}>
              Circular Beauty
            </p>
            <h2 className="text-4xl md:text-5xl font-serif font-normal" style={{ color: "#1F4D3A" }}>
              Sourced Sustainably. Formulated Safely.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {COMMITMENTS.map((item, i) => (
              <motion.div
                key={item.title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="p-8 rounded-none transition-all duration-300 hover:shadow-lg"
                style={{ background: "rgba(31,77,58,0.02)", border: "1px solid rgba(200,169,107,0.15)" }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-6"
                  style={{ background: "rgba(31,77,58,0.06)", border: "1px solid rgba(200,169,107,0.2)" }}
                >
                  <item.icon className="w-5 h-5" style={{ color: "#1F4D3A" }} />
                </div>
                <h3
                  className="text-lg font-serif font-semibold mb-3"
                  style={{ color: "#1F4D3A" }}
                >
                  {item.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "#6A6A60", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive visual spacer banner */}
      <section className="py-32 relative overflow-hidden" style={{ background: "#1F4D3A" }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(200,169,107,0.4) 1px, transparent 0)", backgroundSize: "32px 32px" }} />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <Leaf className="w-8 h-8 mx-auto mb-6 opacity-80" style={{ color: "#C8A96B" }} />
          <h2
            className="text-3xl md:text-5xl font-serif font-normal leading-tight mb-6"
            style={{ color: "#F7F4ED" }}
          >
            "We do not inherit the earth from our ancestors; we borrow it from our children."
          </h2>
          <p
            className="text-xs uppercase tracking-[0.2em] font-semibold"
            style={{ color: "#C8A96B" }}
          >
            Aarvia Philosophy
          </p>
        </div>
      </section>

      <Footer />
    </main>
  )
}
