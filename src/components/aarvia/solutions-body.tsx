import { motion } from "framer-motion"
import { ArrowRight, Sparkles, Check } from "lucide-react"
import { Link } from "react-router-dom"

const BENEFITS = [
  "Formulated with cold-pressed botanical oils",
  "Infuses skin with essential lipids and vitamins",
  "Free from synthetics, artificial colors, and microplastics",
  "Deeply hydrates and restores skin cell elasticity",
]

export function SolutionsBody() {
  return (
    <section className="py-24" style={{ background: "#F7F4ED", borderTop: "1px solid rgba(200,169,107,0.12)" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - text content */}
          <div>
            <span className="text-[11px] font-bold tracking-[0.26em] uppercase mb-4 block" style={{ color: "#C8A96B" }}>
              Nourishing Body Rituals
            </span>
            <h2
              className="text-4xl md:text-5xl font-serif font-normal mb-6 leading-tight"
              style={{ color: "#1F4D3A" }}
            >
              Body Care Solutions<br />
              <span className="italic" style={{ color: "#C8A96B" }}>For Skin Restoration</span>
            </h2>
            <p
              className="text-base leading-relaxed mb-8"
              style={{ color: "#6A6A60", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Experience the ritual of complete body nourishment. Our cold-pressed botanical body washes, exfoliating scrubs, and botanical body oils work together to restore hydration and soften the skin.
            </p>

            {/* List */}
            <div className="space-y-3 mb-10">
              {BENEFITS.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(31,77,58,0.06)" }}>
                    <Check className="w-3.5 h-3.5" style={{ color: "#1F4D3A" }} />
                  </div>
                  <span className="text-sm font-light text-[#6A6A60]">{item}</span>
                </div>
              ))}
            </div>

            <Link
              to="/body-care"
              className="inline-flex items-center gap-2.5 font-semibold tracking-wider transition-all hover:gap-4"
              style={{ color: "#1F4D3A", fontSize: "0.75rem", letterSpacing: "0.14em", textTransform: "uppercase" }}
            >
              Shop Body Solutions <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Right - image block */}
          <motion.div
            initial={{ opacity: 0, x: 45 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden aspect-[4/3] border"
            style={{ borderColor: "rgba(200,169,107,0.15)" }}
          >
            <img
              src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=600&auto=format&fit=crop"
              alt="Premium Body Care Solution"
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1F4D3A]/20 to-transparent pointer-events-none" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
