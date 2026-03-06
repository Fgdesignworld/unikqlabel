

import { Link } from 'react-router-dom';
import { motion } from "framer-motion"
import { Phone, MapPin, Instagram, Facebook, Youtube, Heart } from "lucide-react"
import { WhatsAppIcon } from '@/components/icons/whatsapp'
import { Image } from "@/components/ui/image"

const quickLinks = [
  { name: "Home", href: "/" },
  { name: "Products", href: "/products" },
  { name: "About Us", href: "/about" },
  { name: "Contact", href: "/contact" },
]

const categories = [
  { name: "Traditional Snacks", href: "/snacks" },
  { name: "Veg Pickles", href: "/pickles" },
  { name: "Spice Powders", href: "/spices" },
]

const socialLinks = [
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Youtube, href: "#", label: "Youtube" },
]

export function Footer() {
  return (
    <footer className="bg-gradient-to-b from-[#1a1410] to-[#0a0a0a] pt-16 pb-24 md:pb-8 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/" className="flex items-center gap-3 mb-6">
              <Image
                src="/logo.png"
                alt="Lakshmi Home Foods"
                width={60}
                height={60}
                className="rounded-full"
              />
              <div>
                <h3 className="font-serif text-xl font-bold text-[#fef3e2]">Lakshmi Home Foods</h3>
                <p className="text-[#d97706] text-sm">Pure Taste of Tradition</p>
              </div>
            </Link>
            <p className="text-[#fef3e2]/70 text-sm leading-relaxed mb-6">
              Authentic homemade traditional foods prepared with love and passed-down recipes from generations.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-full bg-[#d97706]/10 hover:bg-[#d97706]/20 flex items-center justify-center transition-colors group"
                >
                  <social.icon className="w-5 h-5 text-[#d97706] group-hover:text-[#f59e0b] transition-colors" />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h4 className="font-serif text-lg font-bold text-[#fef3e2] mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-[#fef3e2]/70 hover:text-[#d97706] transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h4 className="font-serif text-lg font-bold text-[#fef3e2] mb-6">Categories</h4>
            <ul className="space-y-3">
              {categories.map((category) => (
                <li key={category.name}>
                  <Link
                    to={category.href}
                    className="text-[#fef3e2]/70 hover:text-[#d97706] transition-colors text-sm"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h4 className="font-serif text-lg font-bold text-[#fef3e2] mb-6">Contact Us</h4>
            <div className="space-y-4">
              <a
                href="https://wa.me/918639424039"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-[#fef3e2]/70 hover:text-[#25D366] transition-colors text-sm"
              >
                <WhatsAppIcon className="w-5 h-5 text-[#25D366]" />
                WhatsApp: 8639424039
              </a>
              <a
                href="tel:+918639424039"
                className="flex items-center gap-3 text-[#fef3e2]/70 hover:text-[#d97706] transition-colors text-sm"
              >
                <Phone className="w-5 h-5 text-[#d97706]" />
                +91 8639424039
              </a>
              <div className="flex items-start gap-3 text-[#fef3e2]/70 text-sm">
                <MapPin className="w-5 h-5 text-[#d97706] flex-shrink-0" />
                <span>Andhra Pradesh, India</span>
              </div>
            </div>

            {/* WhatsApp Button */}
            <a
              href="https://wa.me/918639424039"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white font-medium rounded-full hover:bg-[#128C7E] transition-colors text-sm"
            >
              <WhatsAppIcon className="w-4 h-4" />
              Chat with us
            </a>
          </motion.div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-[#d97706]/30 to-transparent mb-8" />

        {/* Copyright */}
        <div className="text-center">
          <p className="text-[#fef3e2]/50 text-sm flex items-center justify-center gap-1">
            Made with <Heart className="w-4 h-4 text-[#dc2626] fill-[#dc2626]" /> by Lakshmi Home Foods
          </p>
        </div>
      </div>
    </footer>
  )
}
