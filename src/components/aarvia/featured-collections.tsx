import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { categoryService, type Category } from "@/services/categoryService"

const FALLBACK_COLLECTIONS = [
  { name: "Herbal Floor Cleaner", sub: "Neem & Lemongrass Inspired", href: "/shop", color: "#1F4D3A" },
  { name: "Dishwashing Liquid", sub: "Lemon Fresh", href: "/shop", color: "#2A5C45" },
  { name: "Hand Wash", sub: "Neem & Tulsi Inspired", href: "/shop", color: "#345E4A" },
  { name: "Laundry Liquid", sub: "Fresh Linen", href: "/shop", color: "#1B4432" },
]

function imgUrl(src: string | null | undefined) {
  return src ? (src.startsWith('/') && !src.startsWith('/api') ? `/api${src}` : src) : null
}

export function FeaturedCollections() {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    categoryService.getActive().then(data => {
      setCategories(data.filter(c => c.status === 'active').slice(0, 4))
    }).catch(() => {})
  }, [])

  const items = categories.length > 0
    ? categories.map((c, i) => ({
        name: c.name,
        sub: 'Explore Collection',
        href: `/shop?category=${c.slug}`,
        image: imgUrl(c.image),
        color: FALLBACK_COLLECTIONS[i % FALLBACK_COLLECTIONS.length].color,
      }))
    : FALLBACK_COLLECTIONS.map(c => ({ ...c, image: null }))

  return (
    <section className="py-24 lg:py-32 px-6 lg:px-8" style={{ background: '#F7F4ED' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between mb-14">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5 }}
              className="text-[11px] font-bold tracking-[0.26em] uppercase mb-3"
              style={{ color: '#C8A96B' }}>
              Home Wellness
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.05 }}
              className="text-4xl md:text-5xl leading-tight"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, color: '#1F4D3A' }}>
              Home Wellness for<br />
              <span style={{ color: '#C8A96B', fontStyle: 'italic' }}>Everyday Living</span>
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
            <Link to="/shop"
              className="hidden md:flex items-center gap-2 text-[11px] font-semibold tracking-widest uppercase transition-all hover:gap-3"
              style={{ color: '#1F4D3A' }}>
              View All
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {items.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link to={item.href} className="group block relative overflow-hidden" style={{ aspectRatio: '3/4' }}>
                {/* Background */}
                {item.image ? (
                  <img src={item.image} alt={item.name}
                    className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <div className="absolute inset-0" style={{ background: `linear-gradient(145deg, ${item.color} 0%, rgba(0,0,0,0.3) 100%)` }}>
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(200,169,107,0.6) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                  </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 transition-opacity duration-500"
                  style={{ background: 'linear-gradient(0deg, rgba(10,28,20,0.75) 0%, rgba(10,28,20,0.15) 60%, transparent 100%)' }} />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-5 lg:p-6">
                  <p className="text-[10px] font-semibold tracking-widest uppercase mb-1.5"
                    style={{ color: 'rgba(200,169,107,0.8)' }}>{item.sub}</p>
                  <h3 className="text-xl lg:text-2xl font-semibold leading-tight mb-3"
                    style={{ fontFamily: "'Cormorant Garamond', serif", color: '#F7F4ED' }}>
                    {item.name}
                  </h3>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-400"
                    style={{ color: '#C8A96B' }}>
                    Explore <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
