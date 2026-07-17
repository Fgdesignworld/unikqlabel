"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

export function PhilosophySection() {
  return (
    <section className="py-24 lg:py-32 bg-[#FDFBF7] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-stretch">
          
          {/* Left: Visual */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="relative h-full min-h-[400px]"
          >
            <div className="h-full w-full relative overflow-hidden rounded-bl-[4rem] rounded-tr-[4rem] shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200&auto=format&fit=crop"
                alt="Aarvia Botanical Philosophy"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-[#1F4D3A]/20 pointer-events-none mix-blend-multiply" />
            </div>
            {/* Decorative Gold Accent */}
            <div className="absolute -bottom-6 -left-6 w-32 h-32 border border-[#C8A96B]/40 rounded-full pointer-events-none" />
            <div className="absolute -top-6 -right-6 w-24 h-24 border border-[#C8A96B]/40 rounded-full pointer-events-none" />
          </motion.div>

          {/* Right: Content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-8"
          >
            <div>
              <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#C8A96B] block mb-4">
                Our Philosophy
              </span>
              <h2 className="font-serif text-4xl md:text-5xl text-[#1F4D3A] font-light leading-[1.1] mb-6">
                A Simple Belief
              </h2>
            </div>

            <div className="space-y-6 text-[#6B6B60] font-sans font-light leading-relaxed">
              <p className="text-xl leading-relaxed">
                We believe the products we bring into our homes should be safe, beautifully designed, effective, and created with respect for people and the planet.
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
