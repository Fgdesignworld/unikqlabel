import { motion } from "framer-motion"
import { Leaf, Award, Users, ArrowRight } from "lucide-react"
import { Image } from "@/components/ui/image"
import { Link } from 'react-router-dom';

const pillars = [
  {
    icon: Leaf,
    title: "Sustainable Fabric",
    desc: "Eco-conscious materials that feel premium",
  },
  {
    icon: Award,
    title: "Premium Quality",
    desc: "Every stitch crafted to meet royal standards",
  },
  {
    icon: Users,
    title: "Inclusive Sizing",
    desc: "Made for every body, every king & queen",
  },
]

export function TraditionSection() {
  return (
    <section className="py-10 px-4" style={{ background: 'var(--surface-page)' }}>
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

          {/* ── Left: Lifestyle Image ── */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9 }}
            className="relative"
          >
            {/* Corner accents */}
            <div className="absolute -top-5 -left-5 w-20 h-20 pointer-events-none"
              style={{ borderTop: '2px solid rgba(212,175,55,0.35)', borderLeft: '2px solid rgba(212,175,55,0.35)', borderRadius: '6px 0 0 0' }} />
            <div className="absolute -bottom-5 -right-5 w-20 h-20 pointer-events-none"
              style={{ borderBottom: '2px solid rgba(212,175,55,0.35)', borderRight: '2px solid rgba(212,175,55,0.35)', borderRadius: '0 0 6px 0' }} />

            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden"
              style={{ border: '1px solid rgba(212,175,55,0.12)', boxShadow: '0 30px 80px rgba(0,0,0,0.7)' }}>
              <Image
                src="/images/about-lifestyle.jpg"
                alt="KoffeeKup fashion lifestyle"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0" style={{
                background: 'linear-gradient(135deg, rgba(13,13,13,0.55) 0%, transparent 60%)',
              }} />
            </div>

            {/* Floating accent badge */}
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4, type: 'spring' }}
              className="absolute -right-4 md:-right-10 bottom-10 px-6 py-4 rounded-2xl"
              style={{
                background: 'rgba(13,13,13,0.92)',
                border: '1px solid rgba(212,175,55,0.35)',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
              }}
            >
              <p className="font-heading text-3xl font-black text-amber-500">2026</p>
              <p className="font-body text-xs mt-0.5 uppercase tracking-widest" style={{ color: 'rgba(245,240,232,0.6)' }}>Est. Year</p>
            </motion.div>
          </motion.div>

          {/* ── Right: Content ── */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9 }}
          >
            <span className="section-badge">Our Story</span>
            <h2 className="font-heading text-4xl md:text-5xl font-black mt-5 mb-6 leading-tight" style={{ color: 'var(--text-primary)' }}>
              Our{" "}
              <span style={{
                background: 'linear-gradient(135deg, color-mix(in srgb, var(--theme-color) 90%, white) 0%, var(--theme-color) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Identity
              </span>
            </h2>

            <p className="font-body text-lg leading-relaxed mb-5" style={{ color: 'var(--text-muted)' }}>
              At <span className="text-amber-500" style={{ fontWeight: 600 }}>KoffeeKup</span>, we believe fashion is a crown you
              wear every day. Born from the spirit of royalty and the energy of the streets, we craft garments that speak power,
              confidence, and unapologetic self-expression.
            </p>
            <p className="font-body text-base leading-relaxed mb-10" style={{ color: 'var(--text-dim)' }}>
              Our unisex collections break boundaries — designed for kings, queens, and everyone who dares to rule their own narrative.
            </p>

            {/* Pillars */}
            <div className="space-y-4 mb-10">
              {pillars.map((pillar, index) => (
                <motion.div
                  key={pillar.title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-center gap-4 p-4 rounded-xl"
                  style={{
                    background: 'rgba(212,175,55,0.04)',
                    border: '1px solid rgba(212,175,55,0.10)',
                  }}
                >
                  <div className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(212,175,55,0.10)', border: '1px solid rgba(212,175,55,0.20)' }}>
                    <pillar.icon className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="font-body font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{pillar.title}</p>
                    <p className="font-body text-xs mt-0.5" style={{ color: 'var(--text-subtle)' }}>{pillar.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <Link
              to="/about"
              className="inline-flex items-center gap-2 font-body font-semibold text-sm uppercase tracking-wider transition-all duration-300 group hover:gap-3"
              style={{ color: 'var(--theme-color)' }}
            >
              Discover the Brand
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
