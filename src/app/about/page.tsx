

import { ImgHTMLAttributes } from 'react';
const Image = ({ priority, fill, quality, ...rest }: ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean, fill?: boolean, quality?: number }) => <img {...rest} />;
import { motion } from "framer-motion"
import { Heart, Leaf, Clock, Award } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PageHeader } from "@/components/page-header"
import { useSeo } from "@/hooks/use-seo"

const features = [
  {
    icon: Heart,
    title: "Made with Love",
    description: "Every product is prepared with care and attention to detail, just like homemade food.",
  },
  {
    icon: Leaf,
    title: "Pure Ingredients",
    description: "We use only the freshest and purest ingredients sourced from trusted local farmers.",
  },
  {
    icon: Clock,
    title: "Traditional Methods",
    description: "Our recipes follow time-tested traditional methods passed down through generations.",
  },
  {
    icon: Award,
    title: "Quality Assured",
    description: "Every batch is carefully prepared and quality checked before packaging.",
  },
]

const sections = [
  {
    title: "Our Story",
    image: "/images/about-hero.jpg",
    content:
      "Lakshmi Home Foods was born from a simple dream - to share the authentic taste of traditional Andhra cuisine with everyone. What started as a small kitchen venture preparing pickles and snacks for family and friends has now grown into a trusted brand that delivers the pure taste of tradition to homes across the country. Our founder, inspired by her grandmother's recipes, wanted to preserve the authentic flavors that are slowly disappearing in this fast-paced world.",
  },
  {
    title: "Our Kitchen",
    image: "/images/our-kitchen.jpg",
    content:
      "Our kitchen is where tradition meets hygiene. While we maintain the age-old methods of preparation - grinding spices on stone, slow cooking for perfect flavor development, and hand-mixing for the right texture - we also ensure the highest standards of cleanliness and food safety. Every corner of our kitchen reflects our commitment to quality and authenticity.",
  },
  {
    title: "Our Ingredients",
    image: "/images/our-ingredients.jpg",
    content:
      "The secret to our exceptional taste lies in our ingredients. We source the finest red chillies from Guntur, the purest turmeric from local farms, fresh coconuts, and premium quality oils. No artificial colors, no preservatives, no shortcuts - just pure, natural ingredients that your grandmother would approve of. Each ingredient is carefully selected and processed to retain maximum flavor and nutrition.",
  },
]

export default function AboutPage() {
  useSeo({ pageType: 'page', pageSlug: 'about', fallbackTitle: 'About Us — Lakshmi Home Foods' })
  return (
    <main className="min-h-screen bg-[#0f0f0f]">
      <Navbar />
      <PageHeader
        title="About Us"
        subtitle="The story behind Lakshmi Home Foods and our commitment to authentic flavors"
        backgroundImage="/images/about-hero.jpg"
      />

      {/* Features Grid */}
      <section className="px-4 pb-16">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-6 bg-gradient-to-br from-[#1a1410] to-[#0f0f0f] rounded-2xl border border-[#d97706]/10 text-center group hover:border-[#d97706]/30 transition-all"
              >
                <div className="w-14 h-14 mx-auto mb-4 bg-[#d97706]/10 rounded-full flex items-center justify-center group-hover:bg-[#d97706]/20 transition-colors">
                  <feature.icon className="w-7 h-7 text-[#d97706]" />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#fef3e2] mb-2">{feature.title}</h3>
                <p className="text-[#fef3e2]/60 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Sections */}
      {sections.map((section, index) => (
        <section key={section.title} className="px-4 pb-20">
          <div className="container mx-auto max-w-7xl">
            <div
              className={`flex flex-col ${
                index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
              } gap-12 items-center`}
            >
              {/* Image */}
              <motion.div
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="w-full lg:w-1/2"
              >
                <div className="relative aspect-[4/3] rounded-3xl overflow-hidden">
                  <Image
                    src={section.image}
                    alt={section.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f]/40 via-transparent to-transparent" />
                  
                  {/* Decorative border */}
                  <div className="absolute inset-4 border-2 border-[#d97706]/30 rounded-2xl" />
                </div>
              </motion.div>

              {/* Content */}
              <motion.div
                initial={{ opacity: 0, x: index % 2 === 0 ? 50 : -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="w-full lg:w-1/2"
              >
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#fef3e2] mb-6">
                  {section.title}
                </h2>
                <div className="w-20 h-1 bg-[#d97706] mb-6" />
                <p className="text-[#fef3e2]/70 leading-relaxed text-lg">{section.content}</p>
              </motion.div>
            </div>
          </div>
        </section>
      ))}

      {/* CTA Section */}
      <section className="px-4 pb-20">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 md:p-12 bg-gradient-to-br from-[#d97706]/20 to-[#7f1d1d]/20 rounded-3xl border border-[#d97706]/20 text-center"
          >
            <h3 className="font-serif text-2xl md:text-3xl font-bold text-[#fef3e2] mb-4">
              Experience the Authentic Taste
            </h3>
            <p className="text-[#fef3e2]/70 mb-8 max-w-xl mx-auto">
              Join thousands of happy customers who have made Lakshmi Home Foods a part of their daily meals.
            </p>
            <a
              href="https://wa.me/918639424039"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#25D366] text-white font-bold rounded-full hover:bg-[#128C7E] transition-colors"
            >
              Order Now on WhatsApp
            </a>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
