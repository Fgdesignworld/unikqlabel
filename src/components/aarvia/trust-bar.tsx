import { motion } from "framer-motion"
import { Leaf, Recycle, FlaskConical, Heart, Star } from "lucide-react"

const TRUST_ITEMS = [
  { icon: Leaf, label: "100% Natural", sub: "Pure botanical actives" },
  { icon: Heart, label: "Cruelty Free", sub: "Ethically formulated" },
  { icon: Recycle, label: "Sustainable", sub: "Eco-conscious packaging" },
  { icon: Star, label: "Australian Inspired", sub: "Premium formulations" },
  { icon: FlaskConical, label: "Dermatologist Tested", sub: "Clinically validated" },
]

export function TrustBar() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ background: '#1F4D3A', borderTop: '1px solid rgba(200,169,107,0.15)', borderBottom: '1px solid rgba(200,169,107,0.15)' }}
    >
      {/* Subtle diagonal line pattern */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{ backgroundImage: 'repeating-linear-gradient(45deg, rgba(200,169,107,0.8) 0, rgba(200,169,107,0.8) 1px, transparent 0, transparent 50%)', backgroundSize: '12px 12px' }} />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5">
        <div className="flex items-center justify-between gap-4 overflow-x-auto scrollbar-hide">
          {TRUST_ITEMS.map((item, i) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="flex items-center gap-3 shrink-0"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(200,169,107,0.12)', border: '1px solid rgba(200,169,107,0.25)' }}>
                  <Icon className="w-3.5 h-3.5" style={{ color: '#C8A96B' }} />
                </div>
                <div>
                  <p className="text-[11px] font-semibold tracking-wider uppercase leading-none"
                    style={{ color: '#F7F4ED' }}>{item.label}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'rgba(247,244,237,0.45)' }}>{item.sub}</p>
                </div>
                {i < TRUST_ITEMS.length - 1 && (
                  <div className="w-px h-6 mx-2 shrink-0 hidden sm:block" style={{ background: 'rgba(200,169,107,0.15)' }} />
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
