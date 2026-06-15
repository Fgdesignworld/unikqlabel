import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react"

const TESTIMONIALS = [
  {
    name: "Priya S.",
    location: "Mumbai, India",
    rating: 5,
    text: "I've tried countless natural hair care products and nothing compares to Aarvia. My hair is visibly stronger and the fragrance is just divine. This is luxury that actually delivers.",
    product: "Hair Nourishment Oil",
  },
  {
    name: "Sarah M.",
    location: "Sydney, Australia",
    rating: 5,
    text: "Finally a natural brand that doesn't compromise on performance. The botanical ingredients are genuinely effective and you can tell the formulations are thoughtfully crafted. A staple in my daily ritual.",
    product: "Botanical Body Butter",
  },
  {
    name: "Amara K.",
    location: "Dubai, UAE",
    rating: 5,
    text: "Aarvia has redefined what premium natural wellness means to me. The packaging is beautiful, the products smell incredible, and most importantly — they work. Worth every rupee.",
    product: "Essential Oil Serum",
  },
]

export function TestimonialsSection() {
  const [current, setCurrent] = useState(0)
  const prev = () => setCurrent(i => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)
  const next = () => setCurrent(i => (i + 1) % TESTIMONIALS.length)

  const t = TESTIMONIALS[current]

  return (
    <section className="py-24 lg:py-32 overflow-hidden" style={{ background: '#1F4D3A' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="text-[11px] font-bold tracking-[0.26em] uppercase mb-3"
            style={{ color: '#C8A96B' }}>
            Community Stories
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: 0.06, duration: 0.6 }}
            className="text-4xl md:text-5xl"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, color: '#F7F4ED' }}>
            Loved by Those<br />
            <span style={{ color: '#C8A96B', fontStyle: 'italic' }}>Who Choose Better</span>
          </motion.h2>
        </div>

        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="text-center"
            >
              <Quote className="w-8 h-8 mx-auto mb-8" style={{ color: 'rgba(200,169,107,0.4)' }} />
              <p className="text-xl md:text-2xl leading-relaxed mb-10"
                style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, color: 'rgba(247,244,237,0.88)', fontStyle: 'italic' }}>
                "{t.text}"
              </p>

              <div className="flex items-center justify-center gap-1 mb-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4" style={{ color: '#C8A96B', fill: '#C8A96B' }} />
                ))}
              </div>

              <p className="font-semibold mb-1" style={{ color: '#F7F4ED', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.125rem' }}>{t.name}</p>
              <p className="text-[11px] tracking-wider" style={{ color: 'rgba(247,244,237,0.4)' }}>{t.location} · {t.product}</p>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-center gap-6 mt-12">
            <button onClick={prev}
              className="w-10 h-10 rounded-full flex items-center justify-center border transition-all hover:scale-105 active:scale-95"
              style={{ background: 'rgba(247,244,237,0.06)', border: '1px solid rgba(247,244,237,0.15)', color: '#F7F4ED' }}>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)}
                  className="h-0.5 rounded-full transition-all duration-400 cursor-pointer"
                  style={{ width: i === current ? '28px' : '6px', background: i === current ? '#C8A96B' : 'rgba(247,244,237,0.2)' }} />
              ))}
            </div>
            <button onClick={next}
              className="w-10 h-10 rounded-full flex items-center justify-center border transition-all hover:scale-105 active:scale-95"
              style={{ background: 'rgba(247,244,237,0.06)', border: '1px solid rgba(247,244,237,0.15)', color: '#F7F4ED' }}>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
