import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, HelpCircle } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PageHeader } from "@/components/page-header"
import { useSeo } from "@/hooks/use-seo"

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

function FaqItem({ q, a }: { q: string; a: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-slate-200 py-4 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left focus:outline-none group"
      >
        <span
          className="text-base font-serif font-medium text-[#1F4D3A] group-hover:text-[#C8A96B] transition-colors"
        >
          {q}
        </span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <ChevronDown className="w-5 h-5 text-gray-500 group-hover:text-[#C8A96B]" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p
              className="text-sm leading-relaxed text-[#6A6A60] mt-3 pr-8"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FaqPage() {
  useSeo({ pageType: "page", pageSlug: "faq", fallbackTitle: "Frequently Asked Questions — Aarvia" })

  return (
    <main className="min-h-screen" style={{ background: "#F7F4ED" }}>
      <Navbar />
      <PageHeader
        title="Frequently Asked Questions"
        subtitle="Find quick answers regarding our botanical ingredients, order placement, shipping policies, and skincare rituals."
        backgroundImage="https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1200&auto=format&fit=crop"
      />

      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-col items-center mb-16 text-center">
            <HelpCircle className="w-8 h-8 text-[#C8A96B] mb-3" />
            <p className="text-[11px] font-bold tracking-[0.26em] uppercase mb-2" style={{ color: "#C8A96B" }}>
              Help Center
            </p>
            <h2 className="text-4xl md:text-5xl font-serif font-normal text-[#1F4D3A]">
              How Can We Help You?
            </h2>
          </div>

          <div className="space-y-12">
            {FAQS.map((cat) => (
              <div
                key={cat.category}
                className="p-8 bg-white border border-slate-200/80 shadow-[0_4px_30px_rgba(31,77,58,0.02)]"
              >
                <h3
                  className="text-xl font-serif font-semibold text-[#1F4D3A] border-b pb-4 mb-4"
                  style={{ borderColor: "rgba(200,169,107,0.2)" }}
                >
                  {cat.category}
                </h3>
                <div className="divide-y divide-slate-100">
                  {cat.items.map((item, idx) => (
                    <FaqItem key={idx} q={item.q} a={item.a} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
