import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles } from "lucide-react"

interface Ingredient {
  name: string;
  tag: string;
  description: string;
  benefit: string;
  details: string;
  icon: string;
}

const ingredients: Ingredient[] = [
  {
    name: "Ashwagandha",
    tag: "Cortisol Buffer",
    description: "KSM-66 Organic Ashwagandha",
    benefit: "Calms mind & lowers stress",
    details: "Traditionally used in Ayurveda as a Rasayana (rejuvenator). It helps the body adapt to physical and mental stressors, maintaining steady energy and emotional balance.",
    icon: "🌱"
  },
  {
    name: "Shilajit",
    tag: "Cellular Energy",
    description: "Pure Himalayan Gold Resin",
    benefit: "Stamina, focus & cellular ATP",
    details: "Rich in Fulvic Acid and 84+ minerals. Shilajit works at a cellular level, speeding up mitochondrial energy production to supply clean, non-jittery energy.",
    icon: "🏔️"
  },
  {
    name: "Almonds",
    tag: "Healthy Lipids",
    description: "Gourmet Almond Butter",
    benefit: "Sustained fuel & brain health",
    details: "Almonds provide rich monounsaturated fats that slow digestion, giving you a steady release of energy without spiking insulin, while supporting cell structure.",
    icon: "🌰"
  },
  {
    name: "Oats",
    tag: "Sustained Carbs",
    description: "Organic Rolled Oat Flour",
    benefit: "Fiber-rich glycogen supply",
    details: "Packed with beta-glucan fiber, oats digest slowly to feed glycogen stores steadily, supporting optimal metabolic rates and cardiovascular wellness.",
    icon: "🌾"
  },
  {
    name: "Ragi",
    tag: "Mineral Powerhouse",
    description: "Finger Millet Grain",
    benefit: "Iron, Calcium & Gluten-Free",
    details: "An ancient super-grain naturally loaded with calcium and iron, promoting bone density and hemoglobin production while supporting gut health.",
    icon: "🍪"
  },
  {
    name: "Whey Protein",
    tag: "Muscle Synthesis",
    description: "Ultra-Filtered Whey Isolate",
    benefit: "10g protein & muscle recovery",
    details: "Quickly digested amino acids that help repair muscle tissue after workouts and keep you satiated, preserving lean muscle mass and boosting metabolism.",
    icon: "⚡"
  }
]

export function IngredientShowcase() {
  const [activeIdx, setActiveIdx] = useState<number>(0)
  const [isHovered, setIsHovered] = useState<boolean>(false)

  useEffect(() => {
    if (isHovered) return
    const interval = setInterval(() => {
      setActiveIdx(prev => (prev + 1) % ingredients.length)
    }, 4500)
    return () => clearInterval(interval)
  }, [isHovered])

  return (
    <section className="py-24 px-4 relative overflow-hidden" style={{ background: "var(--surface-alt)" }}>
      {/* Background gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] opacity-10 pointer-events-none" style={{ background: "radial-gradient(circle, var(--theme-color) 0%, transparent 70%)" }} />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-[120px] opacity-10 pointer-events-none" style={{ background: "radial-gradient(circle, var(--theme-color) 0%, transparent 70%)" }} />

      <div className="container mx-auto max-w-6xl relative z-10">
        
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="section-badge mb-4">Functional Alchemy</span>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-normal text-foreground mt-4 tracking-tight">
            Curated For <span className="text-gradient-gold italic">High Performance.</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mt-6 text-base font-sans">
            Hover over each active ingredient to uncover the ancient science and modern nutrition baked into every single bite.
          </p>
        </div>

        {/* Circular Map Layout */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16 mt-8">
          
          {/* Circular Interactive Arena (Left Column) */}
          <div 
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="relative w-[300px] h-[300px] xs:w-[340px] xs:h-[340px] sm:w-[460px] sm:h-[460px] flex items-center justify-center shrink-0"
          >
            {/* Inline Styles for Animation and Custom Classes */}
            <style>{`
              @keyframes orbit-spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
              @keyframes dash {
                to {
                  stroke-dashoffset: -20;
                }
              }
              .active-orbit-line {
                stroke-dasharray: 8 4;
                animation: dash 1.5s linear infinite;
              }
            `}</style>

            {/* Outer dotted orbit */}
            <div 
              className="absolute rounded-full border border-dashed border-border pointer-events-none"
              style={{
                inset: "11.9565%",
                animation: "orbit-spin 120s linear infinite"
              }}
            />
            
            {/* Inner solid orbit */}
            <div 
              className="absolute rounded-full border border-border/40 pointer-events-none"
              style={{
                inset: "23.913%",
                animation: "orbit-spin 60s linear reverse infinite"
              }}
            />

            {/* Glowing lines connecting center pack to active node */}
            <svg viewBox="0 0 460 460" className="absolute inset-0 w-full h-full pointer-events-none z-0">
              {ingredients.map((_, idx) => {
                const angle = (idx * 60 - 90) * (Math.PI / 180)
                const radius = 175 // viewBox-relative radius
                const endX = 230 + radius * Math.cos(angle)
                const endY = 230 + radius * Math.sin(angle)
                const isActive = activeIdx === idx
                return (
                  <line
                    key={idx}
                    x1="230"
                    y1="230"
                    x2={endX}
                    y2={endY}
                    stroke={isActive ? "var(--theme-color)" : "var(--border)"}
                    strokeWidth={isActive ? "2" : "0.75"}
                    className={`transition-all duration-500 ${isActive ? "active-orbit-line" : ""}`}
                    strokeDasharray={isActive ? "6 4" : "4 4"}
                    opacity={isActive ? 1 : 0.3}
                  />
                )
              })}
            </svg>

            {/* Center Majestic Product Pack */}
            <div 
              className="w-[100px] h-[100px] xs:w-[120px] xs:h-[120px] sm:w-[170px] sm:h-[170px] rounded-full flex items-center justify-center p-3 relative z-10 border border-border shadow-2xl transition-all duration-500"
              style={{ background: "var(--background)" }}
            >
              <div className="absolute -inset-4 rounded-full bg-primary/5 blur-xl animate-pulse pointer-events-none" />
              <div className="absolute inset-1 rounded-full border border-primary/10 pointer-events-none" />
              <img 
                src="/images/pv2.png" 
                alt="KoffeeKup Premium Pack" 
                className="w-[85%] h-[85%] object-contain float"
                style={{ filter: "drop-shadow(0 15px 30px rgba(0,0,0,0.15))" }}
              />
            </div>

            {/* Ingredient Nodes orbiting around center */}
            {ingredients.map((ing, idx) => {
              const angleDeg = idx * 60 - 90 // starting from top
              const angleRad = angleDeg * (Math.PI / 180)
              const isActive = activeIdx === idx

              return (
                <div
                  key={ing.name}
                  onMouseEnter={() => setActiveIdx(idx)}
                  className="absolute z-20 cursor-pointer group"
                  style={{
                    top: `calc(50% + 38.0435% * ${Math.sin(angleRad)})`,
                    left: `calc(50% + 38.0435% * ${Math.cos(angleRad)})`,
                    transform: "translate(-50%, -50%)"
                  }}
                >
                  <div className="relative">
                    {/* Pulsing ring on active */}
                    {isActive && (
                      <span className="absolute -inset-2 rounded-full border border-primary/30 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite] pointer-events-none" />
                    )}
                    
                    <motion.div
                      animate={{
                        scale: isActive ? 1.12 : 1,
                        borderColor: isActive ? "var(--theme-color)" : "var(--border)",
                        boxShadow: isActive ? "0 0 25px rgba(201,164,92,0.3)" : "var(--card-shadow, 0 5px 15px rgba(0,0,0,0.04))"
                      }}
                      className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 rounded-full flex flex-col items-center justify-center text-center relative font-sans transition-all duration-300"
                      style={{
                        background: "var(--surface-alt)",
                        borderWidth: "1.5px"
                      }}
                    >
                      <span className="text-lg xs:text-xl sm:text-2xl mb-0.5">{ing.icon}</span>
                      <span className="text-[6px] sm:text-[7px] uppercase tracking-wider text-muted-foreground block font-bold group-hover:text-foreground transition-colors">
                        {ing.name.split(" ")[0]}
                      </span>
                    </motion.div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Detailed Info Card (Right Column) */}
          <div className="flex-1 max-w-lg min-h-[340px] flex items-center w-full">
            <AnimatePresence mode="wait">
              {ingredients.map((ing, idx) => {
                if (idx !== activeIdx) return null
                return (
                  <motion.div
                    key={ing.name}
                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -15, scale: 0.98 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="p-8 rounded-3xl w-full glass-gold border border-border shadow-xl relative overflow-hidden"
                    style={{
                      boxShadow: "var(--card-shadow, 0 20px 40px rgba(0,0,0,0.08))"
                    }}
                  >
                    {/* Big Watermark Emoji Icon */}
                    <div className="absolute -top-2 -right-2 text-8xl opacity-[0.08] dark:opacity-[0.05] pointer-events-none select-none">
                      {ing.icon}
                    </div>

                    {/* Header */}
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                      <span className="text-xs uppercase tracking-widest text-primary font-bold font-sans">
                        {ing.tag}
                      </span>
                    </div>

                    <h3 className="font-serif text-3xl text-foreground font-medium mb-1">
                      {ing.name}
                    </h3>
                    
                    <span className="text-xs font-sans text-muted-foreground block mb-6 italic">
                      {ing.description}
                    </span>

                    {/* Benefit Highlight Box */}
                    <div className="border border-primary/20 rounded-xl px-5 py-3 mb-6" style={{ background: "var(--surface-alt)" }}>
                      <span className="text-xs text-muted-foreground font-sans block mb-1">KEY BENEFIT</span>
                      <p className="font-serif text-lg text-primary font-semibold">{ing.benefit}</p>
                    </div>

                    {/* Description Details */}
                    <p className="text-muted-foreground font-sans text-sm leading-relaxed">
                      {ing.details}
                    </p>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>

        </div>

      </div>
    </section>
  )
}
