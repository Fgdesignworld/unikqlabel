

import { motion } from "framer-motion"
import { MessageCircle, Phone, Sparkles } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-20 px-4 bg-[#0f0f0f] relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#d97706]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#7f1d1d]/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto max-w-4xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass rounded-3xl p-8 md:p-16 text-center border border-[#d97706]/20 relative overflow-hidden"
        >
          {/* Decorative Sparkles */}
          <Sparkles className="absolute top-6 left-6 w-6 h-6 text-[#f59e0b]/30" />
          <Sparkles className="absolute top-6 right-6 w-6 h-6 text-[#f59e0b]/30" />
          <Sparkles className="absolute bottom-6 left-6 w-6 h-6 text-[#f59e0b]/30" />
          <Sparkles className="absolute bottom-6 right-6 w-6 h-6 text-[#f59e0b]/30" />

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <span className="text-[#d97706] text-sm font-medium tracking-wider uppercase">Ready to Order?</span>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-[#fef3e2] mt-2 mb-4 text-balance">
              Order Your Favorite <br className="hidden md:block" />
              <span className="text-gradient-gold">Homemade Foods</span> Today
            </h2>
            <p className="text-[#fef3e2]/70 mb-8 max-w-xl mx-auto">
              Experience the authentic taste of traditional Andhra cuisine, delivered fresh to your doorstep.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://wa.me/918639424039"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white font-semibold rounded-full hover:shadow-lg hover:shadow-[#25D366]/30 transition-all duration-300 hover:-translate-y-1"
              >
                <MessageCircle className="w-5 h-5" />
                Order on WhatsApp
              </a>
              <a
                href="tel:+918639424039"
                className="flex items-center gap-3 px-8 py-4 border-2 border-[#d97706] text-[#d97706] font-semibold rounded-full hover:bg-[#d97706] hover:text-[#0f0f0f] transition-all duration-300"
              >
                <Phone className="w-5 h-5" />
                Call Now
              </a>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
