import { Calendar, User, ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"

const ARTICLES = [
  {
    image: "https://images.unsplash.com/photo-1527799822367-a2505d993e51?q=80&w=400&auto=format&fit=crop",
    category: "Hair Wellness",
    date: "June 12, 2026",
    title: "Understanding Scalp Micro-Biome & Botanical Actives",
  },
  {
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=400&auto=format&fit=crop",
    category: "Skin Rituals",
    date: "June 08, 2026",
    title: "The Spa-at-Home Ritual: Restoring Skin Barrier Naturally",
  },
]

export function BlogEducation() {
  return (
    <section className="py-24 bg-white" style={{ borderTop: "1px solid rgba(200,169,107,0.12)" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
          <div>
            <span className="text-[11px] font-bold tracking-[0.26em] uppercase mb-4 block" style={{ color: "#C8A96B" }}>
              Education & Insight
            </span>
            <h2
              className="text-4xl md:text-5xl font-serif font-normal"
              style={{ color: "#1F4D3A" }}
            >
              Botanical Care & Education
            </h2>
          </div>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#1F4D3A] hover:text-[#C8A96B] transition-colors mt-4 md:mt-0"
          >
            Wellness Library <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {ARTICLES.map((article, i) => (
            <motion.article
              key={article.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="flex flex-col sm:flex-row bg-[#FDFBF7]/50 border border-slate-200/80 overflow-hidden group hover:border-[#C8A96B] transition-all"
            >
              <div className="sm:w-1/3 overflow-hidden relative aspect-video sm:aspect-square">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-bold tracking-widest uppercase text-[#C8A96B] mb-2 block">{article.category}</span>
                  <h3 className="text-lg font-serif font-semibold text-[#1F4D3A] group-hover:text-[#C8A96B] transition-colors line-clamp-2">{article.title}</h3>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-4">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{article.date}</span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
