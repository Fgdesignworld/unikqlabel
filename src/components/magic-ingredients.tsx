import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

export function MagicIngredients() {
  const [activeIdx, setActiveIdx] = useState(0)

  const slides = [
    { id: 1, tube: "/images/g1.png", ring: "/images/gr1.png", name: "Shilajit Cookies" },
    { id: 2, tube: "/images/g2.png", ring: "/images/gr2.png", name: "Ashwagandha Cookies" },
    { id: 3, tube: "/images/g3.png", ring: "/images/gr3.png", name: "Protein Cookies" }
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIdx(prev => (prev + 1) % slides.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="py-12 sm:py-16 lg:py-20 px-4 relative overflow-hidden bg-[#F2ECE0] border-b border-[#D4C3A3]/30 min-h-[500px] flex items-center">
      {/* Decorative Elements (Patterns as in Screenshot) */}
      
      {/* Left border frame line */}
      <div className="absolute left-8 top-10 bottom-10 w-px bg-[#7A5B20]/15" />
      <div className="absolute left-8 top-10 w-36 h-px bg-[#7A5B20]/15" />

      {/* Large soft background circles */}
      <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-[#E5DCC9] opacity-40 pointer-events-none" />
      <div className="absolute left-1/3 bottom-0 w-48 h-24 bg-[#E5DCC9] opacity-35 rounded-t-full pointer-events-none" />
      
      {/* Left grid dots */}
      <div className="absolute left-14 top-16 opacity-30 hidden sm:block">
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#7A5B20]" />
          ))}
        </div>
      </div>

      {/* Diagonal Stripes (Top Right/Middle) */}
      <div 
        className="absolute left-[38%] top-10 w-28 h-12 opacity-35 hidden md:block" 
        style={{
          backgroundImage: "repeating-linear-gradient(45deg, #7A5B20, #7A5B20 1px, transparent 1px, transparent 10px)",
        }}
      />

      <div className="container mx-auto max-w-7xl relative z-10 w-full font-sans">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Side: Static Text Heading (Large, Bold & Gold - matching screenshot) */}
          <div className="lg:col-span-5 space-y-4 pl-8 sm:pl-16 relative z-10">
            <span className="text-sm sm:text-base uppercase tracking-[0.2em] text-neutral-800 font-extrabold block font-sans">
              KoffeeKup
            </span>
            <h2 className="font-sans text-4xl sm:text-5xl lg:text-6xl font-bold text-[#A57E37] leading-tight tracking-tight">
              Our Magic <br />
              Ingredients
            </h2>
            <div className="w-16 h-0.5 bg-[#A57E37]/30 mt-6" />
          </div>

          {/* Right Side: Interactive Sliding Product Showcase (Visible More/Larger) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center relative min-h-[360px] sm:min-h-[460px] lg:min-h-[500px] w-full">
            
            {/* Background patterns specific to the right arena */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 opacity-25">
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#7A5B20]" />
                ))}
              </div>
            </div>

            <div className="relative w-[340px] h-[340px] sm:w-[480px] sm:h-[480px] md:w-[540px] md:h-[540px] lg:w-[600px] lg:h-[600px] xl:w-[660px] xl:h-[660px] flex items-center justify-center">
              
              <AnimatePresence mode="wait">
                {slides.map((slide, idx) => {
                  if (idx !== activeIdx) return null

                  return (
                    <motion.div
                      key={slide.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.05 }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      {/* Rotating Ring Image (gr1/gr2/gr3) */}
                      <div className="absolute inset-0 w-full h-full flex items-center justify-center">
                        <img
                          src={slide.ring}
                          alt={`${slide.name} Ring`}
                          className="w-full h-full object-contain object-center origin-center select-none pointer-events-none animate-[spin_55s_linear_infinite]"
                          style={{
                            filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.06))"
                          }}
                        />
                      </div>

                      {/* Constant/Floating Product Tube Image (g1/g2/g3) */}
                      <div className="absolute inset-0 w-full h-full flex items-center justify-center z-10">
                        <motion.img
                          initial={{ y: 18, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -18, opacity: 0 }}
                          transition={{ delay: 0.1, duration: 0.5 }}
                          src={slide.tube}
                          alt={slide.name}
                          className="w-[88%] h-[88%] sm:w-[92%] sm:h-[92%] object-contain object-center origin-center select-none pointer-events-none"
                          style={{
                            filter: "drop-shadow(0 20px 45px rgba(0,0,0,0.18))"
                          }}
                        />
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>

          </div>

        </div>
      </div>
    </section>
  )
}
