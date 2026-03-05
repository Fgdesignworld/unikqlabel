

import { ImgHTMLAttributes } from 'react';
const Image = (props: ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean, fill?: boolean, quality?: number }) => <img {...props} />;
import { motion } from "framer-motion"
import { Instagram } from "lucide-react"

const galleryImages = [
  { src: "/images/gallery-1.jpg", alt: "Homemade laddu sweets" },
  { src: "/images/gallery-2.jpg", alt: "Mango pickle" },
  { src: "/images/gallery-3.jpg", alt: "Murukku chakli snack" },
  { src: "/images/gallery-4.jpg", alt: "Spice powders variety" },
  { src: "/images/gallery-5.jpg", alt: "Bundhi snack" },
  { src: "/images/gallery-6.jpg", alt: "Tomato pickle" },
  { src: "/images/gallery-7.jpg", alt: "Traditional Indian sweets" },
  { src: "/images/gallery-8.jpg", alt: "Homemade premium pickles" },
]

export function GallerySection() {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-[#0f0f0f] to-[#1a1410]">
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-[#d97706] text-sm font-medium tracking-wider uppercase flex items-center justify-center gap-2">
            <Instagram className="w-4 h-4" />
            Food Gallery
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#fef3e2] mt-2">
            Taste the Tradition
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#d97706] to-transparent mx-auto mt-4" />
        </motion.div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {galleryImages.map((image, index) => (
            <motion.div
              key={image.src}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-[#0f0f0f]/0 group-hover:bg-[#0f0f0f]/40 transition-colors duration-300" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-12 h-12 rounded-full bg-[#d97706] flex items-center justify-center">
                  <Instagram className="w-6 h-6 text-[#0f0f0f]" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
