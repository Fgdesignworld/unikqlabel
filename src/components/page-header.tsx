import { motion } from "framer-motion"

interface PageHeaderProps {
  title: string
  subtitle?: string
  backgroundImage?: string
}

export function PageHeader({ title, subtitle, backgroundImage = "/images/hero-bg.jpg" }: PageHeaderProps) {
  return (
    <section className="relative pt-44 pb-28 px-4 overflow-hidden min-h-[44vh] flex items-center justify-center">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
          style={{ backgroundImage: `url('${backgroundImage}')` }}
        />
        {/* Gradient layers for premium dark look */}
        <div className="absolute inset-0" style={{ background: 'rgba(13,13,13,0.7)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, #0D0D0D 0%, transparent 35%, transparent 65%, #0D0D0D 100%)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(13,13,13,0.6) 0%, transparent 30%, transparent 70%, rgba(13,13,13,0.6) 100%)' }} />
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center"
        >
          {/* Animated gold bar */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "64px" }}
            transition={{ duration: 1, delay: 0.4 }}
            className="h-0.5 mx-auto mb-7 rounded-full"
            style={{ background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)' }}
          />

          <h1
            className="font-heading text-5xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tight"
            style={{ color: '#F5F0E8' }}
          >
            {title}
          </h1>

          {subtitle && (
            <p
              className="font-body text-base md:text-xl max-w-2xl mx-auto leading-relaxed"
              style={{ color: 'rgba(245,240,232,0.65)' }}
            >
              {subtitle}
            </p>
          )}

          {/* Gold diamond divider */}
          <div className="flex items-center justify-center gap-5 mt-10 opacity-50">
            <div className="h-px w-20" style={{ background: 'linear-gradient(to right, transparent, #D4AF37)' }} />
            <div className="w-2 h-2 rotate-45 bg-amber-500" />
            <div className="h-px w-20" style={{ background: 'linear-gradient(to left, transparent, #D4AF37)' }} />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
