import { motion } from "framer-motion"
import { ArrowRight, Check, Package } from "lucide-react"
import { Link } from "react-router-dom"

const KIT_ITEMS = [
  "Herbal Floor Cleaner (Neem & Lemongrass Inspired)",
  "Lemon Fresh Dishwashing Liquid (1 Litre)",
  "Neem & Tulsi Hand Wash (500 ml)",
  "Fresh Linen Laundry Liquid (1 Litre)",
  "Citrus Fresh Multi-Purpose Cleaner (500 ml)",
]

export function SolutionsHair() {
  return (
    <section className="py-24" style={{ background: "#1F4D3A" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - image block */}
          <motion.div
            initial={{ opacity: 0, x: -45 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden aspect-[4/3] border rounded-3xl shadow-xl"
            style={{ borderColor: "rgba(200,169,107,0.3)" }}
          >
            <img
              src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=800&auto=format&fit=crop"
              alt="Home Wellness Starter Kit"
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1F4D3A]/60 to-transparent pointer-events-none" />
            <div className="absolute top-4 left-4 px-3 py-1 text-[10px] font-bold tracking-widest uppercase rounded-full"
              style={{ background: "#C8A96B", color: "#1F4D3A" }}>
              Home wellness essentials
            </div>
          </motion.div>

          {/* Right - text content */}
          <div>
            <span className="text-[11px] font-bold tracking-[0.26em] uppercase mb-4 block" style={{ color: "#C8A96B" }}>
              Aarvia™ Collections
            </span>
            <h2
              className="text-4xl md:text-5xl font-serif font-normal mb-6 leading-tight flex items-center gap-3"
              style={{ color: "#FDFBF7" }}
            >
              Home Wellness<br />
              <span className="italic" style={{ color: "#C8A96B" }}>Starter Kit</span>
            </h2>
            <p
              className="text-base leading-relaxed mb-8"
              style={{ color: "rgba(253,251,247,0.7)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              A complete collection thoughtfully crafted for everyday home care. Supports cleaner homes, fresher spaces, and better living naturally.
            </p>

            {/* List */}
            <div className="space-y-3 mb-10">
              {KIT_ITEMS.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 animate-pulse" style={{ background: "rgba(200,169,107,0.2)" }}>
                    <Check className="w-3 h-3" style={{ color: "#C8A96B" }} />
                  </div>
                  <span className="text-sm font-light text-[#FDFBF7]">{item}</span>
                </div>
              ))}
            </div>

            <Link
              to="/shop"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full font-semibold tracking-wider transition-all hover:gap-4 hover:shadow-lg cursor-pointer"
              style={{ background: "#C8A96B", color: "#1F4D3A", fontSize: "0.75rem", letterSpacing: "0.14em", textTransform: "uppercase" }}
            >
              Shop Collection <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
