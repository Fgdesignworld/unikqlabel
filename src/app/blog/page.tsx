import { motion } from "framer-motion"
import { Calendar, User, ArrowRight, BookOpen } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PageHeader } from "@/components/page-header"
import { useSeo } from "@/hooks/use-seo"

const ARTICLES = [
  {
    image: "https://images.unsplash.com/photo-1527799822367-a2505d993e51?q=80&w=600&auto=format&fit=crop",
    category: "Hair Wellness",
    date: "June 12, 2026",
    author: "Dr. Evelyn Ross",
    title: "Understanding Scalp Micro-Biome & Botanical Actives",
    excerpt: "Discover why a healthy scalp is the foundation of hair vitality, and how pure botanical oils like rosemary and ginger root extract activate hair health.",
  },
  {
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=600&auto=format&fit=crop",
    category: "Skin Rituals",
    date: "June 08, 2026",
    author: "Elena Vance",
    title: "The Spa-at-Home Ritual: Restoring Skin Barrier Naturally",
    excerpt: "Modern life compromises our skin. Learn the gentle step-by-step bathing and oil application rituals that lock in natural lipids.",
  },
  {
    image: "https://images.unsplash.com/photo-1515488042361-404e9250afef?q=80&w=600&auto=format&fit=crop",
    category: "Pure Ingredients",
    date: "June 02, 2026",
    author: "Marcus Thorne",
    title: "Cold-Pressed vs. Synthesized: Why Provance Matters",
    excerpt: "Not all natural ingredients are equal. We explore how plant extraction temperature impacts cosmetic efficacy and sustainability.",
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  }),
}

export default function BlogPage() {
  useSeo({ pageType: "page", pageSlug: "blog", fallbackTitle: "Wellness Library — Aarvia" })

  return (
    <main className="min-h-screen" style={{ background: "#F7F4ED" }}>
      <Navbar />
      <PageHeader
        title="The Wellness Library"
        subtitle="Educational articles, plant science guides, and wellness rituals crafted by our beauty and sustainability experts."
        backgroundImage="https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?q=80&w=1200&auto=format&fit=crop"
      />

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col items-center mb-16 text-center">
            <BookOpen className="w-8 h-8 text-[#C8A96B] mb-3" />
            <p className="text-[11px] font-bold tracking-[0.26em] uppercase mb-2" style={{ color: "#C8A96B" }}>
              Education & Insight
            </p>
            <h2 className="text-4xl md:text-5xl font-serif font-normal text-[#1F4D3A]">
              Care Inspired by Plant Science
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {ARTICLES.map((article, i) => (
              <motion.article
                key={article.title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="flex flex-col bg-white overflow-hidden border border-slate-200/80 group transition-all duration-300 hover:border-[#C8A96B]"
              >
                {/* Image panel */}
                <div className="overflow-hidden aspect-video relative">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <span
                    className="absolute top-4 left-4 text-[10px] font-bold tracking-widest uppercase px-3 py-1 bg-[#F7F4ED] text-[#1F4D3A]"
                    style={{ border: "1px solid rgba(200,169,107,0.3)" }}
                  >
                    {article.category}
                  </span>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Meta */}
                    <div className="flex items-center gap-4 text-[11px] text-gray-500 mb-4 font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {article.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {article.author}
                      </span>
                    </div>

                    <h3
                      className="text-xl font-serif font-semibold text-[#1F4D3A] mb-3 leading-snug group-hover:text-[#C8A96B] transition-colors"
                    >
                      {article.title}
                    </h3>
                    <p
                      className="text-sm leading-relaxed text-[#7A7A72] mb-6"
                      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                      {article.excerpt}
                    </p>
                  </div>

                  <button
                    className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#1F4D3A] group-hover:text-[#C8A96B] transition-colors"
                  >
                    Read Article <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
