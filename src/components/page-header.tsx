import { motion } from "framer-motion"

interface PageHeaderProps {
  title: string
  subtitle?: string
  backgroundImage?: string
}

export function PageHeader({ title, subtitle, backgroundImage = "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=1200&auto=format&fit=crop" }: PageHeaderProps) {
  return (
    <section className="relative pt-32 pb-16 px-5 overflow-hidden min-h-[280px] flex items-center justify-center bg-[#F7F4ED] border-b border-slate-200">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
          style={{ 
            backgroundImage: `url('${backgroundImage}')`,
            filter: 'brightness(0.55) contrast(1.05) saturate(90%)'
          }}
        />
        
        {/* Soft, warm dark gold/cocoa overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1F4D3A]/60 via-[#1F4D3A]/45 to-[#1F4D3A]/70 z-0" />
        
        {/* Radial Ambient Glow */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[140px] opacity-20 pointer-events-none" 
          style={{ background: "radial-gradient(circle, #C8A96B 0%, transparent 70%)" }}
        />
      </div>

      {/* Decorative patterns */}
      <div className="absolute left-10 top-1/4 opacity-10 hidden sm:block pointer-events-none z-0">
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="w-1 h-1 rounded-full bg-[#C8A96B]" />
          ))}
        </div>
      </div>
      <div 
        className="absolute right-10 bottom-1/4 w-24 h-12 opacity-10 hidden md:block pointer-events-none z-0" 
        style={{
          backgroundImage: "repeating-linear-gradient(45deg, #C8A96B, #C8A96B 1px, transparent 1px, transparent 8px)",
        }}
      />

      <div className="container mx-auto max-w-4xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center"
        >
          {/* Glassmorphic Capsule Content Holder */}
          <div className="relative px-6 py-10 sm:px-12 sm:py-12 rounded-3xl backdrop-blur-md bg-[#1F4D3A]/30 border border-white/10 shadow-[0_20px_50px_rgba(31,77,58,0.15)]">
            
            {/* Top decorative line and badge */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "80px" }}
              transition={{ duration: 1, delay: 0.3 }}
              className="h-[1px] mx-auto mb-6 rounded-full"
              style={{ background: 'linear-gradient(90deg, transparent, #C8A96B, transparent)' }}
            />

            <span className="text-[10px] sm:text-xs font-sans font-semibold tracking-[0.35em] text-[#C8A96B] uppercase mb-4 block">
              Aarvia Premium Botanical Care
            </span>

            <h1
              className="font-serif text-4xl sm:text-5xl md:text-6xl font-medium mb-6 tracking-tight leading-tight"
              style={{
                background: 'linear-gradient(135deg, #FFF 60%, #F7F4ED 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {title}
            </h1>

            {subtitle && (
              <p
                className="font-sans text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed"
                style={{ color: 'rgba(247,244,237,0.82)', fontWeight: 300 }}
              >
                {subtitle}
              </p>
            )}

            {/* Gold diamond divider at the bottom */}
            <div className="flex items-center justify-center gap-4 mt-8 opacity-45">
              <div className="h-[1px] w-12" style={{ background: 'linear-gradient(to right, transparent, #C8A96B)' }} />
              <div className="w-1.5 h-1.5 rotate-45 bg-[#C8A96B]" />
              <div className="h-[1px] w-12" style={{ background: 'linear-gradient(to left, transparent, #C8A96B)' }} />
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  )
}
