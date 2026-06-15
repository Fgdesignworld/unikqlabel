import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "What makes KoffeeKup cookies different from standard bakery cookies?",
    answer: "KoffeeKup cookies are functional wellness foods, not just sweets. Each cookie is baked with clinical-grade adaptogens (like Ashwagandha & Shilajit), premium proteins, and healthy fats, with zero refined sugars or hydrogenated oils."
  },
  {
    question: "What are the benefits of Ashwagandha and Shilajit in food?",
    answer: "Ashwagandha helps buffer cortisol, reducing daily stress and anxiety. Shilajit provides fulvic acid and 84+ minerals that help speed up cellular energy (ATP) production, boosting stamina and focus without caffeine jitters."
  },
  {
    question: "Are KoffeeKup cookies safe for daily consumption?",
    answer: "Yes, absolutely. They are crafted with clean, natural ingredients. We recommend eating 1 cookie per day to enjoy the cumulative adaptogenic benefits as part of your daily wellness ritual."
  },
  {
    question: "Are these cookies gluten-free and vegan?",
    answer: "Our recipes are built on gluten-free grains (Ragi and Oats). Our Whey Protein cookies contain dairy-derived whey isolate. Our Ashwagandha and Shilajit cookies are completely plant-based and vegan-friendly."
  },
  {
    question: "What is the shelf life and storage recommendation?",
    answer: "KoffeeKup cookies have a shelf life of 6 months. To keep them at peak freshness, store them in a cool, dry place inside our airtight premium container."
  }
]

function AccordionRow({ item, isOpen, onClick }: { item: FAQItem; isOpen: boolean; onClick: () => void }) {
  return (
    <div 
      className="border-b border-border last:border-none py-5"
    >
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between text-left py-2 font-serif text-lg md:text-xl text-foreground font-medium hover:text-primary transition-colors focus:outline-none cursor-pointer"
      >
        <span>{item.question}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="text-primary ml-4"
        >
          <ChevronDown className="w-5 h-5" />
        </motion.span>
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
            <p className="pt-3 pb-2 text-muted-foreground font-sans text-sm leading-relaxed max-w-3xl">
              {item.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0)

  return (
    <section className="py-24 px-4 relative overflow-hidden" style={{ background: "var(--surface-page)" }}>
      {/* Background gradients */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-5 pointer-events-none" style={{ background: "radial-gradient(circle, var(--theme-color) 0%, transparent 70%)" }} />

      <div className="container mx-auto max-w-4xl relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="section-badge mb-4">Questions & Answers</span>
          <h2 className="font-serif text-4xl md:text-5xl font-normal text-foreground mt-4 tracking-tight">
            Frequently Asked <span className="text-gradient-gold italic">Queries.</span>
          </h2>
        </div>

        {/* Accordions List */}
        <div className="p-8 rounded-2xl border border-border animate-fade-in" style={{ background: "var(--surface-card)" }}>
          {faqs.map((item, idx) => (
            <AccordionRow 
              key={item.question}
              item={item}
              isOpen={openIdx === idx}
              onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
            />
          ))}
        </div>

      </div>
    </section>
  )
}
