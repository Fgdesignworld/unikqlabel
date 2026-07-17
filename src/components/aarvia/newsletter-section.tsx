import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight, Leaf } from "lucide-react"
import { leadService } from "@/services/leadService"

export function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setState('loading')
    setError('')
    try {
      await leadService.submit({ name: 'Newsletter', phone: 'newsletter', email, inquiry_type: 'other', message: 'Newsletter signup', preferred_contact: 'email' })
      setState('success')
      setEmail('')
    } catch {
      setState('error')
      setError('Something went wrong. Please try again.')
    }
  }

  return (
    <section className="py-20 lg:py-28" style={{ background: '#FDFBF7', borderTop: '1px solid rgba(200,169,107,0.15)' }}>
      <div className="max-w-2xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.5 }}
          className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: 'rgba(31,77,58,0.07)', border: '1px solid rgba(200,169,107,0.2)' }}>
          <Leaf className="w-5 h-5" style={{ color: '#1F4D3A' }} />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ delay: 0.05, duration: 0.5 }}
          className="text-[11px] font-bold tracking-[0.26em] uppercase mb-3"
          style={{ color: '#C8A96B' }}>
          Stay Connected
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ delay: 0.1, duration: 0.6 }}
          className="text-3xl md:text-4xl leading-tight mb-4"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, color: '#1F4D3A' }}>
          Join the Aarvia Circle
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ delay: 0.14, duration: 0.6 }}
          className="text-sm leading-relaxed mb-10"
          style={{ color: '#6B6B60', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Get early access to new launches, exclusive wellness rituals, and thoughtful content on natural living. No spam — only things worth reading.
        </motion.p>

        {state === 'success' ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="py-5 px-8" style={{ background: 'rgba(31,77,58,0.06)', border: '1px solid rgba(200,169,107,0.2)' }}>
            <p className="font-semibold" style={{ color: '#1F4D3A', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.125rem' }}>
              Welcome to the circle.
            </p>
            <p className="text-sm mt-1" style={{ color: '#6B6B60' }}>We'll be in touch with something beautiful soon.</p>
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: 0.18, duration: 0.6 }}
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Your email address"
              className="flex-1 px-5 py-4 outline-none border-b-2 bg-transparent transition-colors"
              style={{ borderColor: email ? '#1F4D3A' : 'rgba(200,169,107,0.3)', color: '#1F4D3A', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.875rem' }}
            />
            <button type="submit" disabled={state === 'loading'}
              className="flex items-center justify-center gap-2 px-7 py-4 font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 shrink-0"
              style={{ background: '#1F4D3A', color: '#FDFBF7', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              {state === 'loading' ? 'Joining…' : (<>Join <ArrowRight className="w-3 h-3" /></>)}
            </button>
          </motion.form>
        )}

        {error && <p className="mt-3 text-xs" style={{ color: '#C25C5C' }}>{error}</p>}
      </div>
    </section>
  )
}
