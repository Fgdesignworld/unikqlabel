

import { motion } from "framer-motion"

interface PageHeaderProps {
  title: string
  subtitle?: string
  backgroundImage?: string
}

export function PageHeader({ title, subtitle, backgroundImage = "/images/hero-bg.jpg" }: PageHeaderProps) {
  return (
    <section className="relative pt-40 pb-24 px-4 overflow-hidden min-h-[40vh] flex items-center justify-center">
      {/* Background Image with Parallax-like effect */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
          style={{ backgroundImage: `url('${backgroundImage}')` }}
        />
        {/* Multi-layer Gradient Overlay for Premium Look */}
        <div className="absolute inset-0 bg-[#0f0f0f]/60" /> {/* Dark tint */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f0f0f] via-transparent to-[#0f0f0f]" /> {/* Top/Bottom fade */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f0f0f]/80 via-transparent to-[#0f0f0f]/80" /> {/* Left/Right fade */}
      </div>
      
      <div className="container mx-auto max-w-7xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center"
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "80px" }}
            transition={{ duration: 1, delay: 0.5 }}
            className="h-1 bg-[#d97706] mx-auto mb-6"
          />
          
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold text-[#fef3e2] mb-6 tracking-tight">
            {title}
          </h1>
          
          {subtitle && (
            <p className="text-[#fef3e2]/80 text-lg md:text-2xl max-w-3xl mx-auto font-medium leading-relaxed">
              {subtitle}
            </p>
          )}
          
          {/* Decorative Elements */}
          <div className="flex items-center justify-center gap-6 mt-12 opacity-60">
            <div className="h-px w-24 bg-gradient-to-r from-transparent to-[#d97706]" />
            <div className="w-2.5 h-2.5 bg-[#d97706] rotate-45" />
            <div className="h-px w-24 bg-gradient-to-l from-transparent to-[#d97706]" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
