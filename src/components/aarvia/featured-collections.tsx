import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { categoryService, type Category } from "@/services/categoryService"

const FALLBACK_COLLECTIONS = [
  { name: "Home Wellness", href: "/shop?category=home-wellness", color: "#1F4D3A" },
  { name: "Kitchen Care", href: "/shop?category=kitchen-care", color: "#2A5C45" },
  { name: "Laundry Care", href: "/shop?category=laundry-care", color: "#345E4A" },
  { name: "Home Fragrance", href: "/shop?category=home-fragrance", color: "#1B4432" },
  { name: "Personal Care", href: "/shop?category=personal-care", color: "#163a2a" },
]

function imgUrl(src: string | null | undefined) {
  return src ? (src.startsWith('/') && !src.startsWith('/api') ? `/api${src}` : src) : null
}

export function FeaturedCollections() {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    categoryService.getActive().then(data => {
      // Only main categories as requested
      setCategories(data.filter(c => c.status === 'active' && c.parent_id === null))
    }).catch(() => {})
  }, [])

  const items = categories.length > 0
    ? categories.map((c, i) => ({
        name: c.name,
        href: `/shop?category=${c.slug}`,
        image: imgUrl(c.image),
        color: FALLBACK_COLLECTIONS[i % FALLBACK_COLLECTIONS.length].color,
      }))
    : FALLBACK_COLLECTIONS.map(c => ({ ...c, image: null }))

  return (
    <section className="pt-12 lg:pt-16 pb-4" style={{ background: '#FFFFFF' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header - Hidden by user request */}

        {/* Circular List - Aligned Left */}
        <div className="flex overflow-x-auto pb-4 gap-6 md:gap-10 justify-start items-start no-scrollbar snap-x snap-mandatory pr-6">
          {items.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: 15 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.4, ease: "easeOut" }}
              className="flex-shrink-0 snap-start"
            >
              <Link to={item.href} className="flex flex-col items-center gap-3 group">
                <div className="w-[90px] h-[90px] md:w-[110px] md:h-[110px] rounded-full overflow-hidden border-[1.5px] bg-white shadow-sm transition-all duration-400 group-hover:scale-[1.04] group-hover:shadow-md"
                  style={{ borderColor: 'rgba(31,77,58,0.2)' }}>
                  {item.image ? (
                    <img src={item.image} alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full" style={{ background: item.color }} />
                  )}
                </div>
                <h3 className="text-[12px] md:text-sm font-medium text-center leading-snug max-w-[100px] md:max-w-[120px]"
                  style={{ color: '#10221A', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {item.name}
                </h3>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
