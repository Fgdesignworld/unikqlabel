import { Link } from "react-router-dom"
import { motion } from "framer-motion"

export function PromotionalBanner() {
  return (
    <section className="relative w-full h-[350px] lg:h-[400px] overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/botanical_banner.png')" }} 
      />
      <div className="absolute inset-0 bg-black/30" />
      
      <div className="relative z-10 w-full h-full flex flex-col justify-center items-center text-center px-6">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-[#FDFBF7] text-[10px] font-bold tracking-[0.4em] uppercase mb-6"
        >
          Sustainability
        </motion.p>
        
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="text-3xl md:text-5xl lg:text-6xl text-[#FDFBF7] font-serif mb-10 max-w-4xl"
        >
          Better homes begin with a <br className="hidden md:block"/> healthier planet.
        </motion.h2>
        
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <Link to="/sustainability" className="px-8 py-4 bg-transparent border border-[#FDFBF7] hover:bg-[#FDFBF7] text-[#FDFBF7] hover:text-[#1F4D3A] text-xs font-bold uppercase tracking-[0.15em] rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg backdrop-blur-sm">
            Learn More
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
