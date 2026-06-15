import { motion } from "framer-motion"

export function BrandFilm() {
  return (
    <section className="relative h-[65vh] min-h-[450px] w-full flex items-center justify-center overflow-hidden" style={{ background: "var(--surface-page)" }}>
      
      {/* Cinematic Looping Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-60 scale-105 select-none pointer-events-none"
      >
        <source 
          src="https://assets.mixkit.co/videos/preview/mixkit-pouring-hot-chocolate-in-a-cup-widescreen-34423-large.mp4" 
          type="video/mp4" 
        />
        {/* Widescreen baking stock backup video */}
        <source 
          src="https://player.vimeo.com/external/494252666.hd.mp4?s=62c72b0c36746f39e31ccad837130985df2a16d5&profile_id=170&oauth2_token_id=57447761" 
          type="video/mp4" 
        />
      </video>

      {/* Cinematic Vignette Overlay */}
      <div 
        className="absolute inset-0 z-10 pointer-events-none" 
        style={{
          background: "radial-gradient(circle, transparent 35%, color-mix(in srgb, var(--surface-page) 40%, transparent) 70%, var(--surface-page) 100%)"
        }}
      />
      <div className="absolute inset-0 bg-black/10 z-10" />

      {/* Subtle Grain Overlay */}
      <div className="absolute inset-0 z-10 opacity-30 pointer-events-none grain" />

      {/* Text Overlay content */}
      <div className="relative z-20 text-center px-4 max-w-3xl">
        <motion.span
          initial={{ opacity: 0, letterSpacing: "0.1em" }}
          whileInView={{ opacity: 0.6, letterSpacing: "0.3em" }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="text-[10px] sm:text-xs uppercase font-sans font-bold text-foreground block mb-4"
        >
          KOFFEEKUP PHILOSOPHY
        </motion.span>
        
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-foreground font-normal leading-tight tracking-tight"
        >
          More Than <br />
          <span className="text-gradient-gold italic">A Cookie.</span>
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.6 }}
          className="w-16 h-0.5 bg-primary mx-auto mt-8 origin-center"
        />
      </div>

    </section>
  )
}
