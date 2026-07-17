"use client"

import { useRef } from "react"
import { useScroll, useTransform, motion } from "framer-motion"
import { Leaf, ArrowRight, Shield, Heart, Recycle, Compass, Sparkles, Quote } from "lucide-react"
import { Link } from "react-router-dom"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useSeo } from "@/hooks/use-seo"
import { PageHeader } from "@/components/page-header"
import { StoryStackCards } from "@/components/aarvia/story-stack-cards"

const PILLARS = [
  { icon: Leaf, title: "Pure Botanicals", desc: "Every formula features plant-derived actives like Neem, Lemongrass, and Tulsi, free from harsh synthetics or artificial colorants." },
  { icon: Compass, title: "Thoughtfully Crafted", desc: "We combine high-performance botanical ingredients with practicality to elevate your daily home wellness rituals." },
  { icon: Heart, title: "Cruelty Free", desc: "Ethical formulation is at our core. None of our products or ingredients are ever tested on animals." },
  { icon: Recycle, title: "Responsible Living", desc: "Crafted with eco-conscious, recyclable materials. We respect the Earth as we harness its botanicals." },
  { icon: Shield, title: "Everyday Care", desc: "Formulated to be safe for your family, pets, and the home environment. Clean solutions you can trust." },
]

const STATS = [
  { v: "100%", l: "Inspired by Nature" },
  { v: "0", l: "Harsh Synthetics" },
  { v: "100%", l: "Ethically Sourced" },
  { v: "5+", l: "Wellness Products" },
]

const STORY = [
  {
    badge: "The Vision",
    title: "Nature inspires better living",
    body: "AARVIA™ was created with a simple belief: Nature inspires better living. Our journey began with a vision to create thoughtfully crafted home wellness products that combine quality, practicality, and everyday care.",
    image: "/images/heroes/about-story-1.png"
  },
  {
    badge: "The Philosophy",
    title: "A Healthier Home",
    body: "We believe a cleaner home contributes to a better living experience. Every floor cleaner, dishwash liquid, and hand wash we create is designed with this philosophy in mind, ensuring safety and freshness for everyday spaces.",
    image: "/images/heroes/about-story-2.png"
  },
  {
    badge: "The Future",
    title: "Wellness Expansion",
    body: "Today, AARVIA™ begins with Home Wellness. Guided by simplicity and nature, we will gradually expand into Personal Care and Lifestyle collections, supporting your complete wellness journey.",
    image: "/images/heroes/about-story-3.png"
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 35 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.8, ease: [0.22, 1, 0.36, 1] }
  })
}

function PhilosophySection() {
  const quoteText = "Wellness begins at home. By selecting pure, nature-inspired solutions, we create a healthier, cleaner, and more harmonious environment for everyday living."

  return (
    <section className="relative flex items-center justify-center py-16 lg:py-24 overflow-hidden border-y border-[#C8A96B]/10">
      {/* Full Bleed Background Image */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-cover bg-center scale-105" style={{ backgroundImage: "url('/images/heroes/about-philosophy.png')" }} />
        <div className="absolute inset-0 bg-[#FDFBF7]/20" /> {/* Slight lighten overlay */}
      </div>

      <div className="max-w-3xl mx-auto px-6 relative z-10 w-full">
        {/* Glassmorphism Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative bg-white/75 backdrop-blur-xl border border-white/60 shadow-2xl rounded-[2.5rem] p-10 lg:p-14 text-center"
        >
          <Quote className="w-10 h-10 mx-auto text-[#C8A96B] opacity-80 mb-8" />
          
          <h3 className="text-2xl md:text-3xl lg:text-4xl font-serif font-light leading-[1.6] text-[#1F4D3A] tracking-wide">
            {quoteText}
          </h3>
          
          <div className="pt-10">
            <div className="w-12 h-[1px] bg-[#C8A96B]/60 mx-auto mb-6" />
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#C8A96B]">
              Our Philosophy
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default function AboutPage() {
  useSeo({ pageType: 'page', pageSlug: 'about', fallbackTitle: 'Our Story — Aarvia' })
  
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()
  const yHeroBg = useTransform(scrollY, [0, 500], [0, 150])
  const scaleHeroBg = useTransform(scrollY, [0, 600], [1.02, 1.1])
  const opacityHeroText = useTransform(scrollY, [0, 400], [1, 0])
  const yHeroText = useTransform(scrollY, [0, 400], [0, 80])

  return (
    <main className="min-h-screen relative overflow-x-hidden" style={{ background: '#FDFBF7' }}>
      <Navbar />

      {/* Hero Banner */}
      <PageHeader backgroundImage="/images/heroes/about-hero.png" />

      {/* Hero Content - Editorial Split Screen */}
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
              <img src="/images/heroes/about-intro-model.png" alt="Aarvia Lifestyle" className="w-full h-full object-cover" />
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
                  Our Story
                </span>
                <h1 
                  className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-[1.1] font-light text-[#1F4D3A] mb-8"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  Nature Inspires<br />
                  <span className="italic font-serif" style={{ color: '#C8A96B' }}>Better Living</span>
                </h1>
                <p 
                  className="text-base lg:text-lg font-light leading-relaxed text-[#6A6A60]" 
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  A thoughtfully crafted collection of home wellness solutions combining botanical quality, everyday care, and practical design. We believe that true luxury is found in the purity of nature.
                </p>
                <div className="mt-12 flex items-center gap-6">
                   <div className="w-16 h-[1px] bg-[#C8A96B]" />
                   <span className="text-xs uppercase tracking-widest text-[#1F4D3A] font-semibold">Since 2026</span>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Cinematic Stats Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/heroes/about-stats-bg.png')" }} />
          <div className="absolute inset-0 bg-[#FDFBF7]/80 backdrop-blur-sm" />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 lg:gap-16">
            {STATS.map(({ v, l }, i) => (
              <motion.div 
                key={l} 
                custom={i} 
                variants={fadeUp} 
                initial="hidden" 
                whileInView="visible" 
                viewport={{ once: true, margin: "-40px" }} 
                className="text-center space-y-3"
              >
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '4rem', fontWeight: 600, color: '#1F4D3A', lineHeight: 1 }}>{v}</p>
                <div className="w-8 h-[2px] bg-[#C8A96B]/60 mx-auto" />
                <p className="text-[11px] font-bold tracking-[0.25em] uppercase" style={{ color: '#C8A96B' }}>{l}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stacking Story Cards */}
      <section className="relative bg-[#FDFBF7] pb-[30vh]">
        <StoryStackCards cards={STORY} />
      </section>

      {/* Philosophy Quotes */}
      <PhilosophySection />

      {/* Vision and Mission Section - Tall Portrait Cards */}
      <section className="py-24 lg:py-32" style={{ background: '#FDFBF7' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
            
            {/* Vision Card */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="group relative h-[600px] lg:h-[700px] rounded-[2.5rem] overflow-hidden bg-white shadow-sm hover:shadow-xl transition-all duration-700"
            >
              <div className="absolute inset-0 h-[60%] overflow-hidden">
                <img src="/images/heroes/about-intro-model.png" alt="Vision" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
              </div>
              <div className="absolute bottom-0 w-full h-[50%] bg-white rounded-t-[2.5rem] p-10 lg:p-14 flex flex-col justify-center transform -translate-y-4">
                <h3 className="text-3xl lg:text-4xl font-serif font-normal text-[#1F4D3A] mb-4">Our Vision</h3>
                <p className="text-sm lg:text-base leading-relaxed text-[#6A6A60]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  To become a trusted Indian wellness brand inspired by nature and built for modern living, delivering true botanical luxury to every home.
                </p>
              </div>
            </motion.div>

            {/* Mission Card */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="group relative h-[600px] lg:h-[700px] rounded-[2.5rem] overflow-hidden bg-[#F9F6F0] shadow-sm hover:shadow-xl transition-all duration-700 mt-12 md:mt-24"
            >
              <div className="absolute inset-0 h-[60%] overflow-hidden">
                <img src="/images/heroes/about-vision-mission.png" alt="Mission" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
              </div>
              <div className="absolute bottom-0 w-full h-[50%] bg-[#F9F6F0] rounded-t-[2.5rem] p-10 lg:p-14 flex flex-col justify-center transform -translate-y-4 border-t border-white">
                <h3 className="text-3xl lg:text-4xl font-serif font-normal text-[#1F4D3A] mb-4">Our Mission</h3>
                <p className="text-sm lg:text-base leading-relaxed text-[#6A6A60]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  To create thoughtfully crafted products that support cleaner homes, fresher spaces, and healthier everyday routines using 100% pure botanical actives.
                </p>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Commitments/Pillars */}
      <section className="py-12 lg:py-16 relative" style={{ background: '#FDFBF7' }}>
        <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #1F4D3A 1px, transparent 0)', backgroundSize: '20px 20px' }} />
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center mb-10 space-y-3">
            <motion.p 
              initial={{ opacity: 0, y: 10 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }}
              className="text-[11px] font-bold tracking-[0.3em] uppercase" 
              style={{ color: '#C8A96B' }}
            >
              Our Commitments
            </motion.p>
            <motion.h2 
              initial={{ opacity: 0, y: 16 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              transition={{ delay: 0.06 }}
              className="text-4xl md:text-5xl font-serif font-light text-[#1F4D3A]"
            >
              What We Stand For
            </motion.h2>
            <div className="w-12 h-1 bg-[#C8A96B] mx-auto mt-4 rounded-full" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {PILLARS.map(({ icon: Icon, title, desc }, i) => {
              const bentoClasses = [
                "md:col-span-1 lg:col-span-2 bg-white",
                "md:col-span-1 lg:col-span-2 bg-[#F9F6F0]",
                "md:col-span-1 lg:col-span-1 bg-white",
                "md:col-span-1 lg:col-span-2 bg-[#F9F6F0]",
                "md:col-span-1 lg:col-span-1 bg-white"
              ]
              
              return (
                <motion.div 
                  key={title} 
                  custom={i} 
                  variants={fadeUp} 
                  initial="hidden" 
                  whileInView="visible" 
                  viewport={{ once: true, margin: "-40px" }}
                  className={`relative p-8 lg:p-12 min-h-[320px] rounded-[2rem] flex flex-col justify-between group overflow-hidden border border-[#C8A96B]/10 hover:shadow-2xl transition-all duration-700 ${bentoClasses[i]}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  
                  <div className="flex justify-between items-start relative z-10">
                    <span className="text-sm font-mono font-semibold tracking-widest text-[#C8A96B]/60">
                      0{i + 1}
                    </span>
                    <div className="w-12 h-12 rounded-full border border-[#C8A96B]/20 flex items-center justify-center bg-white/50 backdrop-blur-sm group-hover:bg-[#1F4D3A] transition-colors duration-500">
                      <Icon className="w-5 h-5 text-[#1F4D3A] group-hover:text-white transition-colors duration-500" />
                    </div>
                  </div>
                  
                  <div className="relative z-10 mt-16">
                    <h3 className="text-2xl lg:text-3xl font-serif font-normal text-[#1F4D3A] mb-4 group-hover:-translate-y-1 transition-transform duration-500">
                      {title}
                    </h3>
                    <p className="text-sm leading-relaxed text-[#6A6A60] opacity-80 group-hover:opacity-100 transition-opacity duration-500" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      {desc}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-4 md:py-6 bg-[#FDFBF7] border-t border-[#C8A96B]/10">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-2">
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#C8A96B]">
            Begin Your Ritual
          </span>
          <h2 className="text-2xl md:text-3xl font-serif font-light text-[#1F4D3A] leading-tight">
            Ready to Experience <span className="italic">Pure Botanicals?</span>
          </h2>
          <p className="text-xs text-[#6A6A60] max-w-sm mx-auto pb-1">
            Discover our curated collections designed to support cleaner homes and better living.
          </p>
          <div>
            <Link 
              to="/shop"
              className="inline-flex items-center gap-3 bg-transparent border border-[#1F4D3A] text-[#1F4D3A] px-6 py-2 rounded-full text-[9px] font-bold tracking-[0.2em] uppercase hover:bg-[#1F4D3A] hover:text-[#FDFBF7] transition-colors duration-300"
            >
              Explore Collection
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}