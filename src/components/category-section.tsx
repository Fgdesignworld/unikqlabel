

import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from "framer-motion"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import { Image } from "@/components/ui/image"

const categories = [
  {
    name: "Traditional Snacks",
    image: "/images/snacks.jpg",
    description: "Crispy & Delicious",
    href: "/snacks",
  },
  {
    name: "Veg Pickles",
    image: "/images/pickles.jpg",
    description: "Tangy & Spicy",
    href: "/pickles",
  },
  {
    name: "Homemade Sweets",
    image: "/images/sweets.jpg",
    description: "Pure & Authentic",
    href: "/products?category=sweets",
  },
  {
    name: "Spice Powders",
    image: "/images/spices.jpg",
    description: "Fresh & Aromatic",
    href: "/spices",
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
    <section id="categories" className="py-20 px-4 bg-gradient-to-b from-[#0f0f0f] to-[#1a1410]">
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-[#d97706] text-sm font-medium tracking-wider uppercase">Our Products</span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#fef3e2] mt-2">
              Explore Categories
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#d97706] to-transparent mt-4" />
          </motion.div>

          {/* Scroll Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => scroll('left')}
              className="p-3 rounded-full border border-[#d97706]/20 bg-[#1a1410] text-[#d97706] hover:bg-[#d97706] hover:text-[#0f0f0f] transition-all duration-300"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-3 rounded-full border border-[#d97706]/20 bg-[#1a1410] text-[#d97706] hover:bg-[#d97706] hover:text-[#0f0f0f] transition-all duration-300"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Categories Scroll Container */}
        <div 
          ref={scrollRef}
          className="flex overflow-x-auto pb-8 lg:pb-0 gap-6 scrollbar-hide snap-x snap-mandatory -mx-4 px-4 lg:mx-0 lg:px-0"
        >
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="flex-shrink-0 w-[260px] sm:w-[300px] lg:w-[calc(25%-18px)] snap-start"
            >
              <Link
                to={category.href}
                className="group relative block overflow-hidden rounded-2xl glass h-full"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/40 to-transparent" />
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-[#f59e0b] text-[10px] uppercase tracking-wider mb-1 opacity-80">{category.description}</p>
                  <h4 className="font-serif text-lg font-bold text-[#fef3e2] mb-3">
                    {category.name}
                  </h4>
                  <span className="flex items-center gap-2 text-[#d97706] text-sm font-medium group-hover:gap-3 transition-all duration-300">
                    View
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>

                {/* Hover Border */}
                <div className="absolute inset-0 rounded-2xl border-2 border-[#d97706]/0 group-hover:border-[#d97706]/50 transition-all duration-300" />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Mobile Indicator (Peeking through scroll buttons) */}
        <div className="flex md:hidden items-center justify-center gap-4 mt-0">
          <button
            onClick={() => scroll('left')}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-[#d97706]/20 bg-[#1a1410] text-[#d97706]"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-1.5">
            {categories.map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#d97706]/30" />
            ))}
          </div>
          <button
            onClick={() => scroll('right')}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-[#d97706]/20 bg-[#1a1410] text-[#d97706]"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  )
}
