import { motion } from "framer-motion"
import { Instagram } from "lucide-react"

const GALLERY = [
  "https://images.unsplash.com/photo-1527799822367-a2505d993e51?q=80&w=300&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=300&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?q=80&w=300&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=300&auto=format&fit=crop",
]

export function InstagramGallery() {
  return (
    <section className="py-24" style={{ background: "#F7F4ED", borderTop: "1px solid rgba(200,169,107,0.12)" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col items-center mb-16 text-center">
          <Instagram className="w-6 h-6 text-[#C8A96B] mb-3" />
          <span className="text-[11px] font-bold tracking-[0.26em] uppercase mb-2" style={{ color: "#C8A96B" }}>
            Follow Our Ritual
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-normal text-[#1F4D3A]">
            @AarviaWellness
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {GALLERY.map((imgUrl, idx) => (
            <motion.a
              key={idx}
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08, duration: 0.5 }}
              className="relative aspect-square overflow-hidden border border-slate-200 group block"
            >
              <img
                src={imgUrl}
                alt="Aarvia Wellness Ritual"
                className="w-full h-full object-cover transition-transform duration-750 group-hover:scale-105 group-hover:brightness-90"
              />
              <div className="absolute inset-0 bg-[#1F4D3A]/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <Instagram className="w-6 h-6 text-white" />
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  )
}
