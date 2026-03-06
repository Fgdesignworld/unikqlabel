

import { motion } from "framer-motion"
import { Check, Heart, Leaf, Sparkles, Utensils } from "lucide-react"
import { Image } from "@/components/ui/image"

const features = [
  { icon: Heart, text: "100% Homemade" },
  { icon: Leaf, text: "No Preservatives" },
  { icon: Sparkles, text: "Traditional Andhra Flavors" },
  { icon: Utensils, text: "Fresh Ingredients" },
]

export function TraditionSection() {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-[#1a1410] to-[#0f0f0f]">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
              <Image
                src="/images/tradition.jpg"
                alt="Traditional food preparation"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-[#0f0f0f]/60 to-transparent" />
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute -top-4 -left-4 w-24 h-24 border-t-4 border-l-4 border-[#d97706]/30 rounded-tl-2xl" />
            <div className="absolute -bottom-4 -right-4 w-24 h-24 border-b-4 border-r-4 border-[#d97706]/30 rounded-br-2xl" />
            
            {/* Floating Badge */}
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="absolute -right-4 md:-right-8 bottom-8 glass px-6 py-4 rounded-xl border border-[#d97706]/30"
            >
              <p className="text-[#f59e0b] font-serif text-3xl font-bold">25+</p>
              <p className="text-[#fef3e2]/80 text-sm">Years of Tradition</p>
            </motion.div>
          </motion.div>

          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-[#d97706] text-sm font-medium tracking-wider uppercase">Our Story</span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#fef3e2] mt-2 mb-6">
              Our Tradition
            </h2>
            
            <p className="text-lg text-[#fef3e2]/80 leading-relaxed mb-8">
              At <span className="text-[#f59e0b] font-semibold">Lakshmi Home Foods</span>, we prepare every product with 
              authentic homemade recipes passed through generations. Our commitment to quality and tradition ensures 
              that every bite takes you back to the warmth of a traditional Andhra kitchen.
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.text}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-center gap-4 p-4 glass rounded-xl border border-[#d97706]/20"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#d97706]/10 flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-[#d97706]" />
                  </div>
                  <span className="text-[#fef3e2] font-medium">{feature.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
