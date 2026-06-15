import { useEffect, useRef, useState } from "react"
import { motion, useInView, animate } from "framer-motion"

interface StatItemProps {
  value: number;
  suffix: string;
  title: string;
  description: string;
}

function Counter({ value, suffix, title, description }: StatItemProps) {
  const nodeRef = useRef<HTMLSpanElement>(null)
  const inView = useInView(nodeRef, { once: true, margin: "-100px" })
  const [hasRun, setHasRun] = useState(false)

  useEffect(() => {
    if (inView && !hasRun) {
      setHasRun(true)
      const node = nodeRef.current
      if (node) {
        animate(0, value, {
          duration: 2.0,
          ease: "easeOut",
          onUpdate: (latest) => {
            node.textContent = Math.floor(latest).toLocaleString()
          }
        })
      }
    }
  }, [inView, value, hasRun])

  return (
    <div className="text-center p-8 rounded-2xl border border-border relative group" style={{ background: "var(--surface-card)" }}>
      {/* Subtle hover border glow */}
      <div className="absolute inset-0 rounded-2xl border border-primary/0 group-hover:border-primary/40 transition-colors duration-500 pointer-events-none" />
      
      <div className="font-serif text-5xl md:text-6xl font-black text-primary mb-2">
        <span ref={nodeRef}>0</span>
        <span>{suffix}</span>
      </div>
      
      <div className="font-serif text-lg text-foreground font-medium mb-1">
        {title}
      </div>
      
      <div className="font-sans text-xs text-muted-foreground">
        {description}
      </div>
    </div>
  )
}

export function TrustMetrics() {
  return (
    <section className="py-20 px-4 relative overflow-hidden" style={{ background: "var(--surface-page)" }}>
      <div className="container mx-auto max-w-5xl relative z-10">
        
        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Counter 
            value={50} 
            suffix="+" 
            title="Happy Customers" 
            description="Verified premium members enjoying adaptogenic wellness." 
          />
          <Counter 
            value={20} 
            suffix="+" 
            title="Functional Ingredients" 
            description="Clean minerals, organic roots, and protein concentrates." 
          />
          <Counter 
            value={3} 
            suffix="" 
            title="Signature Products" 
            description="Crafted adaptogenic cookies tailored for mind, stamina, and recovery." 
          />
        </div>

      </div>
    </section>
  )
}
