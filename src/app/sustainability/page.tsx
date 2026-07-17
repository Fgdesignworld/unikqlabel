import { motion } from "framer-motion"
import { Leaf, Recycle, Globe, Shield, Heart, Award, ArrowRight, Sparkles, Compass, CheckCircle } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PageHeader } from "@/components/page-header"
import { useSeo } from "@/hooks/use-seo"
import { Link } from "react-router-dom"
import { StoryStackCards } from "@/components/aarvia/story-stack-cards"

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
    body: "We believe true quality begins at the source. We select botanical-inspired ingredients like Neem, Lemongrass, and Tulsi, cultivated under ethical conditions. By harvesting these plants through cold-press methods, we preserve their natural attributes to formulate home care products that are pleasant to use and gentle on the environment. Features regenerative soil cultivation and traceable farming partnerships.",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=600&auto=format&fit=crop",
  },
  {
    badge: "Packaging Roadmap",
    title: "Circular Design and Refillable Rituals",
    body: "Packaging should not become waste. We package our cleaning essentials in amber glass and high-grade PCR bottles to minimize virgin plastic creation. Furthermore, our upcoming refill program will allow customers to purchase lightweight concentrate pouches, cutting down packaging weight and transport emissions.",
    image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=600&auto=format&fit=crop",
  },
  {
    badge: "Conscious Footprint",
    title: "Traceable Supply Chains & Carbon Care",
    body: "AARVIA traces each step of the product journey from raw botanical harvest to your doorstep. We work with freight partners who offset logistics emissions, consolidating shipments to decrease logistics impact. We are committed to achieving verified carbon-neutral transit benchmarks.",
    image: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=600&auto=format&fit=crop",
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
  useSeo({ pageType: "page", pageSlug: "sustainability", fallbackTitle: "Sustainability Commitment — Deepthi Living & Wellness" })

  return (
    <main className="min-h-screen" style={{ background: "#FDFBF7" }}>
      <Navbar />
      {/* Custom Premium Hero */}
      <section className="relative h-[45vh] min-h-[350px] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/heroes/about-story-1.png" 
            alt="Sustainability at Aarvia" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#1F4D3A]/60 mix-blend-multiply" />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center mt-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#C8A96B] block mb-4 drop-shadow-md">
              Our Commitment
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-light text-[#FDFBF7] leading-[1.1] mb-6 drop-shadow-lg">
              Protecting the Earth,<br />
              <span className="italic text-[#C8A96B]">One Ritual at a Time</span>
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Intro Summary Section - Editorial Overlap Layout */}
      <section className="relative overflow-hidden bg-[#FDFBF7] py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center relative">
            
            {/* Left Image */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="w-full lg:w-[55%] relative h-[500px] lg:h-[700px] rounded-tl-[4rem] rounded-br-[4rem] overflow-hidden shadow-2xl z-10"
            >
              <img src="/images/heroes/about-story-3.png" alt="Aarvia Sustainability" className="w-full h-full object-cover" />
            </motion.div>

            {/* Right Text */}
            <motion.div 
              className="w-full lg:w-[55%] lg:-ml-[10%] mt-12 lg:mt-0 relative z-20"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="bg-white/95 backdrop-blur-xl p-10 md:p-14 lg:p-20 rounded-[3rem] shadow-[0_30px_80px_rgba(31,77,58,0.08)] border border-[#C8A96B]/20">
                <span className="text-[11px] font-bold tracking-[0.4em] uppercase block mb-6" style={{ color: '#C8A96B' }}>
                  Sustainable Home Care
                </span>
                <h2 
                  className="text-4xl md:text-5xl lg:text-6xl leading-[1.1] font-light text-[#1F4D3A] mb-8"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  Formulated to Care,<br />
                  <span className="italic font-serif" style={{ color: '#C8A96B' }}>Designed to Respect</span>
                </h2>
                <p 
                  className="text-base lg:text-lg font-light leading-relaxed text-[#6A6A60]" 
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  We believe everyday home wellness shouldn't come at a cost to the ecosystem. Our approach balances botanical-inspired ingredient quality with circular packaging guidelines, establishing safe home care rituals that align with responsible, everyday living.
                </p>
                <div className="mt-12 flex items-center gap-6">
                   <div className="w-16 h-[1px] bg-[#C8A96B]" />
                   <span className="text-xs uppercase tracking-widest text-[#1F4D3A] font-semibold">Earth First</span>
                </div>
              </div>
            </motion.div>

          </div>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {PILLARS.map((item, i) => {
              const isWide = i === 0 || i === 5;
              const bentoClasses = [
                "md:col-span-2 lg:col-span-2 bg-white",
                "md:col-span-1 lg:col-span-1 bg-[#F9F6F0]",
                "md:col-span-1 lg:col-span-1 bg-white",
                "md:col-span-1 lg:col-span-1 bg-[#F9F6F0]",
                "md:col-span-1 lg:col-span-1 bg-white",
                "md:col-span-2 lg:col-span-2 bg-white"
              ]
              
              const imageSrc = i === 0 ? "/images/heroes/about-story-3.png" : "/images/heroes/about-story-1.png";

              return (
                <motion.div 
                  key={item.title} 
                  custom={i} 
                  variants={fadeUp} 
                  initial="hidden" 
                  whileInView="visible" 
                  viewport={{ once: true, margin: "-40px" }}
                  className={`relative min-h-[320px] rounded-[2rem] group overflow-hidden border border-[#C8A96B]/10 hover:shadow-2xl transition-all duration-700 flex flex-col lg:flex-row ${bentoClasses[i]}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#C8A96B]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-10" />
                  
                  {/* Content Container */}
                  <div className={`p-8 lg:p-12 flex flex-col justify-between relative z-20 w-full ${isWide ? 'lg:w-1/2' : ''}`}>
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-mono font-semibold tracking-widest text-[#C8A96B]/60">
                        0{i + 1}
                      </span>
                      <div className="w-12 h-12 rounded-full border border-[#C8A96B]/20 flex items-center justify-center bg-white/50 backdrop-blur-sm group-hover:bg-[#1F4D3A] transition-colors duration-500 shrink-0 ml-4">
                        <item.icon className="w-5 h-5 text-[#1F4D3A] group-hover:text-white transition-colors duration-500" />
                      </div>
                    </div>
                    
                    <div className="mt-12 lg:mt-16">
                      <h3 className="text-2xl font-serif font-medium text-[#1F4D3A] mb-4">
                        {item.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-[#6A6A60]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  {/* Image Container for Wide Cards */}
                  {isWide && (
                    <div className="relative w-full lg:w-1/2 h-64 lg:h-auto order-first lg:order-last overflow-hidden">
                      <img src={imageSrc} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt={item.title} />
                      <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-l from-transparent to-white/40 pointer-events-none" />
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Brand Trust & Philosophy */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img src="/images/heroes/about-philosophy.png" alt="Aarvia Philosophy" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[#1F4D3A]/90 mix-blend-multiply" />
          <div className="absolute inset-0 bg-[#1F4D3A]/50" />
        </div>
        
        <div className="max-w-5xl mx-auto px-6 relative z-10 flex flex-col items-center text-center">
          {/* Quote */}
          <Award className="w-8 h-8 text-[#C8A96B] mb-6 opacity-90" strokeWidth={1} />
          <h3 className="text-3xl md:text-4xl lg:text-5xl font-serif font-light leading-[1.3] text-[#FDFBF7] tracking-wide max-w-4xl">
            "We do not inherit the earth from our ancestors; we borrow it from our children."
          </h3>
          <div className="w-12 h-[1px] bg-[#C8A96B]/50 mx-auto my-8" />
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#C8A96B] mb-16">
            The Aarvia Philosophy
          </p>

          {/* Certifications Row */}
          <div className="w-full grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-4 border-t border-[#C8A96B]/20 pt-12">
            {[
              { icon: Shield, title: "Cruelty Free" },
              { icon: Leaf, title: "100% Vegan" },
              { icon: Sparkles, title: "Biodegradable" },
              { icon: Globe, title: "Carbon Aware" },
              { icon: Recycle, title: "Circular Pack" },
            ].map((cert, i) => (
              <div key={i} className="flex flex-col items-center space-y-3 group">
                <cert.icon className="w-6 h-6 text-[#C8A96B]/80 group-hover:text-[#C8A96B] group-hover:-translate-y-1 transition-all duration-300" strokeWidth={1.5} />
                <span className="text-[9px] uppercase tracking-widest text-[#FDFBF7]/90">{cert.title}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Eco-Impact Metrics Section */}
      <section className="py-24 md:py-32 bg-[#FDFBF7] relative overflow-hidden">
        {/* Soft elegant background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#C8A96B]/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20 space-y-4">
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#C8A96B]">Eco Achievements</span>
            <h2 className="text-3xl md:text-5xl font-serif font-light leading-tight text-[#1F4D3A]">Quantifying Our Eco Footprint</h2>
            <div className="w-12 h-px bg-[#C8A96B]/40 mx-auto mt-6 mb-4" />
            <p className="text-sm font-light text-[#6A6A60] max-w-lg mx-auto" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              We hold our formulations and supply chain processes to high environmental standards. 
              Here is how we verify our sustainability commitment.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-8 lg:gap-y-0 relative mt-12">
            {/* Horizontal line top & bottom */}
            <div className="hidden lg:block absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-[#C8A96B]/20 to-transparent" />
            <div className="hidden lg:block absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-[#C8A96B]/20 to-transparent" />

            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.8 }}
                className="text-center flex flex-col items-center group relative py-8 lg:py-16"
              >
                {/* Vertical Dividers for Desktop */}
                {i !== 0 && <div className="hidden lg:block absolute left-0 top-8 bottom-8 w-px bg-gradient-to-b from-transparent via-[#C8A96B]/20 to-transparent" />}
                {/* Vertical Dividers for Mobile */}
                {i % 2 !== 0 && <div className="block lg:hidden absolute left-0 top-4 bottom-4 w-px bg-gradient-to-b from-transparent via-[#C8A96B]/20 to-transparent" />}
                
                <span className="font-serif text-6xl md:text-7xl lg:text-[5.5rem] font-light text-[#1F4D3A] tracking-tighter block mb-6 group-hover:text-[#C8A96B] group-hover:scale-[1.02] transition-all duration-700">{stat.value}</span>
                <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-[#1F4D3A] block mb-3">{stat.label}</span>
                <span className="text-xs text-[#6A6A60] font-light block max-w-[160px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{stat.sub}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Deep-Dive Alternating Storytelling Rows */}
      <section className="relative bg-white pt-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-16 relative z-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#C8A96B] block">Corporate Transparency</span>
            <h2 className="text-3xl md:text-4.5xl font-serif text-[#1F4D3A] font-light">From Seed to Home Space</h2>
            <p className="text-xs tracking-wider font-semibold text-[#C8A96B] uppercase">Verifying Every Phase of the Product Journey</p>
          </div>
        </div>
        <StoryStackCards cards={STORY_SECTIONS} />
      </section>



      <Footer />
    </main>
  )
}
