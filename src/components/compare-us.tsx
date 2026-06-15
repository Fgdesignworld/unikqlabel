import { useState } from "react"
import { motion } from "framer-motion"
import { Check, X, ShieldAlert, Sparkles } from "lucide-react"

const metrics = [
  {
    name: "Refined Sugar",
    unit: "g",
    koffeeValue: 0,
    koffeeColor: "var(--theme-color)",
    regularValue: 18,
    regularColor: "#dc2626"
  },
  {
    name: "Pure Protein",
    unit: "g",
    koffeeValue: 10,
    koffeeColor: "var(--theme-color)",
    regularValue: 1,
    regularColor: "#dc2626"
  },
  {
    name: "Adaptogen Blend",
    unit: "mg",
    koffeeValue: 500,
    koffeeColor: "var(--theme-color)",
    regularValue: 0,
    regularColor: "#dc2626",
    max: 500
  },
  {
    name: "Trans Fats & Oils",
    unit: "g",
    koffeeValue: 0,
    koffeeColor: "var(--theme-color)",
    regularValue: 8,
    regularColor: "#dc2626"
  }
]

export function CompareUs() {
  const [hoveredMetric, setHoveredMetric] = useState<number | null>(null)

  return (
    <section className="py-24 px-4 relative overflow-hidden" style={{ background: "var(--surface-alt)" }}>
      {/* Background spotlights */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[160px] opacity-[0.06] pointer-events-none" style={{ background: "radial-gradient(circle, var(--theme-color) 0%, transparent 70%)" }} />

      <div className="container mx-auto max-w-5xl relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="section-badge mb-4">No Compromises</span>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-normal text-foreground mt-4 tracking-tight">
            How We Stack <span className="text-gradient-gold italic">Up.</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mt-6 text-base font-sans">
            We put our ingredients up against typical store-bought cookies. The comparison speaks for itself.
          </p>
        </div>

        {/* Visual Charts & Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Dynamic Progress Chart (Left) */}
          <div className="p-8 rounded-2xl border border-border" style={{ background: "var(--surface-card)", backdropFilter: "blur(20px)" }}>
            <h3 className="font-serif text-2xl text-foreground font-medium mb-8 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Nutritional Breakdown
            </h3>
            
            <div className="space-y-8">
              {metrics.map((m, idx) => {
                const maxVal = m.max || 20
                const koffPercent = (m.koffeeValue / maxVal) * 100
                const regPercent = (m.regularValue / maxVal) * 100
                const isHovered = hoveredMetric === idx

                return (
                  <div 
                    key={m.name} 
                    className="space-y-3"
                    onMouseEnter={() => setHoveredMetric(idx)}
                    onMouseLeave={() => setHoveredMetric(null)}
                  >
                    <div className="flex justify-between items-baseline">
                      <span className="font-sans text-sm font-semibold text-foreground/90">{m.name}</span>
                      <div className="flex gap-4 text-xs font-bold font-sans">
                        <span className="text-primary">KoffeeKup: {m.koffeeValue}{m.unit}</span>
                        <span className="text-muted-foreground/60">Regular: {m.regularValue}{m.unit}</span>
                      </div>
                    </div>

                    {/* Progress Bars */}
                    <div className="space-y-1.5">
                      {/* KoffeeKup Bar */}
                      <div className="h-3 w-full rounded-full overflow-hidden relative" style={{ background: "var(--surface-alt)" }}>
                        <motion.div 
                          initial={{ width: 0 }}
                          whileInView={{ width: `${koffPercent}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full rounded-full"
                          style={{ background: "linear-gradient(90deg, color-mix(in srgb, var(--theme-color) 40%, transparent), var(--theme-color))" }}
                        />
                      </div>
                      
                      {/* Regular Cookie Bar */}
                      <div className="h-2.5 w-full rounded-full overflow-hidden relative opacity-50" style={{ background: "var(--surface-alt)" }}>
                        <motion.div 
                          initial={{ width: 0 }}
                          whileInView={{ width: `${regPercent}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full bg-red-600 rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Feature Checklists (Right) */}
          <div className="space-y-6">
            
            {/* KoffeeKup Premium Card */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="p-6 rounded-2xl border border-primary/30 relative overflow-hidden" 
              style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--theme-color) 8%, var(--surface-card)), var(--surface-card))" }}
            >
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-20 pointer-events-none" style={{ background: "var(--theme-color)" }} />
              
              <h4 className="font-serif text-xl text-primary font-semibold mb-4 flex items-center gap-2">
                KoffeeKup Cookies
                <span className="text-[9px] uppercase tracking-widest px-2 py-0.5 rounded bg-primary/10 font-sans font-bold text-primary">Premium Wellness</span>
              </h4>
              
              <ul className="space-y-3 font-sans text-xs">
                {[
                  "Sweetened with zero-glycemic monk fruit and stevia.",
                  "Contains clinical dose of Adaptogenic Herbs.",
                  "10g whey isolate protein per serving for muscle synthesis.",
                  "Made with healthy fats from raw almond paste.",
                  "Slow-baked at low heat to lock in enzyme action."
                ].map(text => (
                  <li key={text} className="flex items-start gap-2.5 text-foreground/90">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Regular Cookies Card */}
            <div className="p-6 rounded-2xl border border-border" style={{ background: "var(--surface-alt)" }}>
              <h4 className="font-serif text-xl text-muted-foreground font-semibold mb-4 flex items-center gap-2">
                Traditional Bakery Cookies
                <ShieldAlert className="w-4 h-4 text-red-500 opacity-60" />
              </h4>
              
              <ul className="space-y-3 font-sans text-xs">
                {[
                  "Loaded with high-glycemic refined white sugars.",
                  "Zero functional herbs or cognitive aids.",
                  "Trace protein (under 1g) with high wheat gluten content.",
                  "Prepared with cheap hydrogenated palm oils.",
                  "Baked at high heat, destroying micronutrients."
                ].map(text => (
                  <li key={text} className="flex items-start gap-2.5 text-muted-foreground/70">
                    <X className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>

      </div>
    </section>
  )
}
