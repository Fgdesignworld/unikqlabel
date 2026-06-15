import { motion } from "framer-motion"
import { ArrowRight, Sparkles, Check } from "lucide-react"
import { Link } from "react-router-dom"

const BENEFITS = [
  "Cleanses gently without stripping natural lipids",
  "Infused with rosemary and ginger to stimulate hair growth",
  "Free from synthetics, silicones, and sulfates",
  "Restores silkiness and controls frizz naturally",
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
            className="relative overflow-hidden aspect-[4/3] lg:order-1 border"
            style={{ borderColor: "rgba(200,169,107,0.3)" }}
          >
            <img
              src="https://images.unsplash.com/photo-1527799822367-a2505d993e51?q=80&w=600&auto=format&fit=crop"
              alt="Premium Hair Care Solution"
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1F4D3A]/50 to-transparent pointer-events-none" />
          </motion.div>

          {/* Right - text content */}
          <div className="lg:order-2">
            <span className="text-[11px] font-bold tracking-[0.26em] uppercase mb-4 block" style={{ color: "#C8A96B" }}>
              Botanical Restoration
            </span>
            <h2
              className="text-4xl md:text-5xl font-serif font-normal mb-6 leading-tight"
              style={{ color: "#F7F4ED" }}
            >
              Hair Care Solutions<br />
              <span className="italic" style={{ color: "#C8A96B" }}>Crafted for Vitality</span>
            </h2>
            <p
              className="text-base leading-relaxed mb-8"
              style={{ color: "rgba(247,244,237,0.7)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Nourish your hair from root to tip. Our active botanical shampoos and scalp oils are designed to work in harmony with your body, stimulating follicles and restoring natural strength.
            </p>

            {/* List */}
            <div className="space-y-3 mb-10">
              {BENEFITS.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(200,169,107,0.15)" }}>
                    <Check className="w-3.5 h-3.5" style={{ color: "#C8A96B" }} />
                  </div>
                  <span className="text-sm font-light text-[#F7F4ED]">{item}</span>
                </div>
              ))}
            </div>

            <Link
              to="/hair-care"
              className="inline-flex items-center gap-2.5 font-semibold tracking-wider transition-all hover:gap-4"
              style={{ color: "#C8A96B", fontSize: "0.75rem", letterSpacing: "0.14em", textTransform: "uppercase" }}
            >
              Shop Hair Solutions <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
