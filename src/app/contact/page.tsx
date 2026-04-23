import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Phone, MapPin, Send, CheckCircle, Crown, Mail, MessageSquare, ChevronDown, Loader2 } from "lucide-react"
import { WhatsAppIcon } from '@/components/icons/whatsapp'
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PageHeader } from "@/components/page-header"
import { useSeo } from "@/hooks/use-seo"
import { useSettings } from '@/context/settings-context'
import { leadService, type LeadPayload } from '@/services/leadService'

const inquiryOptions = [
  { value: 'order',         label: 'Place an Order' },
  { value: 'bulk',          label: 'Bulk / Wholesale Inquiry' },
  { value: 'custom_design', label: 'Custom Design' },
  { value: 'support',       label: 'Support / After Sales' },
  { value: 'other',         label: 'Other' },
]

const contactMethods = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'call',     label: 'Phone Call' },
  { value: 'email',    label: 'Email' },
]

export default function ContactPage() {
  useSeo({ pageType: 'page', pageSlug: 'contact', fallbackTitle: 'Contact Us — UNIKQ LABEL' })
  const { settings } = useSettings()
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '',
    inquiry_type: 'other' as LeadPayload['inquiry_type'],
    message: '',
    preferred_contact: 'whatsapp' as LeadPayload['preferred_contact'],
    website: '', // honeypot
  })
  const [errors, setErrors]     = useState<Record<string, string>>({})
  const [loading, setLoading]   = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [apiErr, setApiErr]     = useState('')

  const validate = () => {
    const e: Record<string, string> = {}
    if (!formData.name.trim())    e.name    = 'Name is required'
    if (!formData.phone.trim())   e.phone   = 'Phone is required'
    else if (!/^\+?[\d\s\-]{8,20}$/.test(formData.phone)) e.phone = 'Enter a valid phone number'
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) e.email = 'Enter a valid email'
    if (!formData.message.trim()) e.message = 'Message is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setApiErr('')
    try {
      await leadService.submit({
        name:              formData.name,
        phone:             formData.phone,
        email:             formData.email || undefined,
        inquiry_type:      formData.inquiry_type,
        message:           formData.message,
        preferred_contact: formData.preferred_contact,
        website:           formData.website,
      })
      setIsSubmitted(true)
      setFormData({ name: '', phone: '', email: '', inquiry_type: 'other', message: '', preferred_contact: 'whatsapp', website: '' })
    } catch (err: any) {
      setApiErr(err?.response?.data?.error || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const setField = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(f => ({ ...f, [k]: e.target.value }))
    if (errors[k]) setErrors(er => ({ ...er, [k]: '' }))
  }

  const contactCards = [
    {
      icon: WhatsAppIcon,
      label: "WhatsApp",
      value: settings?.whatsapp || settings?.phone || '+91 8639424039',
      href: settings?.whatsapp ? `https://wa.me/${String(settings.whatsapp).replace(/\D/g, '')}` : '#',
      external: true,
      color: '#25D366',
      bg: 'rgba(37,211,102,0.08)',
      border: 'rgba(37,211,102,0.2)',
    },
    {
      icon: Phone,
      label: "Phone",
      value: settings?.phone || '+91 8639424039',
      href: settings?.phone ? `tel:${settings.phone}` : '#',
      external: false,
      color: 'var(--theme-color)',
      bg: 'rgba(212,175,55,0.08)',
      border: 'rgba(212,175,55,0.2)',
    },
    {
      icon: MapPin,
      label: "Location",
      value: settings?.address || 'India',
      href: null,
      external: false,
      color: 'var(--theme-color)',
      bg: 'rgba(212,175,55,0.08)',
      border: 'rgba(212,175,55,0.2)',
    },
    ...(settings?.email ? [{
      icon: Mail,
      label: "Email",
      value: settings.email,
      href: `mailto:${settings.email}`,
      external: false,
      color: 'var(--theme-color)',
      bg: 'rgba(212,175,55,0.08)',
      border: 'rgba(212,175,55,0.2)',
    }] : []),
  ]

  const inputCls = (k: string) => {
    const base = 'w-full px-4 py-3.5 rounded-xl text-sm font-body outline-none transition-all'
    const err  = errors[k]
    return `${base} ${err
      ? 'border border-red-500/60 bg-red-500/5'
      : 'border border-[rgba(212,175,55,0.15)] focus:border-[rgba(212,175,55,0.45)]'
    }`
  }

  const inputStyle = (k: string) => ({
    color: 'var(--text-primary)' as const,
    background: errors[k] ? undefined : 'var(--surface-card)' as const,
  })

  const waRaw    = settings?.whatsapp || settings?.phone || '918639424039'
  const waNumber = String(waRaw).replace(/\D/g, '')

  return (
    <main className="min-h-screen" style={{ background: 'var(--surface-page)' }}>
      <Navbar />
      <PageHeader
        title="Contact Us"
        subtitle="Talk to the Kingdom — we'd love to hear from you"
        backgroundImage="/images/hero-bg.jpg"
      />

      {/* Trust Badge */}
      <div className="flex justify-center -mt-4 mb-10 relative z-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold"
          style={{ border: '1px solid rgba(212,175,55,0.3)', background: 'rgba(212,175,55,0.08)', color: 'var(--theme-color)' }}
        >
          <Crown className="w-3.5 h-3.5" />
          Response within 24 hours · Premium Support
        </motion.div>
      </div>

      <section className="px-4 pb-24">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

            {/* ── Left: Info ── */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
            >
              <span className="section-badge mb-5 inline-block">Get in Touch</span>
              <h2 className="font-heading text-3xl md:text-4xl font-black mb-4 leading-tight" style={{ color: 'var(--text-primary)' }}>
                Talk to the{' '}
                <span style={{
                  background: 'linear-gradient(135deg, color-mix(in srgb, var(--theme-color) 90%, white), var(--theme-color))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>Kingdom</span>
              </h2>
              <p className="font-body text-base mb-8 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Have a question about sizing, styling, or bulk orders? Our team is here to help you dress like royalty.
              </p>

              {/* Contact Cards */}
              <div className="space-y-3 mb-8">
                {contactCards.map((card) => {
                  const inner = (
                    <div
                      className="contact-card flex items-center gap-4 p-4 rounded-2xl group transition-transform duration-300"
                      style={{ background: card.bg, border: `1px solid ${card.border}` }}
                    >
                      <div
                        className="contact-icon shrink-0 rounded-full flex items-center justify-center"
                        style={{ background: card.color === '#25D366' ? card.color : 'rgba(212,175,55,0.12)', border: `1px solid ${card.border}` }}
                      >
                        <card.icon className="w-5 h-5" style={{ color: card.color === '#25D366' ? '#fff' : card.color }} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-body font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{card.label}</p>
                        <p className="font-body text-xs mt-0.5 text-ellipsis" style={{ color: 'var(--text-dim)' }}>{card.value}</p>
                      </div>
                    </div>
                  )

                  if (card.href) {
                    return (
                      <a
                        key={card.label}
                        href={card.href}
                        target={card.external ? '_blank' : undefined}
                        rel={card.external ? 'noopener noreferrer' : undefined}
                        className="block"
                        aria-label={`${card.label} ${card.value}`}
                      >
                        {inner}
                      </a>
                    )
                  }

                  return (
                    <div key={card.label} tabIndex={0} role="button" aria-label={`${card.label} ${card.value}`}>
                      {inner}
                    </div>
                  )
                })}
              </div>

              {/* WhatsApp CTA */}
              <a
                href={`https://wa.me/${waNumber}?text=${encodeURIComponent("Hi! I'm interested in UNIKQ Label products.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp inline-flex w-full sm:w-auto justify-center"
              >
                <WhatsAppIcon className="w-4 h-4" />
                Chat on WhatsApp
              </a>
            </motion.div>

            {/* ── Right: Form ── */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
            >
              <div className="p-8 md:p-10 rounded-3xl"
                style={{
                  background: 'var(--surface-card)',
                  border: '1px solid rgba(212,175,55,0.10)',
                  boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
                }}>
                <div className="flex items-center gap-3 mb-7">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(212,175,55,0.10)', border: '1px solid rgba(212,175,55,0.2)' }}>
                    <MessageSquare className="w-4 h-4 text-amber-500" />
                  </div>
                  <h2 className="font-heading text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Send a Message</h2>
                </div>

                <AnimatePresence mode="wait">
                  {isSubmitted ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex flex-col items-center justify-center py-14 text-center"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                        style={{ background: 'rgba(37,211,102,0.15)', border: '1px solid rgba(37,211,102,0.3)' }}
                      >
                        <CheckCircle className="w-8 h-8 text-[#25D366]" />
                      </motion.div>
                      <p className="font-heading text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Message Sent!</p>
                      <p className="font-body text-sm" style={{ color: 'var(--text-subtle)' }}>We'll reach out within 24 hours via your preferred channel.</p>
                      <button
                        className="mt-5 text-xs underline"
                        style={{ color: 'rgba(212,175,55,0.6)' }}
                        onClick={() => setIsSubmitted(false)}
                      >
                        Send another message
                      </button>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      onSubmit={handleSubmit}
                      className="space-y-5"
                      noValidate
                    >
                      {/* Honeypot — hidden from real users */}
                      <input
                        type="text"
                        name="website"
                        value={formData.website}
                        onChange={setField('website')}
                        className="hidden"
                        tabIndex={-1}
                        autoComplete="off"
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-body text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'rgba(212,175,55,0.7)' }}>
                            Your Name *
                          </label>
                          <input
                            type="text"
                            placeholder="Enter your name"
                            value={formData.name}
                            onChange={setField('name')}
                            className={inputCls('name')}
                            style={inputStyle('name')}
                          />
                          {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                        </div>
                        <div>
                          <label className="block font-body text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'rgba(212,175,55,0.7)' }}>
                            Phone *
                          </label>
                          <input
                            type="tel"
                            placeholder="Phone number"
                            value={formData.phone}
                            onChange={setField('phone')}
                            className={inputCls('phone')}
                            style={inputStyle('phone')}
                          />
                          {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                        </div>
                      </div>

                      <div>
                        <label className="block font-body text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'rgba(212,175,55,0.7)' }}>
                          Email (optional)
                        </label>
                        <input
                          type="email"
                          placeholder="your@email.com"
                          value={formData.email}
                          onChange={setField('email')}
                          className={inputCls('email')}
                          style={inputStyle('email')}
                        />
                        {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                      </div>

                      <div>
                        <label className="block font-body text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'rgba(212,175,55,0.7)' }}>
                          Inquiry Type
                        </label>
                        <div className="relative">
                          <select
                            value={formData.inquiry_type}
                            onChange={setField('inquiry_type')}
                            className={`${inputCls('inquiry_type')} appearance-none pr-10 cursor-pointer`}
                            style={inputStyle('inquiry_type')}
                          >
                            {inquiryOptions.map(o => (
                              <option key={o.value} value={o.value} className="bg-[#1a1a1a]">{o.label}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--text-ghost)' }} />
                        </div>
                      </div>

                      <div>
                        <label className="block font-body text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'rgba(212,175,55,0.7)' }}>
                          Message *
                        </label>
                        <textarea
                          rows={4}
                          placeholder="Tell us what's on your mind…"
                          value={formData.message}
                          onChange={setField('message')}
                          className={`${inputCls('message')} resize-none`}
                          style={inputStyle('message')}
                        />
                        {errors.message && <p className="text-red-400 text-xs mt-1">{errors.message}</p>}
                      </div>

                      {/* Preferred contact method */}
                      <div>
                        <label className="block font-body text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'rgba(212,175,55,0.7)' }}>
                          Preferred Contact
                        </label>
                        <div className="flex gap-2">
                          {contactMethods.map(m => (
                            <button
                              key={m.value}
                              type="button"
                              onClick={() => setFormData(f => ({ ...f, preferred_contact: m.value as LeadPayload['preferred_contact'] }))}
                              className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border"
                              style={formData.preferred_contact === m.value
                                ? { borderColor: 'rgba(212,175,55,0.5)', background: 'rgba(212,175,55,0.12)', color: 'var(--theme-color)' }
                                : { borderColor: 'rgba(255,255,255,0.08)', background: 'transparent', color: 'var(--text-ghost)' }
                              }
                            >
                              {m.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {apiErr && (
                        <div className="px-4 py-3 rounded-xl text-sm" style={{ border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#f87171' }}>
                          {apiErr}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full justify-center text-sm disabled:opacity-60"
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send size={15} />
                        )}
                        <span className="ml-2">{loading ? 'Sending…' : 'Send Message'}</span>
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
