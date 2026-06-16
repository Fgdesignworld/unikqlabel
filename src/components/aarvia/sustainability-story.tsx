import { motion } from "framer-motion"
import { ArrowRight, Globe, Recycle, Leaf } from "lucide-react"
import { Link } from "react-router-dom"

export function SustainabilityStory() {
  return (
    <section className="py-24" style={{ background: "#F7F4ED", borderTop: "1px solid rgba(200,169,107,0.12)" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - text content */}
          <div>
            <span className="text-[11px] font-bold tracking-[0.26em] uppercase mb-4 block" style={{ color: "#C8A96B" }}>
              Circular Commitment
            </span>
            <h2
              className="text-4xl md:text-5xl font-serif font-normal mb-6 leading-tight"
              style={{ color: "#1F4D3A" }}
            >
              Caring for Your Home,<br />
              <span className="italic" style={{ color: "#C8A96B" }}>Respecting Our Earth</span>
            </h2>
            <p
              className="text-base leading-relaxed mb-8"
              style={{ color: "#6A6A60", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              At AARVIA, we believe everyday home wellness shouldn't cost the planet. Every decision — from sourcing organic, plant-powered cleaning extracts to utilizing recyclable packaging — is designed to support cleaner homes and healthier spaces.
            </p>

            {/* List */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
              {[
                { icon: Leaf, title: "100% Vegan", desc: "Pure plant actives" },
                { icon: Recycle, title: "Zero Waste", desc: "Glass packaging" },
                { icon: Globe, title: "Carbon Neutral", desc: "Offset supply chain" },
              ].map((item, idx) => (
                <div key={idx} className="p-4" style={{ background: "rgba(31,77,58,0.03)", border: "1px solid rgba(200,169,107,0.12)" }}>
                  <item.icon className="w-5 h-5 mb-3" style={{ color: "#1F4D3A" }} />
                  <h4 className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#1F4D3A" }}>{item.title}</h4>
                  <p className="text-[10px]" style={{ color: "#9A9A8F" }}>{item.desc}</p>
                </div>
              ))}
            </div>

            <Link
              to="/sustainability"
              className="inline-flex items-center gap-2.5 font-semibold tracking-wider transition-all hover:gap-4"
              style={{ color: "#1F4D3A", fontSize: "0.75rem", letterSpacing: "0.14em", textTransform: "uppercase" }}
            >
              Explore Our Commitments <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Right - image block */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden aspect-[4/3] border border-slate-200"
            style={{ borderColor: "rgba(200,169,107,0.15)" }}
          >
            <img
              src="https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=600&auto=format&fit=crop"
              alt="Regenerative Organic Sourcing"
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1F4D3A]/20 to-transparent pointer-events-none" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
