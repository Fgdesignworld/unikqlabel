

import { motion } from "framer-motion"

interface PageHeaderProps {
  title: string
  subtitle?: string
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <section className="relative pt-32 pb-16 px-4 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[url('/images/hero-bg.jpg')] bg-cover bg-center" />
      </div>
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f0f0f] via-transparent to-[#0f0f0f]" />

      <div className="container mx-auto max-w-7xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-[#fef3e2] mb-4">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[#fef3e2]/70 text-lg md:text-xl max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
          
          {/* Decorative Line */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#d97706]" />
            <div className="w-2 h-2 bg-[#d97706] rounded-full" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#d97706]" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
