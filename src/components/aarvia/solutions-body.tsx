import { motion } from "framer-motion"
import { Sparkles, Send, Mail } from "lucide-react"
import { useState } from "react"

export function SolutionsBody() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      setSubmitted(true)
      setEmail("")
    }
  }

  return (
    <section className="py-24" style={{ background: "#FDFBF7", borderTop: "1px solid rgba(200,169,107,0.12)" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - text content */}
          <div>
            <span className="text-[11px] font-bold tracking-[0.26em] uppercase mb-4 block" style={{ color: "#C8A96B" }}>
              Future Releases
            </span>
            <h2
              className="text-4xl md:text-5xl font-serif font-normal mb-6 leading-tight"
              style={{ color: "#1F4D3A" }}
            >
              Coming Soon<br />
              <span className="italic" style={{ color: "#C8A96B" }}>Personal Care Collections</span>
            </h2>
            <p
              className="text-base leading-relaxed mb-8 max-w-xl"
              style={{ color: "#6A6A60", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Our research team is carefully crafting pure botanical formulations for your daily self-care rituals. Launching soon to elevate your wellness journey.
            </p>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {[
                { title: "Hair Care", items: ["Shampoo", "Hair Oil"], emoji: "🌿" },
                { title: "Skin Care", items: ["Face Wash", "Herbal Soap"], emoji: "✨" },
                { title: "Bath Care", items: ["Body Wash"], emoji: "🧼" },
              ].map((cat, idx) => (
                <div key={idx} className="p-5 bg-white border border-[#C8A96B]/20 rounded-2xl shadow-sm">
                  <span className="text-2xl mb-2 block">{cat.emoji}</span>
                  <h4 className="font-serif font-semibold text-base mb-2" style={{ color: "#1F4D3A" }}>{cat.title}</h4>
                  <ul className="space-y-1">
                    {cat.items.map((item, i) => (
                      <li key={i} className="text-xs text-[#6A6A60] flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-[#C8A96B]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Newsletter input inside section */}
            <div className="max-w-md">
              {submitted ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-[#1F4D3A]/5 border border-[#1F4D3A]/10 rounded-xl">
                  <p className="text-xs font-semibold" style={{ color: "#1F4D3A" }}>✨ Thank you! You've joined our personal care VIP list.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1F4D3A]/40" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="w-full bg-white border border-[#C8A96B]/35 rounded-full pl-11 pr-4 py-3 text-xs focus:outline-none focus:border-[#1F4D3A] transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer hover:shadow-md"
                    style={{ background: "#1F4D3A", color: "#FDFBF7" }}
                  >
                    Subscribe <Send className="w-3 h-3" />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right - image block */}
          <motion.div
            initial={{ opacity: 0, x: 45 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden aspect-[4/3] border rounded-3xl shadow-xl"
            style={{ borderColor: "rgba(200,169,107,0.15)" }}
          >
            <img
              src="https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=800&auto=format&fit=crop"
              alt="Botanical Personal Care Preview"
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1F4D3A]/20 to-transparent pointer-events-none" />
            <div className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-white/95 text-[#1F4D3A] backdrop-blur-md shadow-sm border border-[#C8A96B]/30">
              <Sparkles className="w-3 h-3 text-[#C8A96B]" /> Pure botanicals coming soon
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
