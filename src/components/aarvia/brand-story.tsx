import { motion } from "framer-motion"
import { ArrowRight, Leaf } from "lucide-react"
import { Link } from "react-router-dom"

export function BrandStory() {
  return (
    <section className="py-24 lg:py-32 overflow-hidden" style={{ background: '#1F4D3A' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left — visual block */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="relative" style={{ aspectRatio: '4/5' }}>
              {/* Main image placeholder / accent block */}
              <div className="absolute inset-0 rounded-none overflow-hidden"
                style={{ border: '1px solid rgba(200,169,107,0.15)' }}>
                <img src="https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=600&auto=format&fit=crop" alt="Aarvia Botanicals" className="w-full h-full object-cover brightness-[0.7] saturate-[0.8] transition-transform duration-700 hover:scale-105" />
                <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(200,169,107,0.9) 1px, transparent 0)', backgroundSize: '20px 20px' }} />
                {/* Large decorative letter */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18rem', fontWeight: 700, color: 'rgba(200,169,107,0.06)', lineHeight: 1 }}>A</span>
                </div>
              </div>

              {/* Floating stat card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: 0.4, duration: 0.6 }}
                className="absolute -bottom-6 -right-6 p-6"
                style={{ background: '#F7F4ED', minWidth: '160px' }}>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.5rem', fontWeight: 700, color: '#1F4D3A', lineHeight: 1 }}>100%</p>
                <p className="text-[11px] font-semibold tracking-widest uppercase mt-1" style={{ color: '#C8A96B' }}>Natural</p>
                <p className="text-xs mt-1" style={{ color: '#6B6B60' }}>No synthetics. Ever.</p>
              </motion.div>

              {/* Floating leaf accent */}
              <motion.div
                animate={{ y: [-6, 6, -6] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-4 -left-4 w-14 h-14 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(200,169,107,0.12)', border: '1px solid rgba(200,169,107,0.25)' }}>
                <Leaf className="w-6 h-6" style={{ color: '#C8A96B' }} />
              </motion.div>
            </div>
          </motion.div>

          {/* Right — text */}
          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5 }}
              className="text-[11px] font-bold tracking-[0.26em] uppercase mb-5"
              style={{ color: '#C8A96B' }}>
              Our Story
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.08, duration: 0.7 }}
              className="text-4xl md:text-5xl lg:text-6xl leading-[1.05] mb-7"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, color: '#F7F4ED' }}>
              Born from<br />
              <span style={{ color: '#C8A96B', fontStyle: 'italic' }}>Nature's Wisdom</span>
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.15, duration: 0.7 }}
              className="space-y-4 mb-10"
              style={{ color: 'rgba(247,244,237,0.65)', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.9375rem', lineHeight: 1.75 }}>
              <p>Aarvia was founded on a simple belief — that the most powerful ingredients are those nature has perfected over millennia. We harness botanical actives, ancient wisdom, and modern science to create formulations that truly deliver.</p>
              <p>Every product is an invitation to slow down, to nourish, and to reconnect with the rituals that matter. Cruelty-free, sustainable, and crafted with integrity from sourcing to shelf.</p>
            </motion.div>

            {/* Pillars */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.22, duration: 0.7 }}
              className="grid grid-cols-3 gap-4 mb-10">
              {[{ v: '50+', l: 'Botanicals' }, { v: '0', l: 'Synthetics' }, { v: '100%', l: 'Cruelty Free' }].map(({ v, l }) => (
                <div key={l} className="text-center py-4" style={{ borderTop: '1px solid rgba(200,169,107,0.2)' }}>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.875rem', fontWeight: 700, color: '#C8A96B', lineHeight: 1 }}>{v}</p>
                  <p className="text-[11px] font-medium tracking-wider uppercase mt-1.5" style={{ color: 'rgba(247,244,237,0.45)' }}>{l}</p>
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
              <Link to="/about"
                className="inline-flex items-center gap-2.5 font-semibold tracking-wider transition-all hover:gap-4"
                style={{ color: '#F7F4ED', fontSize: '0.75rem', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                Read Our Story
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
