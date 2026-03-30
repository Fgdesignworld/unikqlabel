

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Gift, Sparkles } from "lucide-react"
import { useSettings } from '@/context/settings-context'
import { WhatsAppIcon } from '@/components/icons/whatsapp'

export function ComboPopup() {
  const { settings } = useSettings()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  const comboItems = [
    { name: "Nethi Sunnunda", quantity: "250 g" },
    { name: "Karam Bundhi", quantity: "250 g" },
    { name: "Kotimera Pickle", quantity: "250 g" },
    { name: "Tamota Pickle", quantity: "250 g" },
    { name: "Kakaragaya Pickle", quantity: "250 g" },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md glass rounded-2xl overflow-hidden shadow-2xl shadow-[#d97706]/20"
          >
            {/* Decorative Border */}
            <div className="absolute inset-0 rounded-2xl border-2 border-[#d97706]/30 pointer-events-none" />
            
            {/* Festive Header */}
            <div className="relative bg-gradient-to-r from-[#7f1d1d] via-[#991b1b] to-[#7f1d1d] p-6 text-center">
              <div className="absolute top-2 left-4">
                <Sparkles className="w-5 h-5 text-[#f59e0b] animate-pulse" />
              </div>
              <div className="absolute top-2 right-4">
                <Sparkles className="w-5 h-5 text-[#f59e0b] animate-pulse" />
              </div>
              
              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>

              <div className="flex items-center justify-center gap-2 mb-2">
                <Gift className="w-6 h-6 text-[#f59e0b]" />
                <span className="text-[#f59e0b] text-sm font-medium tracking-wider uppercase">Special Offer</span>
                <Gift className="w-6 h-6 text-[#f59e0b]" />
              </div>
              
              <h2 className="font-serif text-3xl font-bold text-white">
                SPL Combo Offer
              </h2>
              <p className="text-[#fef3e2]/80 mt-1">Veg Pickles, Sweets & Snacks Combo</p>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="space-y-3 mb-6">
                {comboItems.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between py-2 px-3 rounded-lg bg-amber-500/10 border border-amber-500/20"
                  >
                    <span className="text-[#fef3e2] font-medium">{item.name}</span>
                    <span className="text-[#f59e0b] text-sm">{item.quantity}</span>
                  </motion.div>
                ))}
              </div>

              {/* Price */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-[#d97706]/20 to-[#f59e0b]/20 border border-[#d97706]/30">
                  <span className="font-serif text-3xl font-bold text-[#f59e0b]">{settings?.currency_symbol || '₹'}899</span>
                  <span className="text-[#fef3e2]/60 text-sm">Including Delivery</span>
                </div>
              </div>

              {/* CTA Button */}
              <a
                href={`https://wa.me/${(settings?.whatsapp || settings?.phone || '918639424039').replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full py-4 bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#25D366]/30 transition-all duration-300 hover:-translate-y-0.5"
              >
                <WhatsAppIcon className="w-5 h-5" />
                Order on WhatsApp
              </a>
            </div>

            {/* Decorative Footer Line */}
            <div className="h-1 bg-gradient-to-r from-transparent via-[#d97706] to-transparent" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
