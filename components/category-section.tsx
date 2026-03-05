

import { ImgHTMLAttributes } from 'react';
const Image = (props: ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean, fill?: boolean, quality?: number }) => <img {...props} />;
import { Link } from 'react-router-dom';
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

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
  return (
    <section id="categories" className="py-20 px-4 bg-gradient-to-b from-[#0f0f0f] to-[#1a1410]">
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-[#d97706] text-sm font-medium tracking-wider uppercase">Our Products</span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#fef3e2] mt-2">
            Explore Categories
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#d97706] to-transparent mx-auto mt-4" />
        </motion.div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Link
                to={category.href}
                className="group relative block overflow-hidden rounded-2xl glass"
              >
                {/* Image */}
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/40 to-transparent" />
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="text-[#f59e0b] text-sm mb-1">{category.description}</p>
                  <h3 className="font-serif text-xl font-bold text-[#fef3e2] mb-4">
                    {category.name}
                  </h3>
                  <span className="flex items-center gap-2 text-[#d97706] font-medium group-hover:gap-3 transition-all duration-300">
                    View Products
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>

                {/* Hover Border */}
                <div className="absolute inset-0 rounded-2xl border-2 border-[#d97706]/0 group-hover:border-[#d97706]/50 transition-all duration-300" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
