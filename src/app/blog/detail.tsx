"use client"

import { useState, useEffect } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Calendar, User, ArrowLeft, Clock, Eye, Tag, BookOpen, Share2, ArrowRight } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useSeo } from "@/hooks/use-seo"
import { blogService, type BlogPost } from "@/services/blogService"

function coverUrl(src: string | null | undefined): string {
  const fallback = "https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?q=80&w=1200&auto=format&fit=crop"
  if (!src) return fallback
  if (src.startsWith("http") || src.startsWith("blob:")) return src
  return src.startsWith("/api") ? src : `/api${src}`
}

function formatDate(d: string | null): string {
  if (!d) return ""
  return new Date(d).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
}

export default function BlogDetailPage() {
  const { slug }   = useParams<{ slug: string }>()
  const navigate   = useNavigate()
  const [post, setPost]       = useState<BlogPost | null>(null)
  const [related, setRelated] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useSeo({
    pageType: "page",
    pageSlug: `blog-${slug}`,
    fallbackTitle: post ? `${post.title} — Aarvia` : "Blog — Aarvia",
    fallbackDescription: post?.excerpt ?? undefined,
  })

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    blogService.getBySlug(slug)
      .then(p => {
        setPost(p)
        // Load related posts from same category
        return blogService.getPublished({ category: p.category, limit: 4, offset: 0 })
      })
      .then(res => {
        setRelated(res.posts.filter(p => p.slug !== slug).slice(0, 3))
      })
      .catch(err => {
        if (err?.response?.status === 404) setNotFound(true)
      })
      .finally(() => setLoading(false))
  }, [slug])

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: post?.title, url: window.location.href }).catch(() => {})
    } else {
      navigator.clipboard.writeText(window.location.href).catch(() => {})
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen" style={{ background: "#FDFBF7" }}>
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4 text-[#1F4D3A]/40">
            <div className="w-10 h-10 border-2 border-[#C8A96B] border-t-transparent rounded-full animate-spin" />
            <p className="font-serif text-sm">Loading article…</p>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  if (notFound || !post) {
    return (
      <main className="min-h-screen" style={{ background: "#FDFBF7" }}>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-6">
          <BookOpen className="w-14 h-14 text-[#C8A96B]/40" />
          <h1 className="font-serif text-3xl text-[#1F4D3A]">Article Not Found</h1>
          <p className="text-[#1F4D3A]/55 text-center max-w-md">This article may have been removed or the link might be incorrect.</p>
          <Link to="/blog" className="flex items-center gap-2 px-6 py-3 bg-[#1F4D3A] text-white font-bold text-sm rounded-xl hover:bg-[#163829] transition-all">
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen" style={{ background: "#FDFBF7" }}>
      <Navbar />

      {/* Cover Image Hero */}
      <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        <img
          src={coverUrl(post.cover_image)}
          alt={post.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1F4D3A]/80 via-[#1F4D3A]/20 to-transparent" />

        {/* Back Button */}
        <div className="absolute top-6 left-6">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium transition-colors bg-black/20 hover:bg-black/30 backdrop-blur-sm px-3 py-2 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" /> Blog
          </Link>
        </div>
      </div>

      {/* Article Container */}
      <div className="max-w-4xl mx-auto px-6 lg:px-8 -mt-20 relative z-10 pb-20">

        {/* Article Card */}
        <motion.article
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white rounded-3xl border border-[#C8A96B]/15 shadow-2xl shadow-[#1F4D3A]/10 overflow-hidden"
        >
          <div className="p-8 md:p-12">
            {/* Meta Top */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="text-[10px] font-black uppercase tracking-[0.18em] px-3 py-1 rounded-full" style={{ background: "rgba(200,169,107,0.12)", color: "#C8A96B", border: "1px solid rgba(200,169,107,0.3)" }}>
                {post.category}
              </span>
              {post.featured && (
                <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-[#1F4D3A]/5 text-[#1F4D3A] border border-[#1F4D3A]/10">
                  ★ Featured
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-[#1F4D3A] leading-tight mb-6">
              {post.title}
            </h1>

            {/* Author / Date / Stats row */}
            <div className="flex flex-wrap items-center gap-5 text-sm text-[#1F4D3A]/55 pb-6 border-b border-[#C8A96B]/15 mb-8">
              <span className="flex items-center gap-1.5 font-semibold">
                <div className="w-7 h-7 rounded-full bg-[#1F4D3A]/10 flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-[#1F4D3A]/60" />
                </div>
                {post.author}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#C8A96B]" />
                {formatDate(post.published_at)}
              </span>
              {post.read_time && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#C8A96B]" />
                  {post.read_time} min read
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-[#C8A96B]" />
                {post.views} views
              </span>
              <button
                onClick={handleShare}
                className="ml-auto flex items-center gap-1.5 text-[#1F4D3A]/50 hover:text-[#C8A96B] transition-colors text-xs font-bold uppercase tracking-wider"
              >
                <Share2 className="w-3.5 h-3.5" /> Share
              </button>
            </div>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-lg font-serif text-[#1F4D3A]/70 leading-relaxed mb-8 italic border-l-4 border-[#C8A96B]/30 pl-5">
                {post.excerpt}
              </p>
            )}

            {/* Body Content */}
            {post.content ? (
              <div
                className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-[#1F4D3A] prose-p:text-[#1F4D3A]/70 prose-p:leading-relaxed prose-a:text-[#C8A96B] prose-a:no-underline hover:prose-a:underline prose-strong:text-[#1F4D3A] prose-li:text-[#1F4D3A]/70 prose-blockquote:border-[#C8A96B] prose-blockquote:text-[#1F4D3A]/60 prose-img:rounded-2xl"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            ) : (
              <p className="text-[#1F4D3A]/40 italic">No content available.</p>
            )}

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-12 pt-8 border-t border-[#C8A96B]/15">
                <Tag className="w-4 h-4 text-[#C8A96B]" />
                {post.tags.map(tag => (
                  <span key={tag} className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full cursor-pointer transition-all hover:bg-[#1F4D3A]/5"
                    style={{ background: "rgba(200,169,107,0.08)", color: "#C8A96B", border: "1px solid rgba(200,169,107,0.2)" }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </motion.article>

        {/* Related Posts */}
        {related.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mt-16"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-2xl text-[#1F4D3A]">More in {post.category}</h2>
              <Link to="/blog" className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#C8A96B] hover:text-[#1F4D3A] transition-colors">
                All Articles <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-3 gap-5">
              {related.map(r => (
                <Link key={r.id} to={`/blog/${r.slug}`} className="group block bg-white border border-[#C8A96B]/15 rounded-2xl overflow-hidden hover:border-[#C8A96B] hover:shadow-md transition-all duration-300">
                  <div className="overflow-hidden aspect-video">
                    <img src={coverUrl(r.cover_image)} alt={r.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <div className="p-4">
                    <p className="text-[9px] font-black uppercase tracking-wider text-[#C8A96B] mb-1.5">{r.category}</p>
                    <h3 className="font-serif text-sm text-[#1F4D3A] line-clamp-2 group-hover:text-[#C8A96B] transition-colors leading-snug">{r.title}</h3>
                    {r.read_time && <p className="text-[10px] text-[#1F4D3A]/40 mt-1.5">{r.read_time} min read</p>}
                  </div>
                </Link>
              ))}
            </div>
          </motion.section>
        )}

        {/* Back to Blog CTA */}
        <div className="flex justify-center mt-12">
          <Link to="/blog" className="flex items-center gap-2 px-7 py-3.5 border-2 border-[#1F4D3A] text-[#1F4D3A] font-bold text-sm uppercase tracking-wider rounded-xl hover:bg-[#1F4D3A] hover:text-white transition-all duration-300">
            <ArrowLeft className="w-4 h-4" /> Back to Wellness Library
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  )
}
