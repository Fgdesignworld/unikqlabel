import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ArrowRight, Crown, Sparkles, Star, Zap, ChevronLeft, ChevronRight, Timer, type LucideIcon } from 'lucide-react';
import { heroSlideService, type HeroSlide as ApiHeroSlide } from '@/services/heroSlideService';

// ─── Display shape (used by carousel) ────────────────────────────────────────
interface SlideDisplay {
  id: string;
  category: string;
  tag: string;
  bg: string;
  href: string;
  lines: string[];
  accentLine: string;
  sub: string;
  cta: string;
  tagline: string;           // section badge (e.g. "Luxury Streetwear · Est. 2024")
  ctaSecondary: string;      // secondary button text
  ctaSecondaryHref: string;  // secondary button link
  badgeIcon: string;         // lucide icon name for carousel card top-right
}

function splitTitle(title: string): { lines: string[]; accentLine: string } {
  const words = title.trim().split(' ');
  if (words.length <= 2) return { lines: [title], accentLine: title };
  const mid = Math.ceil(words.length / 2);
  return { lines: [words.slice(0, mid).join(' '), words.slice(mid).join(' ')], accentLine: words.slice(mid).join(' ') };
}
const CAT_HREF: Record<string, string> = { men:'/men', women:'/women', unisex:'/unisex', trending:'/products', limited:'/products' };
const CAT_LABEL: Record<string, string> = { men:'Men', women:'Women', unisex:'Unisex', trending:'Trending', limited:'Limited Drops' };
function mapApiSlide(s: ApiHeroSlide): SlideDisplay {
  const { lines, accentLine } = splitTitle(s.title);
  // Prefix relative upload paths with /api so Vite proxy forwards to PHP server
  const resolveImg = (p: string | null | undefined) =>
    p ? (p.startsWith('http') || p.startsWith('/api/') ? p : `/api${p}`) : null;
  return {
    id: String(s.id),
    category: CAT_LABEL[s.category] ?? s.category,
    tag: s.badge_text || s.tagline || 'New Arrivals',
    bg: resolveImg(s.image) || '/images/hero-bg.jpg',
    href: s.cta_primary_link || CAT_HREF[s.category] || '/products',
    lines, accentLine,
    sub: s.subtitle ?? '',
    cta: s.cta_primary_text || 'Shop Now',
    tagline: s.tagline || 'Luxury Streetwear · Est. 2024',
    ctaSecondary: s.cta_secondary_text || 'Explore Collections',
    ctaSecondaryHref: s.cta_secondary_link || '/#collections',
    badgeIcon: s.badge_icon || 'Crown',
  };
}

const FALLBACK_SLIDES: SlideDisplay[] = [
  {
    id: 'men', category: 'Men', tag: 'New Arrivals', bg: '/images/hero-bg.jpg', href: '/men',
    lines: ['Dress Like', 'Royalty'], accentLine: 'Royalty',
    sub: 'Bold. Structured. Built for kings who lead the streets.', cta: 'Shop Men',
    tagline: 'Luxury Streetwear · Est. 2024', ctaSecondary: 'Explore Collections', ctaSecondaryHref: '/#collections', badgeIcon: 'Crown',
  },
  {
    id: 'women', category: 'Women', tag: 'Bestseller', bg: '/images/hero-bg.jpg', href: '/women',
    lines: ['Elegance', 'Meets Edge'], accentLine: 'Meets Edge',
    sub: 'Premium cuts that make every entrance unforgettable.', cta: 'Shop Women',
    tagline: 'Luxury Streetwear · Est. 2024', ctaSecondary: 'Explore Collections', ctaSecondaryHref: '/#collections', badgeIcon: 'Sparkles',
  },
  {
    id: 'unisex', category: 'Unisex', tag: 'Trending Now', bg: '/images/hero-bg.jpg', href: '/unisex',
    lines: ['Beyond', 'Boundaries'], accentLine: 'Boundaries',
    sub: 'Fashion for the fearless — no rules, just vibes.', cta: 'Explore Unisex',
    tagline: 'Luxury Streetwear · Est. 2024', ctaSecondary: 'Explore Collections', ctaSecondaryHref: '/#collections', badgeIcon: 'Zap',
  },
  {
    id: 'drops', category: 'Limited Drops', tag: '🔥 Exclusive', bg: '/images/hero-bg.jpg', href: '/products',
    lines: ['Limited', 'Edition'], accentLine: 'Edition',
    sub: "Exclusive pieces. Once they're gone, they're gone forever.", cta: 'Grab Yours',
    tagline: 'Luxury Streetwear · Est. 2024', ctaSecondary: 'Explore Collections', ctaSecondaryHref: '/#collections', badgeIcon: 'Star',
  },
];

// ─── Dynamic badge icon ────────────────────────────────────────────────────────
const BADGE_ICON_MAP: Record<string, LucideIcon> = { Crown, Zap, Sparkles, Star };
function BadgeIcon({ name, size }: { name: string; size: number }) {
  const Icon = BADGE_ICON_MAP[name] ?? Crown;
  return <Icon size={size} className="text-amber-500" />;
}

function pad2(n: number) { return String(n).padStart(2, '0'); }

// ─── Carousel variants ────────────────────────────────────────────────────────
const slideV = {
  enter: (d: number) => ({ opacity: 0, scale: 1.04, x: d > 0 ? 50 : -50 }),
  center: { opacity: 1, scale: 1, x: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as unknown as string } },
  exit:   (d: number) => ({ opacity: 0, scale: 0.97, x: d > 0 ? -30 : 30, transition: { duration: 0.35 } }),
};

// ─── Component ────────────────────────────────────────────────────────────────
export function HeroSection() {
  const parallaxRef            = useRef<HTMLDivElement>(null);
  const dropEndRef             = useRef(Date.now() + 24 * 60 * 60 * 1000);
  const [current, setCurrent]  = useState(0);
  const [dir, setDir]          = useState<1 | -1>(1);
  const [autoKey, setAutoKey]  = useState(0);
  const [activePill, setActivePill] = useState(-1);
  const [countdown, setCountdown]   = useState({ h: 23, m: 59, s: 59 });
  const [slides, setSlides]         = useState<SlideDisplay[]>(FALLBACK_SLIDES);

  useEffect(() => {
    heroSlideService.getPublic()
      .then(apiSlides => {
        if (Array.isArray(apiSlides) && apiSlides.length > 0) {
          setSlides(apiSlides.map(mapApiSlide));
        }
      })
      .catch(() => { /* keep FALLBACK_SLIDES */ });
  }, []);

  const total = slides.length;

  const goTo = useCallback((idx: number, d: 1 | -1 = 1) => {
    setDir(d);
    setCurrent(((idx % total) + total) % total);
    setAutoKey(k => k + 1);
  }, [total]);

  const next = useCallback(() => goTo(current + 1,  1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1, -1), [current, goTo]);

  // Auto-advance (reset when autoKey changes)
  useEffect(() => {
    const t = setInterval(() => {
      setDir(1);
      setCurrent(c => (c + 1) % total);
    }, 5000);
    return () => clearInterval(t);
  }, [autoKey, total]);

  // Countdown tick
  useEffect(() => {
    const tick = setInterval(() => {
      const ms = dropEndRef.current - Date.now();
      if (ms <= 0) { clearInterval(tick); setCountdown({ h: 0, m: 0, s: 0 }); return; }
      setCountdown({
        h: Math.floor(ms / 3_600_000),
        m: Math.floor((ms % 3_600_000) / 60_000),
        s: Math.floor((ms % 60_000) / 1_000),
      });
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  // Parallax
  useEffect(() => {
    const onScroll = () => {
      if (parallaxRef.current) {
        parallaxRef.current.style.transform = `translateY(${window.scrollY * 0.25}px) scale(1.06)`;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const slide = slides[current] ?? slides[0];

  // Build category pills dynamically from loaded slides (one pill per unique category)
  const categoryPills = useMemo(() => {
    const seen = new Set<string>();
    const pills: { label: string; href: string; slideIdx: number }[] = [
      { label: 'All', href: '/products', slideIdx: -1 },
    ];
    slides.forEach((s, i) => {
      if (!seen.has(s.category)) {
        seen.add(s.category);
        pills.push({ label: s.category, href: s.href, slideIdx: i });
      }
    });
    return pills;
  }, [slides]);

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden">

      {/* ── Subtle parallax BG ── */}
      <div
        ref={parallaxRef}
        className="absolute inset-0 bg-cover bg-center will-change-transform"
        style={{ backgroundImage: 'url(/images/hero-bg.jpg)', transformOrigin: 'center top', filter: 'brightness(0.10) blur(3px)' }}
      />

      {/* ── Dark overlay ── */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg,#0D0D0D 0%,rgba(13,13,13,0.97) 55%,rgba(13,13,13,0.94) 100%)' }} />

      {/* ── Gold glows ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-[15%] w-96 h-96 rounded-full blur-3xl opacity-10"
          style={{ background: 'radial-gradient(circle, var(--theme-color), transparent)' }} />
        <div className="absolute bottom-1/4 right-[20%] w-64 h-64 rounded-full blur-3xl opacity-7"
          style={{ background: 'radial-gradient(circle, var(--theme-color), transparent)' }} />
      </div>

      {/* ── Dot grid ── */}
      <div className="absolute inset-0 pointer-events-none opacity-10" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(212,175,55,0.30) 1px, transparent 0)',
        backgroundSize: '40px 40px',
      }} />

      {/* ── Main layout ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 lg:pt-25 lg:pb-20">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">

          {/* ════════════════════════════════
              LEFT PANEL
          ════════════════════════════════ */}
          <div className="flex-1 text-center lg:text-left max-w-xl lg:max-w-none order-2 lg:order-1">

            {/* Luxury badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="flex items-center gap-3 mb-5 justify-center lg:justify-start"
            >
              <div className="h-px w-10 shrink-0" style={{ background: 'linear-gradient(90deg, transparent, var(--theme-color))' }} />
              <span className="section-badge">{slide.tagline}</span>
              <div className="h-px w-10 shrink-0 lg:hidden" style={{ background: 'linear-gradient(90deg, var(--theme-color), transparent)' }} />
            </motion.div>

            {/* Brand label */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mb-3"
            >
              <span className="font-cinzel text-sm sm:text-base tracking-[0.4em] uppercase"
                style={{ color: 'var(--theme-color)', textShadow: '0 0 30px color-mix(in srgb, var(--theme-color) 50%, transparent)' }}>
                UNIKQ LABEL
              </span>
            </motion.div>

            {/* Dynamic headline */}
            <AnimatePresence mode="wait">
              <motion.h1
                key={`h-${current}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as unknown as string }}
                className="font-heading font-black leading-[1.02] mb-5"
                style={{ fontSize: 'clamp(2.6rem, 6.5vw, 5rem)', letterSpacing: '-0.01em' }}
              >
                {slide.lines.map((line, i) =>
                  line === slide.accentLine
                    ? (
                      <span key={i} className="block" style={{
                        background: 'linear-gradient(135deg, color-mix(in srgb, var(--theme-color) 90%, white) 0%, var(--theme-color) 45%, color-mix(in srgb, var(--theme-color) 70%, black) 100%)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                        filter: 'drop-shadow(0 0 40px rgba(212,175,55,0.4))',
                      }}>{line}</span>
                    ) : (
                      <span key={i} className="text-white block">{line}</span>
                    )
                )}
              </motion.h1>
            </AnimatePresence>

            {/* Dynamic subtitle */}
            <AnimatePresence mode="wait">
              <motion.p
                key={`s-${current}`}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.45, delay: 0.05 }}
                className="font-body text-base sm:text-lg mb-7 max-w-md mx-auto lg:mx-0"
                style={{ color: 'rgba(245,240,232,0.68)', lineHeight: 1.7 }}
              >
                {slide.sub}
              </motion.p>
            </AnimatePresence>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start mb-6"
            >
              <Link to={slide.href} className="btn-primary text-sm w-full sm:w-auto justify-center" style={{ minWidth: 175 }}>
                <ShoppingBag size={15} className="text-current" />
                <span>{slide.cta}</span>
              </Link>
              <Link to={slide.ctaSecondaryHref} className="btn-outline-gold text-sm w-full sm:w-auto justify-center" style={{ minWidth: 175 }}>
                <span>{slide.ctaSecondary}</span>
                <ArrowRight size={15} className="text-current" />
              </Link>
            </motion.div>

            {/* Category quick-filter pills */}
            <motion.div
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.62 }}
              className="flex items-center gap-2 flex-wrap justify-center lg:justify-start mb-6"
            >
              {categoryPills.map(pill => {
                const isActive = activePill === pill.slideIdx || (pill.slideIdx === -1 && activePill === -1);
                return (
                  <Link
                    key={pill.label}
                    to={pill.href}
                    onClick={() => {
                      setActivePill(pill.slideIdx);
                      if (pill.slideIdx >= 0) goTo(pill.slideIdx, pill.slideIdx > current ? 1 : -1);
                    }}
                    className="px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 border"
                    style={isActive
                      ? { background: 'var(--theme-color)', color: '#0D0D0D', borderColor: 'var(--theme-color)' }
                      : { background: 'rgba(212,175,55,0.06)', color: 'rgba(245,240,232,0.6)', borderColor: 'rgba(212,175,55,0.18)' }
                    }
                  >
                    {pill.label}
                  </Link>
                );
              })}
            </motion.div>

            {/* Countdown timer */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.75 }}
              className="flex items-center gap-3 justify-center lg:justify-start mb-7 flex-wrap"
            >
              <Timer size={13} className="text-amber-500 animate-pulse shrink-0" />
              <span className="text-xs uppercase tracking-wider shrink-0" style={{ color: 'rgba(245,240,232,0.45)' }}>Next drop ends in</span>
              <div className="flex items-center gap-1">
                {[countdown.h, countdown.m, countdown.s].map((val, i) => (
                  <span key={i} className="flex items-center">
                    <span className="font-heading font-black text-sm px-2 py-0.5 rounded-lg"
                      style={{ background: 'rgba(212,175,55,0.10)', color: 'var(--theme-color)', border: '1px solid rgba(212,175,55,0.22)', minWidth: 32, textAlign: 'center', display: 'inline-block' }}>
                      {pad2(val)}
                    </span>
                    {i < 2 && <span className="text-amber-500 font-bold mx-0.5">:</span>}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Trust row */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="flex items-center gap-3 justify-center lg:justify-start"
            >
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(i => <Star key={i} size={12} fill="currentColor" className="text-amber-500" />)}
              </div>
              <span className="font-body text-xs" style={{ color: '#888880' }}>
                Trusted by <span className="font-semibold text-amber-500">2,000+</span> fashion lovers
              </span>
            </motion.div>
          </div>

          {/* ════════════════════════════════
              RIGHT PANEL — CAROUSEL
          ════════════════════════════════ */}
          <div className="relative shrink-0 w-full max-w-xs sm:max-w-sm lg:max-w-md order-1 lg:order-2">

            {/* Outer glow */}
            <div className="absolute inset-0 rounded-3xl pointer-events-none"
              style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--theme-color) 22%, transparent) 0%, transparent 70%)', filter: 'blur(55px)', transform: 'scale(1.45)' }}
            />

            {/* Carousel frame */}
            <div
              className="relative overflow-hidden rounded-3xl"
              style={{
                border: '1.5px solid color-mix(in srgb, var(--theme-color) 38%, transparent)',
                boxShadow: '0 0 0 8px color-mix(in srgb, var(--theme-color) 4%, transparent), 0 50px 100px rgba(0,0,0,0.8)',
                aspectRatio: '4/5',
              }}
            >
              {/* Slides */}
              <AnimatePresence custom={dir} initial={false}>
                <motion.div
                  key={current}
                  custom={dir}
                  variants={slideV}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="absolute inset-0"
                >
                  <img
                    src={slide.bg}
                    alt={slide.category}
                    loading="lazy"
                    className="w-full h-full object-cover object-top"
                  />
                  {/* gradient */}
                  <div className="absolute inset-0" style={{
                    background: 'linear-gradient(180deg, rgba(13,13,13,0.05) 0%, rgba(13,13,13,0.25) 40%, rgba(13,13,13,0.92) 100%)',
                  }} />

                  {/* Top tag */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                    <span className="section-badge text-[10px]">{slide.tag}</span>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(13,13,13,0.7)', border: '1px solid rgba(212,175,55,0.3)', backdropFilter: 'blur(8px)' }}>
                      <BadgeIcon name={slide.badgeIcon} size={11} />
                    </div>
                  </div>

                  {/* Bottom info card */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="font-cinzel text-[10px] tracking-[0.28em] uppercase text-amber-500">{slide.category}</span>
                    </div>
                    {/* <p className="font-heading text-xl font-black text-white mb-3 leading-tight">
                      {slide.lines.join(' ')}
                    </p> */}
                    {/* <Link
                      to={slide.href}
                      className="inline-flex items-center gap-2 btn-primary text-[11px] py-2 px-4"
                    >
                      <span>{slide.cta}</span>
                      <ArrowRight size={11} className="text-current" />
                    </Link> */}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Prev / Next buttons */}
              <button
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 z-10"
                style={{ background: 'rgba(13,13,13,0.72)', border: '1px solid rgba(212,175,55,0.28)', backdropFilter: 'blur(8px)' }}
                aria-label="Previous slide"
              >
                <ChevronLeft size={15} className="text-amber-500" />
              </button>
              <button
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 z-10"
                style={{ background: 'rgba(13,13,13,0.72)', border: '1px solid rgba(212,175,55,0.28)', backdropFilter: 'blur(8px)' }}
                aria-label="Next slide"
              >
                <ChevronRight size={15} className="text-amber-500" />
              </button>
            </div>

            {/* Dot indicators */}
            <div className="flex items-center justify-center gap-2 mt-4">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i, i > current ? 1 : -1)}
                  aria-label={`Go to slide ${i + 1}`}
                  className="transition-all duration-300 rounded-full"
                  style={{
                    width:  i === current ? 24 : 7,
                    height: 7,
                    background: i === current ? 'var(--theme-color)' : 'rgba(212,175,55,0.22)',
                  }}
                />
              ))}
            </div>

            {/* Floating badges — desktop only */}
            <motion.div
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.1, duration: 0.5 }}
              className="absolute -left-5 top-[18%] glass-gold rounded-2xl px-3 py-2 hidden lg:flex items-center gap-2"
              style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.45)' }}
            >
              <Crown size={12} className="text-amber-500" />
              <span className="font-body text-xs font-semibold whitespace-nowrap" style={{ color: '#F5F0E8' }}>Premium Quality</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.4, duration: 0.5 }}
              className="absolute -right-5 top-[42%] glass-gold rounded-2xl px-3 py-2 hidden lg:flex items-center gap-2"
              style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.45)' }}
            >
              <Zap size={12} className="text-amber-500" />
              <span className="font-body text-xs font-semibold whitespace-nowrap" style={{ color: '#F5F0E8' }}>Limited Drops</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.7, duration: 0.5 }}
              className="absolute -left-3 bottom-[20%] glass-gold rounded-2xl px-3 py-2 hidden lg:flex items-center gap-2"
              style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.45)' }}
            >
              <Sparkles size={12} className="text-amber-500" />
              <span className="font-body text-xs font-semibold whitespace-nowrap" style={{ color: '#F5F0E8' }}>Trending Now</span>
            </motion.div>
          </div>
        </div>

        {/* ── Scroll indicator ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.2, duration: 0.6 }}
          className="hidden md:flex absolute bottom-6 left-1/2 -translate-x-1/2 flex-col items-center gap-1"
          style={{ color: 'rgba(212,175,55,0.45)' }}
        >
          <span className="font-body text-[10px] uppercase tracking-widest">Scroll</span>
          <div className="w-px h-7 rounded-full" style={{ background: 'linear-gradient(to bottom, rgba(212,175,55,0.5), transparent)' }} />
        </motion.div>
      </div>
    </section>
  );
}
