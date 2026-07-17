import { motion } from "framer-motion"
import { Leaf, Recycle, ShieldCheck, Heart, Star, Sparkles } from "lucide-react"

const TRUST_ITEMS = [
  { icon: Leaf, label: "Nature Inspired" },
  { icon: ShieldCheck, label: "Family Safe" },
  { icon: Star, label: "Premium Quality" },
  { icon: Heart, label: "Cruelty Free" },
  { icon: Sparkles, label: "Thoughtfully Crafted" },
  { icon: Recycle, label: "Responsible Choices" },
]

export function TrustBar() {
  // Duplicate sets to ensure a seamless infinite marquee on all screen sizes
  const marqueeItems = [...TRUST_ITEMS, ...TRUST_ITEMS, ...TRUST_ITEMS, ...TRUST_ITEMS]

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: '#1F4D3A', borderTop: '1px solid rgba(200,169,107,0.2)', borderBottom: '1px solid rgba(200,169,107,0.2)' }}
    >
      {/* Subtle diagonal line pattern */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{ backgroundImage: 'repeating-linear-gradient(45deg, rgba(200,169,107,0.8) 0, rgba(200,169,107,0.8) 1px, transparent 0, transparent 50%)', backgroundSize: '12px 12px' }} />

      <div className="py-4 lg:py-5 flex items-center overflow-hidden">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ ease: "linear", duration: 70, repeat: Infinity }}
          className="flex items-center gap-12 sm:gap-20 px-6 w-max"
        >
          {marqueeItems.map((item, i) => {
            const Icon = item.icon
            return (
              <div key={i} className="flex items-center gap-3.5 shrink-0 group cursor-default">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-110"
                  style={{ background: 'rgba(200,169,107,0.12)', border: '1px solid rgba(200,169,107,0.3)' }}>
                  <Icon className="w-4 h-4" style={{ color: '#C8A96B' }} />
                </div>
                <div>
                  <p className="text-[11px] lg:text-xs font-bold tracking-[0.14em] uppercase leading-none"
                    style={{ color: '#FDFBF7' }}>{item.label}</p>
                </div>
              </div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
