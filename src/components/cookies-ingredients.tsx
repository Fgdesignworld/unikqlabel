import { motion } from "framer-motion"

export function CookiesIngredients() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 px-4 relative overflow-hidden bg-[#F2ECE0] border-b border-[#D4C3A3]/30 min-h-[500px] flex items-center">
      {/* Left border frame line */}
      <div className="absolute left-8 top-10 bottom-10 w-px bg-[#7A5B20]/15" />
      <div className="absolute left-8 top-10 w-36 h-px bg-[#7A5B20]/15" />

      {/* Large soft background circles */}
      <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-[#E5DCC9] opacity-40 pointer-events-none" />
      <div className="absolute left-1/3 bottom-0 w-48 h-24 bg-[#E5DCC9] opacity-35 rounded-t-full pointer-events-none" />
      <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-[#E5DCC9] opacity-30 pointer-events-none" />

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
          
          {/* Left Side: Static Text Heading (Large, Bold & Gold) */}
          <div className="lg:col-span-5 space-y-4 pl-8 sm:pl-16 relative z-10">
            <span className="text-sm sm:text-base uppercase tracking-[0.2em] text-neutral-800 font-extrabold block font-sans">
              KoffeeKup
            </span>
            <h2 className="font-sans text-4xl sm:text-5xl lg:text-6xl font-bold text-[#A57E37] leading-tight tracking-tight">
              Cookies <br />
              Ingredients
            </h2>
            <div className="w-16 h-0.5 bg-[#A57E37]/30 mt-6" />
          </div>

          {/* Right Side: Rotating Ring & Ingredients Collage Image */}
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
              
              {/* Rotating Ring Image (using gr1.png) */}
              <div className="absolute inset-0 w-full h-full flex items-center justify-center">
                <img
                  src="/images/gr1.png"
                  alt="Background Rotating Ring"
                  className="w-[90%] h-[90%] object-contain object-center origin-center select-none pointer-events-none animate-[spin_55s_linear_infinite]"
                  style={{
                    filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.06))"
                  }}
                />
              </div>

              {/* Main pv2.png static image on top */}
              <div className="absolute inset-0 w-full h-full flex items-center justify-center z-10">
                <motion.img
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  src="/images/pv2.png"
                  alt="KoffeeKup Cookies Ingredients Collage"
                  className="w-[90%] h-[90%] object-contain object-center origin-center select-none pointer-events-none"
                  style={{
                    filter: "drop-shadow(0 20px 45px rgba(0,0,0,0.18))"
                  }}
                />
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  )
}
