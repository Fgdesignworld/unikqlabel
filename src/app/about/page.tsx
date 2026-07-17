"use client"

import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useSeo } from "@/hooks/use-seo"
import { PageHeader } from "@/components/page-header"
import { OurBrandsSection } from "@/components/aarvia/our-brands-section"
import { ShieldCheck, Star, Recycle, Lightbulb, Leaf, Heart } from "lucide-react"

const VALUES = [
  { name: "Integrity", icon: ShieldCheck },
  { name: "Quality", icon: Star },
  { name: "Responsibility", icon: Recycle },
  { name: "Innovation", icon: Lightbulb },
  { name: "Simplicity", icon: Leaf },
  { name: "Trust", icon: Heart },
]

export default function AboutPage() {
  useSeo({ pageType: 'page', pageSlug: 'about', fallbackTitle: 'Our Purpose — Deepthi Living & Wellness' })

  return (
    <main className="min-h-screen relative overflow-x-hidden" style={{ background: '#FDFBF7' }}>
      <Navbar />

      <PageHeader backgroundImage="/images/heroes/about-hero.png" />

      {/* Hero & Story Section */}
      <section className="relative overflow-hidden bg-[#FDFBF7] py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center relative gap-12 lg:gap-0">
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="w-full lg:w-[50%] relative h-[500px] lg:h-[700px] rounded-tl-[4rem] rounded-br-[4rem] overflow-hidden shadow-2xl z-10"
            >
              <img src="/images/heroes/about-intro-model.png" alt="Our Story" className="w-full h-full object-cover" />
            </motion.div>

            <motion.div 
              className="w-full lg:w-[60%] lg:-ml-[10%] relative z-20"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="bg-white/95 backdrop-blur-xl p-10 md:p-14 lg:p-20 rounded-[3rem] shadow-xl border border-[#C8A96B]/20">
                <span className="text-[11px] font-bold tracking-[0.4em] uppercase block mb-6" style={{ color: '#C8A96B' }}>
                  Our Purpose
                </span>
                
                <h1 
                  className="text-4xl md:text-5xl lg:text-6xl leading-[1.2] font-serif font-light text-[#1F4D3A] mb-8"
                >
                  We Believe Better Living Is Built Every Day.
                </h1>

                <div className="space-y-6 text-base lg:text-lg font-light leading-relaxed text-[#6A6A60] font-sans">
                  <p>Every meaningful change begins with a simple choice.</p>
                  <p>The choice to create products that care for homes without compromising health.</p>
                  <p>The choice to value quality over shortcuts.</p>
                  <p>The choice to build brands that families can trust.</p>
                  <p className="font-medium text-[#1F4D3A] italic text-xl mt-4">That choice became Deepthi Living & Wellness.</p>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Vision and Mission */}
      <section className="py-24 lg:py-32" style={{ background: '#F9F6F0' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
            
            {/* Vision */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="group relative h-[500px] lg:h-[600px] rounded-[2.5rem] overflow-hidden bg-white shadow-sm hover:shadow-xl transition-all duration-700"
            >
              <div className="absolute inset-0 h-[60%] overflow-hidden">
                <img src="/images/heroes/about-story-2.png" alt="Vision" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
              </div>
              <div className="absolute bottom-0 w-full h-[50%] bg-white rounded-t-[2.5rem] p-10 lg:p-14 flex flex-col justify-center transform -translate-y-4 border-t border-white/50">
                <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#C8A96B] mb-4">Our Vision</span>
                <p className="text-xl lg:text-2xl font-serif text-[#1F4D3A] leading-relaxed">
                  To become one of India's most trusted creators of better living brands.
                </p>
              </div>
            </motion.div>

            {/* Mission */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="group relative h-[500px] lg:h-[600px] rounded-[2.5rem] overflow-hidden bg-[#FDFBF7] shadow-sm hover:shadow-xl transition-all duration-700 mt-12 md:mt-24"
            >
              <div className="absolute inset-0 h-[60%] overflow-hidden">
                <img src="/images/heroes/about-story-1.png" alt="Mission" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
              </div>
              <div className="absolute bottom-0 w-full h-[50%] bg-[#FDFBF7] rounded-t-[2.5rem] p-10 lg:p-14 flex flex-col justify-center transform -translate-y-4 border-t border-white/50">
                <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#C8A96B] mb-4">Our Mission</span>
                <p className="text-xl lg:text-2xl font-serif text-[#1F4D3A] leading-relaxed">
                  To create thoughtful products that enrich everyday living while respecting people and the planet.
                </p>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 lg:py-32 relative" style={{ background: '#FDFBF7' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 space-y-3">
            <motion.p 
              initial={{ opacity: 0, y: 10 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }}
              className="text-[11px] font-bold tracking-[0.3em] uppercase text-[#C8A96B]" 
            >
              Our Core Principles
            </motion.p>
            <motion.h2 
              initial={{ opacity: 0, y: 16 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              transition={{ delay: 0.06 }}
              className="text-4xl md:text-5xl font-serif font-light text-[#1F4D3A]"
            >
              Our Values
            </motion.h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 lg:gap-10 max-w-4xl mx-auto">
            {VALUES.map(({ icon: Icon, name }, i) => (
              <motion.div 
                key={name} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="flex flex-col items-center justify-center p-8 text-center"
              >
                <div className="w-16 h-16 rounded-full border border-[#C8A96B]/30 flex items-center justify-center mb-6 bg-white shadow-sm">
                  <Icon className="w-6 h-6 text-[#1F4D3A]" />
                </div>
                <h3 className="text-lg lg:text-xl font-serif font-medium text-[#1F4D3A]">
                  {name}
                </h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Brands Component */}
      <OurBrandsSection />

      <Footer />
    </main>
  )
}