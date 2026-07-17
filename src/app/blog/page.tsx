"use client"

import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Calendar, User, ArrowRight, BookOpen, Search, Clock, Eye, Loader2, X } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PageHeader } from "@/components/page-header"
import { useSeo } from "@/hooks/use-seo"
import { blogService, type BlogPost } from "@/services/blogService"

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  }),
}

function coverUrl(src: string | null | undefined): string {
  const fallback = "https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?q=80&w=800&auto=format&fit=crop"
  if (!src) return fallback
  if (src.startsWith("http") || src.startsWith("blob:")) return src
  return src.startsWith("/api") ? src : `/api${src}`
}

function formatDate(d: string | null): string {
  if (!d) return ""
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
}

const PER_PAGE = 15

export default function BlogPage() {
  useSeo({ pageType: "page", pageSlug: "blog", fallbackTitle: "Wellness Library — Aarvia" })

  const [posts, setPosts]     = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [search, setSearch]   = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [category, setCategory] = useState("")
  const [categories, setCategories] = useState<string[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [pg, setPg]           = useState(0)

  const loaderRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    blogService.getCategories().then(setCategories).catch(() => {})
  }, [])

  useEffect(() => {
    setPg(0); setPosts([]); setLoading(true)
    blogService.getPublished({ category: category || undefined, search: debouncedSearch || undefined, limit: PER_PAGE, offset: 0 })
      .then(res => { setPosts(res.posts); setHasMore(res.has_more) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [category, debouncedSearch])

  const loadMore = () => {
    if (loadingMore || !hasMore) return
    const next = pg + 1; setLoadingMore(true)
    blogService.getPublished({ category: category || undefined, search: debouncedSearch || undefined, limit: PER_PAGE, offset: next * PER_PAGE })
      .then(res => { setPosts(prev => [...prev, ...res.posts]); setHasMore(res.has_more); setPg(next) })
      .catch(() => {})
      .finally(() => setLoadingMore(false))
  }

  // Automatic Lazy Load Scroll Observer
  useEffect(() => {
    if (loading || !hasMore || loadingMore) return

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    const currentLoader = loaderRef.current
    if (currentLoader) {
      observer.observe(currentLoader)
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader)
      }
    }
  }, [loading, hasMore, loadingMore, pg, category, debouncedSearch])

  const featuredPost = posts.find(p => p.featured) ?? null
  const gridPosts    = featuredPost ? posts.filter(p => p.id !== featuredPost.id) : posts

  return (
    <main className="min-h-screen" style={{ background: "#FDFBF7" }}>
      <Navbar />
      <PageHeader
        title="The Wellness Library"
        subtitle="Educational articles, natural home care tips, and wellness guides crafted by our home care experts."
        backgroundImage="/images/wellness_library_hero.png"
      />

      <section className="py-16 relative overflow-hidden">
        {/* Soft decorative background blobs */}
        <div className="absolute top-[10%] -left-48 w-96 h-96 rounded-full blur-3xl bg-[#C8A96B]/5 pointer-events-none" />
        <div className="absolute bottom-[30%] -right-48 w-[450px] h-[450px] rounded-full blur-3xl bg-[#1F4D3A]/5 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">

          {/* Search + Category Tabs */}
          <div className="max-w-3xl mx-auto mb-16 space-y-6">
            {/* Search Input Box */}
            <div className="relative rounded-2xl bg-white border border-[#C8A96B]/15 p-1.5 shadow-[0_4px_20px_rgba(31,77,58,0.02)] focus-within:border-[#C8A96B]/40 focus-within:shadow-[0_8px_30px_rgba(31,77,58,0.06)] transition-all duration-500">
              <div className="flex items-center">
                <Search className="w-4 h-4 text-[#C8A96B]/70 ml-3.5 shrink-0" />
                <input 
                  type="text" 
                  placeholder="Search articles, ingredients, wellness tips..." 
                  value={search} 
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-3 pr-4 py-2.5 bg-transparent text-sm text-[#1F4D3A] placeholder-[#1F4D3A]/30 focus:outline-none transition-all" 
                />
                {search && (
                  <button 
                    onClick={() => setSearch("")} 
                    className="p-1.5 rounded-full hover:bg-slate-100 text-[#1F4D3A]/40 hover:text-[#1F4D3A] transition-colors mr-2 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Category Pills */}
            {categories.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                <button
                  onClick={() => setCategory("")}
                  className={`px-4.5 py-2 text-[10px] font-bold uppercase tracking-wider rounded-full border transition-all duration-300 cursor-pointer ${
                    category === ""
                      ? "bg-[#1F4D3A] border-[#1F4D3A] text-[#FDFBF7] shadow-md shadow-[#1F4D3A]/10"
                      : "bg-white border-[#C8A96B]/20 text-[#1F4D3A] hover:bg-[#FAF8F5] hover:border-[#C8A96B]/50"
                  }`}
                >
                  All Categories
                </button>
                {categories.map(c => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`px-4.5 py-2 text-[10px] font-bold uppercase tracking-wider rounded-full border transition-all duration-300 cursor-pointer ${
                      category === c
                        ? "bg-[#1F4D3A] border-[#1F4D3A] text-[#FDFBF7] shadow-md shadow-[#1F4D3A]/10"
                        : "bg-white border-[#C8A96B]/20 text-[#1F4D3A] hover:bg-[#FAF8F5] hover:border-[#C8A96B]/50"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          {loading && (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 animate-spin text-[#C8A96B]" />
            </div>
          )}

          {!loading && posts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-[#1F4D3A]/40 bg-white border border-[#C8A96B]/15 rounded-3xl p-8 max-w-2xl mx-auto shadow-sm">
              <BookOpen className="w-12 h-12 text-[#C8A96B]/50" />
              <p className="text-xl font-medium" style={{ fontFamily: "'Cormorant Garamond', serif" }}>No articles found matching filters</p>
              {(search || category) && (
                <button 
                  onClick={() => { setSearch(""); setCategory("") }} 
                  className="text-xs font-bold uppercase tracking-widest text-[#C8A96B] hover:text-[#1F4D3A] transition-colors cursor-pointer border-b border-[#C8A96B] pb-0.5 mt-2"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}

          {/* Featured Post */}
          {!loading && featuredPost && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} 
              className="mb-14"
            >
              <Link 
                to={`/blog/${featuredPost.slug}`} 
                className="group block bg-white border border-[#C8A96B]/15 rounded-3xl overflow-hidden hover:border-[#C8A96B]/35 hover:shadow-2xl transition-all duration-500"
              >
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="overflow-hidden aspect-[16/10] md:aspect-auto">
                    <img 
                      src={coverUrl(featuredPost.cover_image)} 
                      alt={featuredPost.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103" 
                    />
                  </div>
                  <div className="flex flex-col justify-between p-8 lg:p-12 min-h-[350px]">
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border border-[#C8A96B]/30 text-[#C8A96B] bg-[#C8A96B]/5">
                          ★ Featured
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-[#1F4D3A]/5 text-[#1F4D3A]">
                          {featuredPost.category}
                        </span>
                      </div>
                      <h3 
                        className="text-2xl lg:text-3.5xl text-[#1F4D3A] mb-4 leading-tight group-hover:text-[#C8A96B] transition-colors"
                        style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}
                      >
                        {featuredPost.title}
                      </h3>
                      {featuredPost.excerpt && (
                        <p className="text-sm leading-relaxed text-[#555555] mb-6 line-clamp-3">
                          {featuredPost.excerpt}
                        </p>
                      )}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-[#6B6B6B] mb-6 border-t border-[#1F4D3A]/5 pt-4">
                        <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-[#C8A96B]" />{featuredPost.author}</span>
                        <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-[#C8A96B]" />{formatDate(featuredPost.published_at)}</span>
                        {featuredPost.read_time && <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-[#C8A96B]" />{featuredPost.read_time} min read</span>}
                        <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5 text-[#C8A96B]" />{featuredPost.views} views</span>
                      </div>
                      <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#1F4D3A] group-hover:text-[#C8A96B] transition-colors">
                        Read Article <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          )}

          {/* Grid */}
          {!loading && gridPosts.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {gridPosts.map((post, i) => (
                <motion.article 
                  key={post.id} 
                  custom={i} 
                  variants={fadeUp} 
                  initial="hidden" 
                  whileInView="visible" 
                  viewport={{ once: true }}
                >
                  <Link 
                    to={`/blog/${post.slug}`} 
                    className="group flex flex-col bg-white overflow-hidden border border-[#C8A96B]/15 rounded-3xl hover:border-[#C8A96B]/30 hover:shadow-xl transition-all duration-300 h-full"
                  >
                    <div className="overflow-hidden aspect-[16/10] relative">
                      <img 
                        src={coverUrl(post.cover_image)} 
                        alt={post.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103" 
                      />
                      <span className="absolute top-3 left-3 text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm" style={{ background: "rgba(253,251,247,0.95)", color: "#1F4D3A", border: "1px solid rgba(200,169,107,0.2)" }}>
                        {post.category}
                      </span>
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2.5 text-[10px] text-[#6B6B6B] mb-3">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-[#C8A96B]" />{formatDate(post.published_at)}</span>
                          <span className="flex items-center gap-1"><User className="w-3 h-3 text-[#C8A96B]" />{post.author}</span>
                          {post.read_time && <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-[#C8A96B]" />{post.read_time} min</span>}
                        </div>
                        <h3 
                          className="text-lg md:text-[19px] text-[#1F4D3A] mb-3 leading-snug group-hover:text-[#C8A96B] transition-colors line-clamp-2"
                          style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}
                        >
                          {post.title}
                        </h3>
                        {post.excerpt && (
                          <p className="text-xs leading-relaxed text-[#555555] mb-4 line-clamp-2">
                            {post.excerpt}
                          </p>
                        )}
                      </div>
                      <div className="mt-4">
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {post.tags.slice(0, 3).map(tag => (
                              <span 
                                key={tag} 
                                className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" 
                                style={{ background: "rgba(200,169,107,0.06)", color: "#C8A96B", border: "1px solid rgba(200,169,107,0.15)" }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#1F4D3A] group-hover:text-[#C8A96B] transition-colors">
                          Read Article <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          )}

          {/* Lazy Load Trigger element */}
          <div ref={loaderRef} className="h-20 flex items-center justify-center mt-12">
            {loadingMore && (
              <Loader2 className="w-6 h-6 animate-spin text-[#C8A96B]" />
            )}
          </div>

        </div>
      </section>

      <Footer />
    </main>
  )
}

