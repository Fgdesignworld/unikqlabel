import { motion } from 'framer-motion';
import { ShoppingBag, ChevronDown, Star, Award, Leaf, Clock } from 'lucide-react';
import { WhatsAppIcon } from '@/components/icons/whatsapp'

const WHATSAPP_URL = 'https://wa.me/918639424039';

const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: (delay = 0) => ({
    opacity: 1,
    transition: { duration: 1.2, delay },
  }),
};

const stats = [
  { value: '100%', label: 'Homemade', icon: Leaf },
  { value: '0%', label: 'Preservatives', icon: Award },
  { value: '500+', label: 'Happy Families', icon: Star },
  { value: '10+', label: 'Products', icon: Clock },
];

export function HeroSection() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
        style={{
          backgroundImage: 'url(/images/hero-bg.jpg)',
        }}
      />

      <div className="absolute inset-0" style={{
        background: 'linear-gradient(180deg, rgba(15,15,15,0.75) 0%, rgba(15,15,15,0.55) 40%, rgba(15,15,15,0.85) 80%, rgba(15,15,15,1) 100%)'
      }} />
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(90deg, rgba(15,15,15,0.7) 0%, transparent 40%, rgba(15,15,15,0.7) 100%)'
      }} />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(ellipse at 15% 60%, rgba(127,29,29,0.35) 0%, transparent 55%), radial-gradient(ellipse at 85% 40%, rgba(217,119,6,0.25) 0%, transparent 55%)',
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(245,158,11,0.15) 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">

          <div className="flex-1 text-center lg:text-left max-w-2xl">
            <motion.div
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              custom={0.1}
              className="flex items-center gap-3 mb-6 justify-center lg:justify-start"
            >
              <div className="h-px w-10 flex-shrink-0" style={{ background: 'linear-gradient(90deg, transparent, #f59e0b)' }} />
              <span className="section-badge">Authentic Andhra Homemade Foods</span>
              <div className="h-px w-10 flex-shrink-0 lg:hidden" style={{ background: 'linear-gradient(90deg, #f59e0b, transparent)' }} />
            </motion.div>

            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.3}
              className="font-heading font-bold leading-[1.05] mb-6"
              style={{ fontSize: 'clamp(3rem, 7vw, 5.5rem)' }}
            >
              <span className="text-white block" style={{ textShadow: '0 0 60px rgba(245,158,11,0.3)' }}>Lakshmi</span>
              <span className="block" style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 40%, #d97706 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Home Foods
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.5}
              className="font-body text-lg sm:text-xl mb-4 max-w-lg mx-auto lg:mx-0"
              style={{ color: '#d4d4d4', lineHeight: 1.7 }}
            >
              Crafted with love, rooted in tradition. Every bite carries the authentic flavour of Andhra's finest home recipes.
            </motion.p>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.65}
              className="flex items-center gap-3 mb-8 justify-center lg:justify-start"
            >
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} size={15} fill="#f59e0b" style={{ color: '#f59e0b' }} />
                ))}
              </div>
              <span className="font-body text-sm font-medium" style={{ color: '#a3a3a3' }}>
                Trusted by <span style={{ color: '#f59e0b' }}>500+</span> families
              </span>
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.8}
              className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start mb-10"
            >
              <a
                href="#categories"
                className="btn-primary text-base w-full sm:w-auto justify-center"
                style={{ minWidth: 180 }}
              >
                <ShoppingBag size={18} />
                Explore Menu
              </a>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp text-base w-full sm:w-auto justify-center"
                style={{ minWidth: 180 }}
              >
                <WhatsAppIcon className="w-4 h-4 mr-2 text-white" />
                Order on WhatsApp
              </a>
            </motion.div>

            <motion.div
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              custom={1.1}
              className="flex items-center gap-2 justify-center lg:justify-start"
            >
              <div className="h-px flex-1 max-w-[60px]" style={{ background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.4))' }} />
              <p className="font-heading italic text-sm sm:text-base px-2" style={{ color: '#f59e0b' }}>
                "Pure Taste of Tradition in Every Bite"
              </p>
              <div className="h-px flex-1 max-w-[60px]" style={{ background: 'linear-gradient(90deg, rgba(245,158,11,0.4), transparent)' }} />
            </motion.div>
          </div>

          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            custom={0.5}
            className="flex-shrink-0 relative"
          >
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(245,158,11,0.35) 0%, transparent 70%)',
                filter: 'blur(40px)',
                transform: 'scale(1.6)',
              }}
            />
            <div
              className="relative w-56 h-56 sm:w-72 sm:h-72 lg:w-96 lg:h-96 rounded-full overflow-hidden"
              style={{
                border: '4px solid rgba(245,158,11,0.6)',
                boxShadow: '0 0 0 8px rgba(245,158,11,0.12), 0 0 0 16px rgba(245,158,11,0.06), 0 40px 100px rgba(0,0,0,0.6)',
                animation: 'float 6s ease-in-out infinite',
              }}
            >
              <img
                src="/logo.png"
                alt="Lakshmi Home Foods"
                className="w-full h-full object-cover"
              />
            </div>

            <motion.div
              initial={{ opacity: 0, x: -20, y: 10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="absolute -left-8 top-1/4 rounded-2xl px-4 py-3 text-center hidden sm:block"
              style={{
                background: 'rgba(15,15,15,0.95)',
                border: '1.5px solid rgba(245,158,11,0.4)',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              }}
            >
              <div className="font-heading text-2xl font-bold" style={{ color: '#f59e0b' }}>100%</div>
              <div className="font-body text-xs mt-1" style={{ color: '#a3a3a3' }}>Homemade</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20, y: 10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 1.3, duration: 0.7 }}
              className="absolute -right-8 bottom-12 rounded-2xl px-4 py-3 text-center hidden sm:block"
              style={{
                background: 'rgba(15,15,15,0.95)',
                border: '1.5px solid rgba(245,158,11,0.4)',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              }}
            >
              <div className="font-heading text-2xl font-bold" style={{ color: '#f59e0b' }}>0%</div>
              <div className="font-body text-xs mt-1" style={{ color: '#a3a3a3' }}>Preservatives</div>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          custom={1.3}
          className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4"
        >
          {stats.map(({ value, label, icon: Icon }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 + i * 0.1, duration: 0.5 }}
              className="text-center rounded-2xl py-4 px-3"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(245,158,11,0.12)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <Icon size={18} style={{ color: '#f59e0b', margin: '0 auto 6px' }} />
              <div className="font-heading text-2xl font-bold" style={{
                background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>{value}</div>
              <div className="font-body text-xs uppercase tracking-wider mt-1" style={{ color: '#737373' }}>{label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <motion.a
        href="#categories"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 transition-colors cursor-pointer"
        style={{ color: 'rgba(245,158,11,0.6)', animation: 'float 2.5s ease-in-out infinite' }}
      >
        <ChevronDown size={32} />
      </motion.a>
    </section>
  );
}
