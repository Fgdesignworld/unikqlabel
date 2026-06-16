import { useRef } from "react"
import { useScroll, useTransform, motion } from "framer-motion"
import { Leaf, ArrowRight, Shield, Heart, Recycle, Compass, Sparkles, Quote } from "lucide-react"
import { Link } from "react-router-dom"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useSeo } from "@/hooks/use-seo"
import { StoryStackCards } from "@/components/aarvia/story-stack-cards"

const PILLARS = [
  { icon: Leaf, title: "Pure Botanicals", desc: "Every formula features plant-derived actives like Neem, Lemongrass, and Tulsi, free from harsh synthetics or artificial colorants." },
  { icon: Compass, title: "Thoughtfully Crafted", desc: "We combine high-performance organic ingredients with practicality to elevate your daily home wellness rituals." },
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
    image: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?q=80&w=600&auto=format&fit=crop"
  },
  {
    badge: "The Philosophy",
    title: "A Healthier Home",
    body: "We believe a cleaner home contributes to a better living experience. Every floor cleaner, dishwash liquid, and hand wash we create is designed with this philosophy in mind, ensuring safety and freshness for everyday spaces.",
    image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=600&auto=format&fit=crop"
  },
  {
    badge: "The Future",
    title: "Wellness Expansion",
    body: "Today, AARVIA™ begins with Home Wellness. Guided by simplicity and nature, we will gradually expand into Personal Care and Lifestyle collections, supporting your complete wellness journey.",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=600&auto=format&fit=crop"
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
  const sectionRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  })

  const quoteText = "Wellness begins at home. By selecting pure, nature-inspired solutions, we create a healthier, cleaner, and more harmonious environment for everyday living."
  const words = quoteText.split(" ")

  return (
    <section 
      ref={sectionRef} 
      className="min-h-screen flex items-center justify-center bg-[#1F4D3A] py-28 relative overflow-hidden"
    >
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(200,169,107,0.9) 1px, transparent 0)', backgroundSize: '36px 36px' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[160px] opacity-[0.04] pointer-events-none" style={{ background: '#C8A96B' }} />

      <div className="max-w-5xl mx-auto px-6 text-center space-y-10 relative z-10">
        <Quote className="w-12 h-12 mx-auto text-[#C8A96B] opacity-40 animate-pulse" />
        
        <h3 className="text-3xl md:text-5xl lg:text-6xl font-serif font-light leading-snug text-[#F7F4ED] tracking-wide max-w-4xl mx-auto">
          {words.map((word, i) => {
            const start = i / words.length * 0.4 + 0.15
            const end = start + 0.12
            const opacity = useTransform(scrollYProgress, [start, end], [0.15, 1])
            
            return (
              <motion.span 
                key={i} 
                style={{ opacity }}
                className="inline-block mr-3 md:mr-4 select-none"
              >
                {word}
              </motion.span>
            )
          })}
        </h3>
        
        <div className="w-16 h-[1.5px] bg-[#C8A96B] mx-auto mt-10" />
        <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#C8A96B]">
          Aarvia Home Wellness
        </p>
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
    <main className="min-h-screen relative overflow-x-hidden" style={{ background: '#F7F4ED' }}>
      <Navbar />

      {/* Hero */}
      <section 
        ref={heroRef}
        className="relative overflow-hidden h-screen min-h-[600px] flex items-center justify-center bg-[#1F4D3A]"
      >
        <motion.div 
          style={{ y: yHeroBg, scale: scaleHeroBg }}
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
          <div className="absolute inset-0 bg-cover bg-center brightness-[0.35] saturate-[0.8]" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?q=80&w=1200&auto=format&fit=crop')" }} />
          <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(200,169,107,0.9) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1F4D3A]/20 via-transparent to-[#1F4D3A]/60" />
        </motion.div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full text-center relative z-10">
          <motion.div 
            style={{ opacity: opacityHeroText, y: yHeroText }} 
            className="space-y-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="text-[11px] font-bold tracking-[0.4em] uppercase block" style={{ color: '#C8A96B' }}>
              Our Story
            </span>
            <h1 
              className="text-5xl md:text-7xl lg:text-8xl leading-[1.15] font-light text-[#F7F4ED]"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Nature Inspires<br />
              <span className="italic font-serif" style={{ color: '#C8A96B' }}>Better Living</span>
            </h1>
            <p 
              className="text-sm md:text-base max-w-lg mx-auto font-light leading-relaxed pt-2" 
              style={{ color: 'rgba(247,244,237,0.72)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              A thoughtfully crafted collection of home wellness solutions combining botanical quality, everyday care, and practical design.
            </p>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3 cursor-pointer"
          onClick={() => window.scrollTo({ top: window.innerHeight * 0.85, behavior: 'smooth' })}
        >
          <span className="text-[9px] font-bold tracking-[0.25em] uppercase text-[#F7F4ED]/60 select-none">
            Scroll to Explore
          </span>
          <div className="w-[1px] h-10 bg-[#C8A96B]/20 relative overflow-hidden rounded-full">
            <motion.div 
              animate={{ y: ["-100%", "100%"] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
              className="w-full h-1/2 bg-[#C8A96B] absolute top-0"
            />
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section style={{ background: '#F7F4ED', borderBottom: '1px solid rgba(200,169,107,0.12)' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            {STATS.map(({ v, l }, i) => (
              <motion.div 
                key={l} 
                custom={i} 
                variants={fadeUp} 
                initial="hidden" 
                whileInView="visible" 
                viewport={{ once: true, margin: "-40px" }} 
                className="text-center space-y-1.5"
              >
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '3.5rem', fontWeight: 600, color: '#1F4D3A', lineHeight: 1 }}>{v}</p>
                <div className="w-6 h-[1.5px] bg-[#C8A96B]/50 mx-auto" />
                <p className="text-[10px] font-semibold tracking-[0.2em] uppercase" style={{ color: '#C8A96B' }}>{l}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stacking Story Cards */}
      <section className="relative bg-[#1A382A] pb-[30vh]">
        <StoryStackCards cards={STORY} />
      </section>

      {/* Philosophy Quotes */}
      <PhilosophySection />

      {/* Vision and Mission Section */}
      <section className="py-24" style={{ background: '#F7F4ED', borderBottom: '1px solid rgba(200,169,107,0.1)' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
            
            {/* Vision Card */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white border border-[#C8A96B]/20 rounded-3xl p-8 lg:p-12 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col gap-6"
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#1F4D3A]/5 border border-[#C8A96B]/25">
                <Leaf className="w-5 h-5 text-[#1F4D3A]" />
              </div>
              <h3 className="text-3xl font-serif font-normal text-[#1F4D3A]">Our Vision</h3>
              <p className="text-sm leading-relaxed text-[#6A6A60]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                To become a trusted Indian wellness brand inspired by nature and built for modern living.
              </p>
            </motion.div>

            {/* Mission Card */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white border border-[#C8A96B]/20 rounded-3xl p-8 lg:p-12 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col gap-6"
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#C8A96B]/10 border border-[#C8A96B]/30">
                <Sparkles className="w-5 h-5 text-[#C8A96B]" />
              </div>
              <h3 className="text-3xl font-serif font-normal text-[#1F4D3A]">Our Mission</h3>
              <p className="text-sm leading-relaxed text-[#6A6A60]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                To create thoughtfully crafted products that support cleaner homes, fresher spaces, and healthier everyday routines.
              </p>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Commitments/Pillars */}
      <section className="py-28 lg:py-36 relative" style={{ background: '#F7F4ED' }}>
        <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #1F4D3A 1px, transparent 0)', backgroundSize: '20px 20px' }} />
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20 space-y-3">
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
          
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            {PILLARS.map(({ icon: Icon, title, desc }, i) => (
              <motion.div 
                key={title} 
                custom={i} 
                variants={fadeUp} 
                initial="hidden" 
                whileInView="visible" 
                viewport={{ once: true, margin: "-40px" }}
                className="p-8 group relative transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_25px_50px_rgba(31,77,58,0.06)] bg-white rounded-2xl overflow-hidden flex flex-col justify-between"
                style={{ border: '1px solid rgba(200,169,107,0.15)' }}
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-[#C8A96B]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div>
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#1F4D3A] group-hover:text-white transition-all duration-500"
                    style={{ background: 'rgba(31,77,58,0.04)', border: '1px solid rgba(200,169,107,0.18)', color: '#1F4D3A' }}
                  >
                    <Icon className="w-5 h-5 transition-colors duration-300" />
                  </div>
                  <h3 className="font-semibold mb-4 leading-snug text-[#1F4D3A]" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.25rem' }}>{title}</h3>
                  <p className="text-xs leading-relaxed text-[#7A7A72]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{desc}</p>
                </div>
                
                <span className="text-[10px] font-bold text-[#C8A96B] mt-6 select-none opacity-40 group-hover:opacity-100 transition-opacity">
                  0{i + 1}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden" style={{ background: '#1F4D3A' }}>
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(200,169,107,0.9) 1px, transparent 0)', backgroundSize: '28px 28px' }} />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full blur-[140px] opacity-[0.06] pointer-events-none" style={{ background: '#C8A96B' }} />
        
        <div className="max-w-3xl mx-auto px-6 text-center space-y-8 relative z-10">
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#C8A96B] block">
            Begin Your Ritual
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-light text-[#F7F4ED] leading-tight">
            Ready to Experience<br />
            <span className="italic" style={{ color: '#C8A96B' }}>Pure Botanicals?</span>
          </h2>
          <p className="text-sm text-[#F7F4ED]/70 font-light max-w-md mx-auto leading-relaxed">
            Discover our curated collections designed to support cleaner homes and better living.
          </p>
          <div className="pt-4">
            <Link 
              to="/shop"
              className="inline-flex items-center gap-3 px-10 py-5 font-bold tracking-widest uppercase transition-all duration-300 hover:gap-5 hover:bg-[#b89859] active:scale-95 shadow-[0_10px_30px_rgba(0,0,0,0.15)] rounded-full text-[10px]"
              style={{ background: '#C8A96B', color: '#1F4D3A' }}
            >
              Explore Collection <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}