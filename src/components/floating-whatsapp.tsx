import { motion } from "framer-motion"
import { WhatsAppIcon } from '@/components/icons/whatsapp'
import { useSettings } from '@/context/settings-context'

export function FloatingWhatsApp() {
  const { settings } = useSettings()
  const waNum  = (settings.whatsapp || settings.phone || '918639424039').replace(/[^0-9]/g, '')
  const waLink = `https://wa.me/${waNum}?text=Hi! I'm interested in ordering from ${settings.site_name || 'KoffeeKup'}.`
  
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
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
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ 
          scale: 1.06,
          boxShadow: 'rgba(37, 211, 102, 0.25) 0px 8px 30px',
        }}
        whileTap={{ scale: 0.95 }}
        className="relative flex items-center justify-center w-11 h-11 rounded-full transition-all duration-300 group border"
        style={{
          background: 'rgba(255, 255, 255, 0.04)',
          backdropFilter: 'blur(12px)',
          borderColor: 'rgba(37, 211, 102, 0.35)',
          boxShadow: 'rgba(37, 211, 102, 0.1) 0px 4px 15px',
        }}
      >
        {/* Pulse ring */}
        <motion.span
          className="absolute inset-0 rounded-full border opacity-30"
          style={{
            borderColor: '#25D366',
          }}
          animate={{
            scale: [1, 1.4],
            opacity: [0.4, 0],
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />

        {/* WhatsApp Icon */}
        <WhatsAppIcon className="w-5.5 h-5.5 text-[#25D366] relative z-10 group-hover:scale-105 transition-transform duration-300" />

        {/* Tooltip */}
        <motion.span
          initial={{ opacity: 0, x: 10 }}
          whileHover={{ opacity: 1, x: 0 }}
          className="absolute right-full mr-3 px-3 py-1.5 bg-background text-foreground text-xs font-semibold rounded-full shadow-lg border border-border whitespace-nowrap hidden md:block pointer-events-none tracking-wider uppercase transition-opacity duration-300"
          style={{
            backdropFilter: 'blur(8px)',
            background: 'var(--surface-card)',
          }}
        >
          WhatsApp Chat
        </motion.span>
      </motion.a>
    </motion.div>
  )
}
