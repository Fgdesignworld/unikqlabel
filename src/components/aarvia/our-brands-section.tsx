import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"

export function OurBrandsSection() {
  return (
    <section id="brands" className="py-24 lg:py-32 bg-[#FDFBF7] overflow-hidden border-t border-[#C8A96B]/15">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        <div className="text-center mb-16 md:mb-24">
          <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#C8A96B] block mb-4">
            Our Brands
          </span>
          <h2 className="font-serif text-4xl md:text-5xl text-[#1F4D3A] font-light leading-tight">
            Thoughtfully Crafted <br className="hidden md:block" /> for Better Living
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
          {/* ORVIV Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="group relative overflow-hidden rounded-[2rem] shadow-xl flex flex-col h-full bg-[#1F4D3A]"
          >
            <div className="relative h-80 overflow-hidden shrink-0">
              <img
                src="https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?q=80&w=800&auto=format&fit=crop"
                alt="Orviv Home Wellness"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-black/20" />
            </div>
            
            <div className="flex flex-col flex-1 p-10 lg:p-12 text-[#FDFBF7]">
              <div className="mb-8">
                <h3 className="font-serif text-4xl lg:text-5xl mb-2 text-[#C8A96B]">ORVIV</h3>
                <p className="text-xs font-bold tracking-[0.3em] uppercase opacity-80">Home Wellness</p>
              </div>
              
              <div className="flex-1 space-y-4">
                <h4 className="text-2xl font-serif italic text-[#C8A96B]">Inspired by Nature.<br/>Crafted for Life.</h4>
                <p className="text-base font-sans font-light leading-relaxed opacity-90">
                  Helping create cleaner, healthier, and more beautiful homes through thoughtfully designed products.
                </p>
              </div>
              
              <div className="mt-10">
                <Link to="/orviv" className="inline-flex items-center gap-4 text-xs font-bold tracking-[0.2em] uppercase text-[#FDFBF7] hover:text-[#C8A96B] transition-colors group/btn">
                  Explore ORVIV
                  <ArrowRight className="w-4 h-4 text-[#C8A96B] group-hover/btn:translate-x-2 transition-transform duration-500" strokeWidth={1.5} />
                </Link>
              </div>
            </div>
          </motion.div>

          {/* AARVIA Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="group relative overflow-hidden rounded-[2rem] shadow-xl flex flex-col h-full bg-[#F5F2EC] border border-[#C8A96B]/20"
          >
            <div className="relative h-80 overflow-hidden shrink-0">
              <img
                src="https://images.unsplash.com/photo-1614859664551-7c9eb1a6f0fa?q=80&w=800&auto=format&fit=crop"
                alt="Aarvia Personal Care"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-black/10" />
            </div>
            
            <div className="flex flex-col flex-1 p-10 lg:p-12 text-[#1F4D3A]">
              <div className="mb-8">
                <h3 className="font-serif text-4xl lg:text-5xl mb-2 text-[#C8A96B]">AARVIA</h3>
                <p className="text-xs font-bold tracking-[0.3em] uppercase opacity-80">Personal Care</p>
              </div>
              
              <div className="flex-1 space-y-4">
                <h4 className="text-2xl font-serif italic text-[#C8A96B]">Naturally You.</h4>
                <p className="text-base font-sans font-light leading-relaxed opacity-90">
                  Gentle personal care inspired by nature for everyday wellbeing.
                </p>
              </div>
              
              <div className="mt-10">
                <Link to="/aarvia" className="inline-flex items-center gap-4 text-xs font-bold tracking-[0.2em] uppercase text-[#1F4D3A] hover:text-[#C8A96B] transition-colors group/btn">
                  Explore AARVIA
                  <ArrowRight className="w-4 h-4 text-[#C8A96B] group-hover/btn:translate-x-2 transition-transform duration-500" strokeWidth={1.5} />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  )
}
