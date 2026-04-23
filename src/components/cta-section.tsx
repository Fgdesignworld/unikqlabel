import { motion } from "framer-motion"
import { Crown, Sparkles, ArrowRight } from "lucide-react"
import { Link } from 'react-router-dom';

export function CTASection() {
  return (
    <section className="py-10 px-4 relative overflow-hidden" style={{ background: 'var(--surface-page)' }}>
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-72 h-72 rounded-full blur-3xl opacity-20"
          style={{ background: 'radial-gradient(circle, var(--theme-color), transparent)' }} />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full blur-3xl opacity-10"
          style={{ background: 'radial-gradient(circle, var(--theme-color), transparent)' }} />
      </div>

      <div className="container mx-auto max-w-4xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative rounded-3xl p-10 md:p-20 text-center overflow-hidden"
          style={{
            background: 'rgba(20,18,14,0.7)',
            border: '1px solid rgba(212,175,55,0.18)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 40px 100px rgba(0,0,0,0.6), inset 0 1px 0 rgba(212,175,55,0.10)',
          }}
        >
          {/* Sparkle corners */}
          <Sparkles className="absolute top-6 left-6 w-6 h-6 opacity-20 text-amber-500" />
          <Sparkles className="absolute top-6 right-6 w-6 h-6 opacity-20 text-amber-500" />
          <Sparkles className="absolute bottom-6 left-6 w-6 h-6 opacity-20 text-amber-500" />
          <Sparkles className="absolute bottom-6 right-6 w-6 h-6 opacity-20 text-amber-500" />

          {/* Crown icon */}
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.05))', border: '1px solid rgba(212,175,55,0.3)' }}
          >
            <Crown className="w-7 h-7 text-amber-500" />
          </motion.div>

          <span className="section-badge mb-5 inline-block">Limited Edition</span>

          <h2 className="font-heading text-4xl md:text-6xl font-black mt-2 mb-5 leading-tight" style={{ color: 'var(--text-primary)' }}>
            Rule Your{" "}
            <span style={{
              background: 'linear-gradient(135deg, color-mix(in srgb, var(--theme-color) 90%, white) 0%, var(--theme-color) 45%, color-mix(in srgb, var(--theme-color) 70%, black) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 30px rgba(212,175,55,0.3))',
            }}>
              Style
            </span>
          </h2>

          <p className="font-body text-lg max-w-xl mx-auto mb-10" style={{ color: 'var(--text-muted)' }}>
            Join the kingdom. Wear the crown. Limited drops, premium quality — exclusively yours.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/products"
              className="btn-primary text-sm w-full sm:w-auto justify-center"
              style={{ minWidth: 200 }}
            >
              <Crown size={15} className="mr-2 text-current" />
              <span>Shop the Kingdom</span>
            </Link>
            {/* <Link
              to="/#collections"
              className="btn-outline-gold text-sm w-full sm:w-auto justify-center"
              style={{ minWidth: 200 }}
            >
              <span>Explore Collections</span>
              <ArrowRight size={15} className="ml-2 text-current" />
            </Link> */}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
