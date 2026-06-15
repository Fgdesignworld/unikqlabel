import { motion } from "framer-motion"
import { Zap, Heart, Shield } from "lucide-react"

const cards = [
  {
    icon: Zap,
    title: "Power",
    subtitle: "STAMINA & VITALITY",
    description: "Infused with pure Himalayan Shilajit and active adaptogens to elevate your daily strength and physical endurance naturally.",
    color: "var(--theme-color)",
    bgGlow: "rgba(201, 164, 92, 0.15)"
  },
  {
    icon: Heart,
    title: "Taste",
    subtitle: "GOURMET INDULGENCE",
    description: "Belled by master pastry chefs. Rich dark chocolate chips, creamy almond butter, and organic oats combined into a melt-in-your-mouth experience.",
    color: "#EFE6D8",
    bgGlow: "rgba(239, 230, 216, 0.15)"
  },
  {
    icon: Shield,
    title: "Wellness",
    subtitle: "ADAPTOGENIC BALANCING",
    description: "Formulated with organic Ashwagandha root extract to curb cortisol levels, ease anxiety, and restore cognitive harmony.",
    color: "#D4B16A",
    bgGlow: "rgba(212, 177, 106, 0.15)"
  }
]

export function WhyKoffeeKup() {
  return (
    <section className="py-24 px-4 relative overflow-hidden" style={{ background: "var(--surface-page)" }}>
      {/* Background radial spotlights */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-5 pointer-events-none" style={{ background: "radial-gradient(circle, var(--theme-color) 0%, transparent 70%)" }} />
      
      <div className="container mx-auto max-w-6xl relative z-10">
        
        {/* Section Heading */}
        <div className="text-center mb-16">
          <motion.span 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="section-badge mb-4"
          >
            The KoffeeKup Difference
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif text-4xl md:text-5xl lg:text-6xl font-normal text-foreground mt-4 tracking-tight"
          >
            Ancient Wisdom.<br />
            <span className="text-gradient-gold italic">Modern Nutrition.</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-muted-foreground max-w-xl mx-auto mt-6 text-base font-sans"
          >
            We don't just bake cookies. We formulate delicious functional foods designed to support your mind, body, and soul.
          </motion.p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((card, index) => {
            const IconComponent = card.icon
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -8 }}
                className="group relative rounded-2xl p-8 overflow-hidden transition-all duration-300 border border-border"
                style={{
                  background: "var(--surface-card)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  boxShadow: "var(--card-shadow, 0 20px 40px -15px rgba(0,0,0,0.1))"
                }}
              >
                {/* Glow Overlay */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at 50% 10%, ${card.bgGlow} 0%, transparent 60%)`
                  }}
                />

                {/* Icon Container */}
                <div 
                  className="w-14 h-14 rounded-full flex items-center justify-center mb-8 border transition-all duration-500 group-hover:scale-110"
                  style={{
                    borderColor: "rgba(201, 164, 92, 0.3)",
                    background: "var(--surface-alt)"
                  }}
                >
                  <IconComponent className="w-6 h-6" style={{ color: card.color }} />
                </div>

                {/* Content */}
                <span className="text-[10px] tracking-[0.25em] font-sans font-bold block mb-2" style={{ color: card.color }}>
                  {card.subtitle}
                </span>
                
                <h3 className="font-serif text-2xl text-foreground font-medium mb-4">
                  {card.title}
                </h3>
                
                <p className="text-muted-foreground font-sans text-sm leading-relaxed">
                  {card.description}
                </p>
              </motion.div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
