import { motion } from "framer-motion"
import { WhatsAppIcon } from '@/components/icons/whatsapp'

export function FloatingWhatsApp() {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: 1, 
        opacity: 1,
      }}
      transition={{ 
        delay: 1.5, 
        type: "spring", 
        stiffness: 200,
        damping: 20,
      }}
      className="fixed bottom-28 right-6 md:bottom-8 md:right-8 z-30 hidden md:block"
      aria-label="Contact on WhatsApp"
    >
      <motion.a
        href="https://wa.me/918639424039?text=Hi! I'm interested in ordering from Lakshmi Home Foods."
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="relative flex items-center justify-center w-14 h-14 rounded-full transition-all duration-300 group border border-[#25D366]/20"
        style={{
          background: 'linear-gradient(135deg, #25D366, #128C7E)',
          boxShadow: 'rgba(18, 140, 126, 0.35) 0px 4px 20px',
        }}
      >
        {/* Pulse ring */}
        <motion.span
          className="absolute inset-0 rounded-full border-2 opacity-30"
          style={{
            borderColor: '#128C7E',
          }}
          animate={{
            scale: [1, 1.5],
            opacity: [0.5, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />

        {/* WhatsApp Icon */}
        <WhatsAppIcon className="w-7 h-7 text-white relative z-10 group-hover:scale-110 transition-transform" />

        {/* Ping animation */}
        <span className="absolute inset-0 rounded-full animate-ping" style={{
          background: 'rgba(18, 140, 126, 0.3)',
        }} />

        {/* Tooltip */}
        <motion.span
          initial={{ opacity: 0, x: 10 }}
          whileHover={{ opacity: 1, x: 0 }}
          className="absolute right-full mr-3 px-4 py-2 bg-[#0f0f0f] text-white text-sm font-medium rounded-lg whitespace-nowrap border border-white/10 hidden md:block pointer-events-none"
        >
          Order on WhatsApp
        </motion.span>
      </motion.a>
    </motion.div>
  )
}
