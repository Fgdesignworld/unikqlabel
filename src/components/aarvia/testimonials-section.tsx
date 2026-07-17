import { motion } from "framer-motion"

export function TestimonialsSection() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden" style={{ background: '#FDFBF7' }}>
      <div className="max-w-4xl mx-auto px-6 lg:px-8 relative z-10 text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-[10px] font-bold tracking-[0.4em] uppercase mb-8"
          style={{ color: '#C8A96B' }}>
          Why Families Trust Us
        </motion.p>
        
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="text-3xl md:text-5xl lg:text-6xl mb-12 leading-tight"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, color: '#1F4D3A' }}>
          Every product begins with <br className="hidden md:block" />
          <span style={{ color: '#C8A96B', fontStyle: 'italic' }}>a simple question.</span>
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="space-y-8 text-[#1F4D3A]/80 font-sans font-light text-lg md:text-xl leading-relaxed max-w-2xl mx-auto"
        >
          <p className="font-medium text-[#1F4D3A] text-2xl md:text-3xl font-serif italic">
            "Would we confidently use it in our own homes?"
          </p>
          <p className="tracking-wide">
            That belief guides every ingredient, every material, and every decision we make.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
