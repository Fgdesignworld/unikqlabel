import { useState, useEffect } from "react"
import { motion } from "framer-motion"
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
  {
    name: "Rohan D.",
    location: "New Delhi, India",
    rating: 5,
    text: "The difference in my hair texture is remarkable. It feels hydrated, thick, and has this natural radiance that I haven't seen in years. Truly a masterpiece of traditional wellness.",
    product: "Botanical Glow Elixir",
  },
  {
    name: "Elena R.",
    location: "New York, USA",
    rating: 5,
    text: "Finding a plant-based formulation that actually lathers and leaves my hair feeling clean but not stripped was impossible until Aarvia. My scalp feels so calm and refreshed!",
    product: "Soothing Herb Shampoo",
  },
]

export function TestimonialsSection() {
  const [current, setCurrent] = useState(0)
  const [windowWidth, setWindowWidth] = useState(1024)

  useEffect(() => {
    if (typeof window !== "undefined") {
      setWindowWidth(window.innerWidth)
      const handleResize = () => setWindowWidth(window.innerWidth)
      window.addEventListener("resize", handleResize)
      return () => window.removeEventListener("resize", handleResize)
    }
  }, [])

  const isMobile = windowWidth < 768
  const cardWidth = isMobile ? 300 : 440
  const gap = isMobile ? -40 : 20
  const offsetDistance = cardWidth + gap

  const prev = () => setCurrent(i => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)
  const next = () => setCurrent(i => (i + 1) % TESTIMONIALS.length)

  const getOffset = (index: number) => {
    let diff = index - current
    const len = TESTIMONIALS.length
    if (diff < -len / 2) diff += len
    if (diff > len / 2) diff -= len
    return diff
  }

  return (
    <section className="relative py-12 md:py-16 overflow-hidden select-none" style={{ background: '#FDFBF7' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center mb-8">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-[11px] font-bold tracking-[0.26em] uppercase mb-2"
            style={{ color: '#C8A96B' }}>
            Community Stories
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.06, duration: 0.6 }}
            className="text-3xl md:text-4xl"
            style={{ fontWeight: 600, color: '#1F4D3A' }}>
            Loved by Those<br />
            <span style={{ color: '#C8A96B', fontStyle: 'italic' }}>Who Choose Better</span>
          </motion.h2>
        </div>

        {/* Carousel Container */}
        <div 
          className="relative w-full h-[360px] md:h-[300px] flex items-center justify-center overflow-visible"
          style={{ perspective: "1200px" }}
        >
          {TESTIMONIALS.map((t, i) => {
            const offset = getOffset(i)
            const isActive = offset === 0
            const isVisible = Math.abs(offset) <= 1

            return (
              <motion.div
                key={i}
                style={{
                  width: cardWidth,
                  position: "absolute",
                  zIndex: 10 - Math.abs(offset),
                  pointerEvents: isActive ? "auto" : isVisible ? "auto" : "none",
                  cursor: isActive ? "grab" : "pointer"
                }}
                animate={{
                  x: offset * offsetDistance,
                  scale: isActive ? 1 : 0.86,
                  opacity: isActive ? 1 : isVisible ? 0.55 : 0,
                  rotateY: isActive ? 0 : offset > 0 ? -12 : 12,
                }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 26,
                }}
                drag={isActive ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(e, info) => {
                  const threshold = 70
                  if (info.offset.x > threshold) {
                    prev()
                  } else if (info.offset.x < -threshold) {
                    next()
                  }
                }}
                onClick={() => {
                  if (!isActive && isVisible) {
                    setCurrent(i)
                  }
                }}
                className={`p-5 md:p-6 rounded-xl border bg-[#F9F6F0] shadow-lg flex flex-col justify-between h-[320px] md:h-[250px] transition-shadow duration-300 ${
                  isActive ? "shadow-xl border-[#C8A96B]/35" : "border-[#1F4D3A]/5 opacity-60"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    {/* Stars */}
                    <div className="flex gap-0.5">
                      {Array.from({ length: t.rating }).map((_, starIndex) => (
                        <Star key={starIndex} className="w-3.5 h-3.5 fill-[#C8A96B] text-[#C8A96B]" />
                      ))}
                    </div>
                    {/* Quote Icon */}
                    <Quote className="w-6 h-6 text-[#C8A96B]/20 transform rotate-180" />
                  </div>

                  {/* Review Text */}
                  <p 
                    className="text-[15px] md:text-[17px] leading-relaxed text-[#1F4D3A] line-clamp-5 md:line-clamp-4"
                  >
                    "{t.text}"
                  </p>
                </div>

                {/* Author Info */}
                <div className="flex items-center gap-3 border-t border-[#1F4D3A]/10 pt-3 mt-3">
                  {/* Circular Gradient Avatar */}
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-[#FDFBF7] shadow-inner shrink-0"
                    style={{
                      background: "linear-gradient(135deg, #1F4D3A 0%, #C8A96B 100%)"
                    }}
                  >
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <h4 
                      className="font-bold text-[#1F4D3A] text-sm md:text-[15px] leading-tight"
                    >
                      {t.name}
                    </h4>
                    <p className="text-[10px] text-[#555555] tracking-wide mt-0.5">
                      {t.location} · <span className="font-semibold text-[#C8A96B]">{t.product}</span>
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Carousel Navigation & Indicators */}
        <div className="flex flex-col items-center gap-4 mt-6 relative z-20">
          <div className="flex items-center gap-6">
            <button 
              onClick={prev}
              aria-label="Previous testimonial"
              className="w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer bg-white"
              style={{ border: '1px solid rgba(31,77,58,0.15)', color: '#1F4D3A' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#C8A96B'
                e.currentTarget.style.background = 'rgba(200,169,107,0.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(31,77,58,0.15)'
                e.currentTarget.style.background = '#FFFFFF'
              }}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Pagination Dots */}
            <div className="flex items-center gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className="h-1.5 rounded-full transition-all duration-300 cursor-pointer"
                  style={{
                    width: i === current ? '28px' : '7px',
                    background: i === current ? '#C8A96B' : 'rgba(31,77,58,0.15)'
                  }}
                />
              ))}
            </div>

            <button 
              onClick={next}
              aria-label="Next testimonial"
              className="w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer bg-white"
              style={{ border: '1px solid rgba(31,77,58,0.15)', color: '#1F4D3A' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#C8A96B'
                e.currentTarget.style.background = 'rgba(200,169,107,0.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(31,77,58,0.15)'
                e.currentTarget.style.background = '#FFFFFF'
              }}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
