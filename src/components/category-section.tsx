import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from "framer-motion"
import { ArrowRight, ChevronLeft, ChevronRight, Crown } from "lucide-react"
import { Image } from "@/components/ui/image"

const collections = [
  {
    name: "King Collection",
    subtitle: "Men's Line",
    image: "/images/collection-king.jpg",
    description: "Bold streetwear for the kings",
    href: "/snacks",
    tag: "Exclusively His",
  },
  {
    name: "Queen Collection",
    subtitle: "Women's Line",
    image: "/images/collection-queen.jpg",
    description: "Elegant power for the queens",
    href: "/pickles",
    tag: "Exclusively Hers",
  },
  {
    name: "UniKQ Essentials",
    subtitle: "Unisex Line",
    image: "/images/collection-essentials.jpg",
    description: "Rule together, dress together",
    href: "/spices",
    tag: "Unisex",
  },
]

export function CategorySection() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <section id="collections" className="py-5 px-4" style={{ background: 'linear-gradient(180deg, #0D0D0D 0%, #111110 100%)' }}>
      <div className="container mx-auto max-w-7xl">

        {/* Section Header */}
        <div className="flex items-end justify-between mb-14">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="section-badge mb-4 block w-fit">Our World</span>
            <h2 className="font-heading text-4xl md:text-5xl font-black leading-tight" style={{ color: '#F5F0E8' }}>
              Shop by{" "}
              <span style={{
                background: 'linear-gradient(135deg, color-mix(in srgb, var(--theme-color) 90%, white) 0%, var(--theme-color) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Collection
              </span>
            </h2>
            <div className="w-20 h-0.5 mt-4" style={{ background: 'linear-gradient(90deg, var(--theme-color), transparent)' }} />
          </motion.div>

          {/* Scroll Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button onClick={() => scroll('left')}
              className="p-2.5 rounded-full border transition-all duration-300 hover:scale-105"
              style={{ borderColor: 'rgba(212,175,55,0.25)', background: 'rgba(212,175,55,0.05)', color: 'var(--theme-color)' }}
              aria-label="Scroll left">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => scroll('right')}
              className="p-2.5 rounded-full border transition-all duration-300 hover:scale-105"
              style={{ borderColor: 'rgba(212,175,55,0.25)', background: 'rgba(212,175,55,0.05)', color: 'var(--theme-color)' }}
              aria-label="Scroll right">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Collections Row */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto pb-6 lg:pb-0 gap-6 scrollbar-hide snap-x snap-mandatory -mx-4 px-4 lg:mx-0 lg:px-0 lg:grid lg:grid-cols-3"
        >
          {collections.map((col, index) => (
            <motion.div
              key={col.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: index * 0.15 }}
              className="flex-shrink-0 w-[78vw] sm:w-[55vw] lg:w-auto snap-start"
            >
              <Link
                to={col.href}
                className="group relative block overflow-hidden rounded-2xl h-[420px] md:h-[500px]"
                style={{
                  border: '1px solid rgba(212,175,55,0.08)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                }}
              >
                {/* Background Image */}
                <Image
                  src={col.image}
                  alt={col.name}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 transition-opacity duration-500"
                  style={{ background: 'linear-gradient(to top, rgba(13,13,13,0.95) 0%, rgba(13,13,13,0.5) 50%, rgba(13,13,13,0.1) 100%)' }} />

                {/* Hover glow overlay */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: 'radial-gradient(ellipse at center bottom, rgba(212,175,55,0.15) 0%, transparent 70%)' }} />

                {/* Border glow on hover */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ border: '1.5px solid rgba(212,175,55,0.45)', boxShadow: 'inset 0 0 60px rgba(212,175,55,0.05)' }} />

                {/* Tag top */}
                <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)', backdropFilter: 'blur(8px)' }}>
                  <Crown size={10} className="text-amber-500" />
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-amber-500">{col.tag}</span>
                </div>

                {/* Content Bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="text-xs uppercase tracking-widest mb-1 font-medium" style={{ color: 'rgba(212,175,55,0.7)' }}>{col.subtitle}</p>
                  <h3 className="font-heading text-2xl font-bold mb-2" style={{ color: '#F5F0E8' }}>{col.name}</h3>
                  <p className="text-sm mb-4" style={{ color: 'rgba(245,240,232,0.55)' }}>{col.description}</p>
                  <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider transition-all duration-300 group-hover:gap-3"
                    style={{ color: 'var(--theme-color)' }}>
                    Shop Now
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Mobile scroll indicators */}
        <div className="flex md:hidden items-center justify-center gap-3 mt-6">
          <button onClick={() => scroll('left')}
            className="w-9 h-9 flex items-center justify-center rounded-full border"
            style={{ borderColor: 'rgba(212,175,55,0.2)', color: 'var(--theme-color)' }}>
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex gap-1.5">
            {collections.map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(212,175,55,0.3)' }} />
            ))}
          </div>
          <button onClick={() => scroll('right')}
            className="w-9 h-9 flex items-center justify-center rounded-full border"
            style={{ borderColor: 'rgba(212,175,55,0.2)', color: 'var(--theme-color)' }}>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  )
}
