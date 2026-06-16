import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Leaf } from "lucide-react"

const INGREDIENTS = [
  {
    name: "Neem Active",
    tag: "Purifying & Cleansing",
    desc: "A time-tested botanical powerhouse, Neem extract is celebrated for its natural purifying qualities, providing deep organic cleansing for floors and hand care.",
    benefit: "Cleanses · Purifies · Protects",
    color: "#2D5E4A",
    image: "/images/neem_leaves.png",
  },
  {
    name: "Lemongrass Oil",
    tag: "Refreshing & Uplifting",
    desc: "Pure steam-distilled lemongrass essential oil infuses your living spaces with a refreshing citrus aroma, bringing long-lasting natural freshness.",
    benefit: "Deodorizes · Refreshes · Uplifts",
    color: "#3B6B52",
    image: "/images/lemongrass.png",
  },
  {
    name: "Lemon Extract",
    tag: "Degreasing & Brightening",
    desc: "Rich in organic citric acid, our lemon extract provides powerful cutting action through tough kitchen grease, leaving your dishes sparkling clean.",
    benefit: "Cuts Grease · Cleans · Brightens",
    color: "#1E4535",
    image: "/images/lemon_extract.png",
  },
  {
    name: "Tulsi Extract",
    tag: "Soothes & Restores",
    desc: "Also known as Holy Basil, Tulsi is enriched with restorative compounds to soothe and shield your skin, keeping hands soft after every wash.",
    benefit: "Soothes · Conditions · Shields",
    color: "#254D3A",
    image: "/images/tulsi_leaves.png",
  },
]

export function IngredientPhilosophy() {
  const [active, setActive] = useState(0)

  return (
    <section className="py-20 lg:py-28" style={{ background: '#F7F4ED' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-xl mb-12 lg:mb-16">
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
            className="text-3xl md:text-4xl"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, color: '#1F4D3A' }}>
            What Goes In<br />
            <span style={{ color: '#C8A96B', fontStyle: 'italic' }}>Matters</span>
          </motion.h2>
        </div>

        {/* Interactive accordion — desktop side-by-side, mobile stacked */}
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left — ingredient list */}
          <div className="space-y-4">
            {INGREDIENTS.map((ing, i) => (
              <motion.div
                key={ing.name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="overflow-hidden rounded-xl border border-[#1F4D3A]/5 shadow-sm"
              >
                <button
                  className="w-full text-left p-5 transition-all duration-300 relative overflow-hidden"
                  style={{
                    background: active === i ? '#FDFDFB' : '#FAF8F4',
                    borderLeft: `3px solid ${active === i ? '#C8A96B' : 'transparent'}`
                  }}
                  onClick={() => setActive(i)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300"
                        style={{ 
                          background: active === i ? '#1F4D3A' : 'rgba(31,77,58,0.05)', 
                          border: `1px solid ${active === i ? 'transparent' : 'rgba(200,169,107,0.1)'}` 
                        }}>
                        <Leaf className="w-3.5 h-3.5" style={{ color: active === i ? '#C8A96B' : '#1F4D3A' }} />
                      </div>
                      <div>
                        <p className="font-bold leading-none" style={{ color: active === i ? '#1F4D3A' : '#4A5568', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem' }}>
                          {ing.name}
                        </p>
                        <p className="text-[10px] mt-1 text-[#6B6B6B] uppercase tracking-wider font-semibold">{ing.tag}</p>
                      </div>
                    </div>
                    <Plus className="w-4 h-4 transition-transform duration-300 shrink-0"
                      style={{ color: '#C8A96B', transform: active === i ? 'rotate(45deg)' : 'none' }} />
                  </div>

                  <AnimatePresence initial={false}>
                    {active === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0, marginTop: 0 }}
                        animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
                        exit={{ height: 0, opacity: 0, marginTop: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <p className="text-[13px] md:text-sm text-[#4A5568] leading-relaxed pr-2">
                          {ing.desc}
                        </p>
                        
                        {/* Inline Image for Mobile */}
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }} 
                          animate={{ opacity: 1, scale: 1 }} 
                          transition={{ delay: 0.1, duration: 0.3 }}
                          className="mt-4 relative rounded-xl overflow-hidden aspect-[16/10] lg:hidden border border-[#C8A96B]/15 shadow-inner"
                        >
                          <img 
                            src={ing.image} 
                            alt={ing.name} 
                            className="w-full h-full object-cover" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#1F4D3A]/90 via-[#1F4D3A]/30 to-transparent flex flex-col justify-end p-4">
                            <p className="text-[10px] font-bold tracking-widest uppercase text-[#C8A96B] mb-0.5">
                              Key Benefit
                            </p>
                            <p className="text-xs font-semibold text-[#F7F4ED] tracking-wide">
                              {ing.benefit}
                            </p>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </motion.div>
            ))}
          </div>

          {/* Right — visual highlight (sticky desktop) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="sticky top-28 hidden lg:block h-[500px]"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.45 }}
                className="relative h-full rounded-2xl overflow-hidden shadow-2xl border border-[#C8A96B]/20 group"
              >
                {/* Background Image */}
                <img 
                  src={INGREDIENTS[active].image} 
                  alt={INGREDIENTS[active].name} 
                  className="w-full h-full object-cover transition-transform duration-[6000ms] ease-out scale-100 group-hover:scale-105" 
                />

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

                {/* Floating Leaf Badge */}
                <div className="absolute top-6 right-6 w-11 h-11 rounded-full flex items-center justify-center bg-black/30 backdrop-blur-md border border-[#C8A96B]/25">
                  <Leaf className="w-5 h-5 text-[#C8A96B]" />
                </div>

                {/* Overlay Text Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-8 text-left">
                  <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#C8A96B] mb-2">
                    {INGREDIENTS[active].tag}
                  </p>
                  <h3 
                    className="text-3xl font-bold text-[#F7F4ED] leading-tight mb-3"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    {INGREDIENTS[active].name}
                  </h3>
                  
                  {/* Subtle description on the card */}
                  <p className="text-[13px] text-[#FAF8F4]/80 leading-relaxed max-w-sm mb-5 font-light">
                    {INGREDIENTS[active].desc}
                  </p>

                  <div className="h-px bg-[#C8A96B]/20 w-full mb-4" />
                  
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-[#C8A96B] uppercase tracking-wider">Properties:</span>
                    <span className="text-xs font-medium text-[#FAF8F4] tracking-wide">
                      {INGREDIENTS[active].benefit}
                    </span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
