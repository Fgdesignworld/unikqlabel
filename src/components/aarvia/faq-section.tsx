import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Minus } from "lucide-react"

const FAQS = [
  {
    category: "Formulations & Safety",
    items: [
      {
        q: "Are AARVIA products 100% natural?",
        a: "Yes. Every formulation is crafted entirely from plant-derived actives, cold-pressed vegetable oils, and pure hydrosols. We bypass synthetic silicones, sulfates, parabens, endocrine disruptors, and artificial colors.",
      },
      {
        q: "Are the formulations dermatologically tested?",
        a: "Absolutely. Our entire range undergoes rigorous dermatological screening and validation for safety and hypoallergenic compatibility, making it safe for delicate and sensitive skin.",
      },
      {
        q: "What is your stance on animal testing?",
        a: "AARVIA is 100% cruelty-free. We never test ingredients or finished products on animals, nor do we contract third parties to do so.",
      },
    ],
  },
  {
    category: "Orders & Shipping",
    items: [
      {
        q: "How long does shipping take?",
        a: "Standard shipping takes 3-5 business days within metropolitan areas and 5-7 business days for regional locations. Express shipping options are available at checkout.",
      },
      {
        q: "Do you ship internationally?",
        a: "Yes, we ship to most countries internationally. Surcharges and duty rates vary by location and are calculated dynamically during checkout.",
      },
      {
        q: "What is your return policy?",
        a: "We want you to love your ritual. If a product doesn't agree with your skin or hair type, you may return it within 30 days of purchase for a full store credit or refund. Simply contact our wellness support team.",
      },
    ],
  },
]

function FaqItem({ q, a, isOpen, onToggle }: { q: string; a: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <div 
      className={`mb-4 overflow-hidden rounded-2xl border transition-all duration-500 ${
        isOpen ? "border-[#C8A96B]/40 bg-[#FDFBF7] shadow-lg shadow-[#1F4D3A]/5" : "border-[#1F4D3A]/10 bg-white hover:border-[#C8A96B]/20 hover:bg-[#FDFBF7]/50"
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between text-left focus:outline-none p-5 md:p-6 group"
      >
        <span
          className={`text-[17px] md:text-[18px] font-serif font-medium transition-colors pr-4 ${
            isOpen ? "text-[#C8A96B]" : "text-[#1F4D3A] group-hover:text-[#C8A96B]"
          }`}
        >
          {q}
        </span>
        <div 
          className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 ${
            isOpen ? "border-[#C8A96B] bg-[#C8A96B] text-white" : "border-[#1F4D3A]/20 text-[#1F4D3A] group-hover:border-[#C8A96B] group-hover:text-[#C8A96B]"
          }`}
        >
          {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="px-5 pb-6 md:px-6 md:pb-7">
              <p
                className="text-[15px] md:text-[16px] leading-relaxed text-[#5A5A5A]"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {a}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function FaqSection() {
  const [openId, setOpenId] = useState<string | null>("0-0")

  return (
    <section className="py-16 md:py-24" style={{ background: '#FFFFFF' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 relative">
          
          <div className="lg:col-span-4 h-full relative">
            <div className="flex flex-col justify-start">
              <motion.p
                initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
                className="text-[11px] font-bold tracking-[0.26em] uppercase mb-3"
                style={{ color: '#C8A96B' }}>
                Got Questions?
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1, duration: 0.6 }}
                className="text-3xl md:text-4xl lg:text-5xl mb-6"
                style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, color: '#1F4D3A' }}>
                Frequently<br />
                <span style={{ color: '#C8A96B', fontStyle: 'italic' }}>Asked</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2, duration: 0.5 }}
                className="text-[#6B6B6B] text-[15px] leading-relaxed max-w-sm"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Find quick answers regarding our botanical ingredients, order placement, shipping policies, and skincare rituals.
              </motion.p>
            </div>
          </div>

          <div className="lg:col-span-7 lg:col-start-6 lg:max-h-[500px] lg:overflow-y-auto scrollbar-hide lg:pr-4" style={{ WebkitMaskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)', maskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)' }}>
            {FAQS.map((category, catIndex) => (
              <motion.div 
                key={category.category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * catIndex, duration: 0.5 }}
                className={catIndex > 0 ? "mt-10" : ""}
              >
                <h3 className="text-[13px] font-bold tracking-[0.15em] uppercase text-[#1F4D3A] mb-5 pl-2">
                  {category.category}
                </h3>
                <div className="flex flex-col">
                  {category.items.map((faq, i) => {
                    const id = `${catIndex}-${i}`
                    return (
                      <FaqItem 
                        key={i} 
                        q={faq.q} 
                        a={faq.a} 
                        isOpen={openId === id}
                        onToggle={() => setOpenId(openId === id ? null : id)}
                      />
                    )
                  })}
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
