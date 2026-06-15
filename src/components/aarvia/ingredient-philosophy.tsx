import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Leaf } from "lucide-react"

const INGREDIENTS = [
  {
    name: "Aloe Vera",
    tag: "Soothing & Hydrating",
    desc: "Cold-pressed from organically grown plants, our aloe vera extract delivers deep hydration and a natural soothing effect — calming redness and locking in moisture for hours.",
    benefit: "Hydrates · Soothes · Repairs",
    color: "#2D5E4A",
  },
  {
    name: "Botanical Extracts",
    tag: "Nourishing & Revitalising",
    desc: "A curated blend of plant-derived extracts — chamomile, green tea, and rosehip — that work synergistically to nourish at a cellular level and restore the skin's natural vitality.",
    benefit: "Nourishes · Brightens · Protects",
    color: "#3B6B52",
  },
  {
    name: "Essential Oils",
    tag: "Aromatherapy & Wellness",
    desc: "Steam-distilled from the finest botanical sources worldwide. Our essential oils carry the full therapeutic spectrum of the plant — nothing added, nothing removed.",
    benefit: "Balances · Revives · Calms",
    color: "#1E4535",
  },
  {
    name: "Natural Actives",
    tag: "Science-Backed Botanicals",
    desc: "Where nature meets precision. We select natural actives with demonstrated efficacy — hyaluronic acid from cassava, vitamin C from kakadu plum — ingredients that perform.",
    benefit: "Firms · Brightens · Renews",
    color: "#254D3A",
  },
]

export function IngredientPhilosophy() {
  const [active, setActive] = useState(0)

  return (
    <section className="py-24 lg:py-32" style={{ background: '#F7F4ED' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-xl mb-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="text-[11px] font-bold tracking-[0.26em] uppercase mb-3"
            style={{ color: '#C8A96B' }}>
            Ingredient Philosophy
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: 0.06, duration: 0.6 }}
            className="text-4xl md:text-5xl leading-tight"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, color: '#1F4D3A' }}>
            What Goes In<br />
            <span style={{ color: '#C8A96B', fontStyle: 'italic' }}>Matters</span>
          </motion.h2>
        </div>

        {/* Interactive accordion — desktop side-by-side, mobile stacked */}
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Left — ingredient list */}
          <div className="space-y-3">
            {INGREDIENTS.map((ing, i) => (
              <motion.div
                key={ing.name}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
              >
                <button
                  className="w-full text-left p-5 transition-all duration-400 border-l-2"
                  style={{
                    background: active === i ? 'rgba(31,77,58,0.05)' : 'transparent',
                    borderLeftColor: active === i ? '#C8A96B' : 'transparent',
                  }}
                  onClick={() => setActive(i)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: active === i ? '#1F4D3A' : 'rgba(31,77,58,0.08)', border: `1px solid ${active === i ? 'transparent' : 'rgba(200,169,107,0.15)'}` }}>
                        <Leaf className="w-3.5 h-3.5" style={{ color: active === i ? '#C8A96B' : '#1F4D3A' }} />
                      </div>
                      <div>
                        <p className="font-semibold leading-none" style={{ color: active === i ? '#1F4D3A' : '#2C2C2C', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.125rem' }}>
                          {ing.name}
                        </p>
                        <p className="text-[11px] mt-0.5" style={{ color: '#9A9A8F' }}>{ing.tag}</p>
                      </div>
                    </div>
                    <Plus className="w-4 h-4 transition-transform duration-300 shrink-0"
                      style={{ color: '#C8A96B', transform: active === i ? 'rotate(45deg)' : 'none' }} />
                  </div>
                  <AnimatePresence>
                    {active === i && (
                      <motion.p
                        initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35 }}
                        className="mt-4 overflow-hidden"
                        style={{ color: 'rgba(31,77,58,0.7)', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.875rem', lineHeight: 1.7 }}>
                        {ing.desc}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </button>
              </motion.div>
            ))}
          </div>

          {/* Right — visual highlight */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="sticky top-28 hidden lg:block"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.5 }}
                className="relative overflow-hidden"
                style={{ aspectRatio: '4/5', background: `linear-gradient(145deg, ${INGREDIENTS[active].color} 0%, rgba(0,0,0,0.2) 100%)` }}
              >
                <div className="absolute inset-0 opacity-[0.06]"
                  style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(247,244,237,0.8) 1px, transparent 0)', backgroundSize: '22px 22px' }} />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
                  <motion.div animate={{ y: [-8, 8, -8] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-20 h-20 rounded-full flex items-center justify-center mb-8"
                    style={{ background: 'rgba(200,169,107,0.12)', border: '1px solid rgba(200,169,107,0.3)' }}>
                    <Leaf className="w-10 h-10" style={{ color: '#C8A96B' }} />
                  </motion.div>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.5rem', fontWeight: 600, color: '#F7F4ED', lineHeight: 1.1 }}>
                    {INGREDIENTS[active].name}
                  </p>
                  <div className="w-10 h-px my-5" style={{ background: 'rgba(200,169,107,0.5)' }} />
                  <p className="text-[11px] font-semibold tracking-widest uppercase" style={{ color: '#C8A96B' }}>
                    {INGREDIENTS[active].benefit}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
