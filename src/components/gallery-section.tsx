import { motion } from "framer-motion"
import { useSettings } from "@/context/settings-context"
import { Instagram, ExternalLink } from "lucide-react"
import { Image } from "@/components/ui/image"

const galleryImages = [
  { src: "/images/fashion-gallery-1.jpg", alt: "King Collection street style", span: "col-span-1 row-span-2" },
  { src: "/images/fashion-gallery-2.jpg", alt: "Queen Collection editorial", span: "col-span-1 row-span-1" },
  { src: "/images/fashion-gallery-3.jpg", alt: "Couple in KoffeeKup streetwear", span: "col-span-1 row-span-1" },
  { src: "/images/collection-king.jpg",   alt: "King Collection lookbook",   span: "col-span-1 row-span-1" },
  { src: "/images/collection-queen.jpg",  alt: "Queen Collection lookbook",  span: "col-span-1 row-span-2" },
  { src: "/images/collection-essentials.jpg", alt: "KoffeeKup Essentials look",  span: "col-span-1 row-span-1" },
]

export function GallerySection() {
  const { settings } = useSettings()
  const instagramUrl = settings.social_instagram || "https://www.instagram.com/"

  return (
    <section id="gallery" className="py-10 px-4" style={{ background: 'var(--surface-page)' }}>
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <span className="section-badge mb-4 inline-flex items-center gap-2">
            {/* <Instagram className="w-3.5 h-3.5" /> */}
            Style Gallery
          </span>
          <h2 className="font-heading text-4xl md:text-5xl font-black mt-3" style={{ color: 'var(--text-primary)' }}>
            Wear the{" "}
            <span style={{
              background: 'linear-gradient(135deg, #F0D060 0%, #D4AF37 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>Kingdom</span>
          </h2>
          <div className="w-20 h-0.5 mx-auto mt-5" style={{ background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)' }} />
        </motion.div>

        {/* Masonry Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 auto-rows-[220px] gap-4">
          {galleryImages.map((image, index) => (
            <motion.div
              key={image.src}
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className={`group relative rounded-2xl overflow-hidden cursor-pointer ${image.span}`}
              style={{
                border: '1px solid rgba(212,175,55,0.08)',
              }}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
              {/* Gradient on hover */}
              <div className="absolute inset-0 transition-opacity duration-400 opacity-0 group-hover:opacity-100"
                style={{ background: 'linear-gradient(to top, rgba(13,13,13,0.8) 0%, rgba(212,175,55,0.06) 50%, transparent 100%)' }} />

              {/* Border glow on hover */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                style={{ border: '1.5px solid rgba(212,175,55,0.40)' }} />

              {/* Instagram icon on hover */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-400">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #D4AF37, #B8960A)', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
                  <Instagram className="w-5 h-5" style={{ color: '#0D0D0D' }} />
                </motion.div>
              </div>

              {/* Alt text overlay at bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-400">
                <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(245,240,232,0.75)' }}>{image.alt}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12"
        >
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm uppercase tracking-wider transition-all duration-300 group hover:-translate-y-1"
            style={{
              background: 'linear-gradient(135deg, rgba(212,175,55,0.10), rgba(212,175,55,0.05))',
              border: '1px solid rgba(212,175,55,0.30)',
              color: 'var(--theme-color)',
            }}
          >
            {/* <Instagram className="w-4 h-4" /> */}
            Follow Our Style
            <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
