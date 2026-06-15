import { motion } from "framer-motion"
import { Search, Compass, Cpu, Award } from "lucide-react"

const steps = [
  {
    icon: Search,
    title: "1. Sourcing Adaptogens",
    subtitle: "ORGANIC RAW MATERIALS",
    description: "We source our KSM-66 Ashwagandha roots directly from organic farms in Central India and wildcraft our Shilajit at 16,000+ feet in the Himalayan peaks to ensure clinical grade potency.",
    color: "#C9A45C"
  },
  {
    icon: Compass,
    title: "2. Traditional Wisdom",
    subtitle: "AYURVEDIC RITUALS",
    description: "Ingredients are purified and processed using age-old water extraction techniques to preserve the active compounds—withanolides and fulvic acids—without toxic chemical solvents.",
    color: "#A57E37"
  },
  {
    icon: Cpu,
    title: "3. Modern Sports Science",
    subtitle: "NUTRITIONAL MACROS",
    description: "Our cookies are formulated by sports nutritionists to balance low-glycemic carbohydrates with rich whey protein isolate, healthy fats, and prebiotic dietary fiber for metabolic longevity.",
    color: "#D4B16A"
  },
  {
    icon: Award,
    title: "4. Premium Baking & Control",
    subtitle: "GOURMET END RESULT",
    description: "Slow-baked in state-of-the-art facilities at low temperatures to keep the protein active and the organic compounds stable, creating a clean, healthy, and highly functional cookie.",
    color: "#C9A45C"
  }
]

export function WellnessJourney() {
  return (
    <section className="py-24 px-4 relative overflow-hidden" style={{ background: "var(--surface-page)" }}>
      {/* Dynamic light glows */}
      <div className="absolute top-1/4 right-[10%] w-[350px] h-[350px] rounded-full blur-[90px] opacity-[0.03] pointer-events-none" style={{ background: "radial-gradient(circle, var(--theme-color) 0%, transparent 70%)" }} />
      <div className="absolute bottom-1/4 left-[10%] w-[350px] h-[350px] rounded-full blur-[90px] opacity-[0.03] pointer-events-none" style={{ background: "radial-gradient(circle, var(--theme-color) 0%, transparent 70%)" }} />

      <div className="container mx-auto max-w-5xl relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-20">
          <span className="section-badge mb-4">Seed To Bite</span>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-normal text-foreground mt-4 tracking-tight">
            Our Wellness <span className="text-gradient-gold italic">Journey.</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mt-6 text-base font-sans">
            How we combine the wisdom of ancient Ayurveda with the rigor of modern athletic science to build the ultimate cookie.
          </p>
        </div>

        {/* Timeline Path */}
        <div className="relative border-l border-border md:border-none max-w-3xl mx-auto pl-8 md:pl-0">
          
          {/* Central Line on Desktop */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2 hidden md:block" />

          {/* Steps */}
          <div className="space-y-16">
            {steps.map((step, index) => {
              const IconComponent = step.icon
              const isEven = index % 2 === 0
              return (
                <div key={step.title} className="relative flex flex-col md:flex-row md:items-center">
                  
                  {/* Circle Marker on Line */}
                  <div className="absolute -left-[45px] md:left-1/2 top-0 md:top-1/2 -translate-y-1/2 md:-translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center z-20 border border-border"
                    style={{
                      background: "var(--background)"
                    }}
                  >
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: step.color }} />
                  </div>

                  {/* Left Column (Desktop) */}
                  <div className={`w-full md:w-1/2 md:pr-12 md:text-right ${isEven ? "md:order-1" : "md:order-3 opacity-0 pointer-events-none hidden md:block"}`}>
                    {isEven && (
                      <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6 }}
                      >
                        <span className="text-[10px] tracking-[0.25em] font-sans font-bold block mb-2" style={{ color: step.color }}>
                          {step.subtitle}
                        </span>
                        <h3 className="font-serif text-2xl text-foreground font-medium mb-3">{step.title}</h3>
                        <p className="text-muted-foreground font-sans text-sm leading-relaxed max-w-sm ml-auto">{step.description}</p>
                      </motion.div>
                    )}
                  </div>

                  {/* Icon Spacer (Desktop) */}
                  <div className="w-16 h-16 rounded-full border border-border items-center justify-center shrink-0 hidden md:flex md:order-2 z-10" style={{ background: "var(--surface-alt)", backdropFilter: "blur(10px)" }}>
                    <IconComponent className="w-6 h-6 text-primary" />
                  </div>

                  {/* Right Column (Desktop) */}
                  <div className={`w-full md:w-1/2 md:pl-12 ${!isEven ? "md:order-3" : "md:order-1 opacity-0 pointer-events-none hidden md:block"}`}>
                    {!isEven && (
                      <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6 }}
                      >
                        <span className="text-[10px] tracking-[0.25em] font-sans font-bold block mb-2" style={{ color: step.color }}>
                          {step.subtitle}
                        </span>
                        <h3 className="font-serif text-2xl text-foreground font-medium mb-3">{step.title}</h3>
                        <p className="text-muted-foreground font-sans text-sm leading-relaxed max-w-sm">{step.description}</p>
                      </motion.div>
                    )}
                  </div>

                  {/* Mobile Fallback layout (if step description is on the other side) */}
                  <div className="block md:hidden">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6 }}
                    >
                      <span className="text-[10px] tracking-[0.25em] font-sans font-bold block mb-1" style={{ color: step.color }}>
                        {step.subtitle}
                      </span>
                      <h3 className="font-serif text-xl text-foreground font-semibold mb-2">{step.title}</h3>
                      <p className="text-muted-foreground font-sans text-xs leading-relaxed">{step.description}</p>
                    </motion.div>
                  </div>

                </div>
              )
            })}
          </div>

        </div>

      </div>
    </section>
  )
}
