import { motion } from "framer-motion"

interface PageHeaderProps {
  title?: string
  subtitle?: string
  backgroundImage?: string
}

export function PageHeader({ title, subtitle, backgroundImage }: PageHeaderProps) {
  return (
    <div className="relative w-full flex flex-col items-center justify-center text-center px-4" style={{ height: '300px' }}>
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: backgroundImage ? `url('${backgroundImage}')` : 'none',
            backgroundColor: '#1F4D3A'
          }}
        />
        {/* Dark Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content Layer */}
      <div className="relative z-10 max-w-3xl mx-auto text-white">
        {title && (
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-serif mb-4 !text-white drop-shadow-md"
          >
            {title}
          </motion.h1>
        )}
        {subtitle && (
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl font-sans text-white/90"
          >
            {subtitle}
          </motion.p>
        )}
      </div>
    </div>
  )
}
