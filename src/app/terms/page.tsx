"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { motion } from "framer-motion"

const termsContent = [
  {
    id: "01",
    title: "Acceptance of Terms",
    content: (
      <p>
        Welcome to Deepthi Living & Wellness ("we," "us," or "our"). By accessing, browsing, or using our website, or by purchasing our botanical products, you acknowledge that you have read, understood, and agree to be bound by these comprehensive Terms & Conditions. If you do not agree to all of these terms, you must expressly refrain from using our services or platform.
      </p>
    )
  },
  {
    id: "02",
    title: "Eligibility & Age Requirements",
    content: (
      <p>
        Our services are strictly intended for users who are at least 18 years of age, or the legal age of majority in your jurisdiction. By utilizing this website, you represent and warrant that you meet this age requirement and possess the legal authority to enter into binding contracts.
      </p>
    )
  },
  {
    id: "03",
    title: "User Accounts, Security & Registration",
    content: (
      <p>
        To access certain e-commerce features (such as order history and wishlists), you may be required to register for an account. You are solely responsible for maintaining the strict confidentiality of your account credentials (username and password). You agree to accept responsibility for all activities that occur under your account. Deepthi Living & Wellness reserves the right to suspend or terminate accounts, edit or remove content, or cancel orders at our sole discretion if fraudulent or malicious activity is suspected.
      </p>
    )
  },
  {
    id: "04",
    title: "Product Information & Botanical Disclaimer",
    content: (
      <>
        <p className="mb-4">
          Deepthi Living & Wellness formulates premium natural wellness products inspired by Ayurvedic and botanical wisdom. Due to the pure, natural origins of our active ingredients, slight variations in color, texture, and scent may naturally occur between batches. This variance is a hallmark of natural purity, not a product defect.
        </p>
        <p>
          <strong className="text-[#1F4D3A] font-semibold">Not Medical Advice:</strong> All products, descriptions, and information provided on this website are designed exclusively for cosmetic, holistic wellness, and general lifestyle enhancement purposes. They are strictly not intended to diagnose, treat, cure, or prevent any medical condition or disease. Always consult with a qualified healthcare professional regarding any specific health concerns before using new botanical formulations.
        </p>
      </>
    )
  },
  {
    id: "05",
    title: "Pricing, Billing, and Payment Methods",
    content: (
      <p>
        All prices displayed on our website are quoted in the applicable local currency and are subject to change without prior notice. We accept major credit cards, debit cards, and authorized third-party payment gateways. By submitting your payment information, you represent that you are authorized to use the chosen payment method. In the event of a pricing error due to typographical or system errors, we reserve the right to refuse or cancel any orders placed for products listed at the incorrect price, regardless of order confirmation status.
      </p>
    )
  },
  {
    id: "06",
    title: "Order Acceptance & Cancellation",
    content: (
      <p>
        The receipt of an order number or an email order confirmation does not constitute the acceptance of an order or a confirmation of an offer to sell. Deepthi Living & Wellness reserves the right, without prior notification, to limit the order quantity on any item and/or to refuse service to any customer. You may cancel your order only before it has been processed and dispatched from our fulfillment center.
      </p>
    )
  },
  {
    id: "07",
    title: "Shipping, Delivery & Risk of Loss",
    content: (
      <p>
        We aim to process and dispatch all confirmed orders within 2-3 business days. Delivery timelines are estimates and commence from the date of shipping. We are not liable for delays caused by customs clearance, courier service disruptions, or force majeure events. The risk of loss and title for all items purchased from us pass to you upon our delivery of the items to the designated shipping carrier.
      </p>
    )
  },
  {
    id: "08",
    title: "Returns, Refunds & Exchanges",
    content: (
      <p>
        Due to the sensitive, hygiene-dependent nature of our botanical formulations, we can only accept returns on unopened, unused products in their original, sealed packaging within 14 days of receipt. If your product arrives damaged or compromised, please photograph the damage and reach out to our wellness team at <em className="text-[#C8A96B]">care@deepthiliving.com</em> within 48 hours of delivery for a resolution.
      </p>
    )
  },
  {
    id: "09",
    title: "Subscription Services",
    content: (
      <p>
        If you enroll in any recurring subscription program (e.g., auto-replenish), you authorize us to automatically charge your on-file payment method at the frequency you selected. You may pause, modify, or cancel your subscription at any time through your account dashboard, provided the cancellation occurs at least 48 hours before the next scheduled billing cycle.
      </p>
    )
  },
  {
    id: "10",
    title: "Promotions, Discounts & Coupon Codes",
    content: (
      <p>
        From time to time, we may offer promotional codes or discounts. These codes are non-transferable, have no cash value, and cannot be combined with other offers unless explicitly stated. We reserve the right to modify, suspend, or terminate any promotional offer at any time without notice.
      </p>
    )
  },
  {
    id: "11",
    title: "Intellectual Property & Trademarks",
    content: (
      <p>
        All digital content, including but not limited to the Deepthi Living & Wellness brand name, logos, text, graphics, beautiful editorial photography, custom UI icons, imagery, audio clips, software, and proprietary botanical formulations, is the exclusive property of Deepthi Living & Wellness. It is protected by international copyright, trademark, and trade secret laws. Unauthorized reproduction, distribution, or commercial exploitation is strictly prohibited.
      </p>
    )
  },
  {
    id: "12",
    title: "User Generated Content & Reviews",
    content: (
      <p>
        If you submit reviews, comments, photos, or other content ("User Content"), you grant us a non-exclusive, royalty-free, perpetual, and fully sub-licensable right to use, reproduce, modify, adapt, publish, and display such content globally. You represent that you own or control all rights to the content you post and that it does not violate these Terms or infringe upon third-party rights.
      </p>
    )
  },
  {
    id: "13",
    title: "Third-Party Links & Services",
    content: (
      <p>
        Our platform may contain links to third-party websites or services (e.g., payment gateways or social media platforms) that are not owned or controlled by us. Deepthi Living & Wellness assumes no responsibility for the content, privacy policies, or practices of any third-party websites. You access them at your own risk.
      </p>
    )
  },
  {
    id: "14",
    title: "Prohibited Uses & Conduct",
    content: (
      <p>
        You are strictly prohibited from using the site or its content: (a) for any unlawful purpose; (b) to solicit others to perform or participate in unlawful acts; (c) to violate any international or regional regulations, rules, or laws; (d) to infringe upon our intellectual property rights; (e) to harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate; (f) to submit false or misleading information; (g) to upload viruses or malicious code; or (h) to scrape, data mine, or maliciously extract data.
      </p>
    )
  },
  {
    id: "15",
    title: "Privacy & Data Protection",
    content: (
      <p>
        Your submission of personal information through the e-commerce store is governed by our Privacy Policy. By agreeing to these Terms & Conditions, you also consent to the data collection, use, and sharing practices detailed in our Privacy Policy, including our use of cookies and analytics to enhance your shopping experience.
      </p>
    )
  },
  {
    id: "16",
    title: "Disclaimer of Warranties",
    content: (
      <p>
        Our website, services, and all products are provided on an "AS IS" and "AS AVAILABLE" basis without any warranties of any kind, either express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, durability, title, and non-infringement. We do not guarantee that your use of our service will be uninterrupted, timely, secure, or error-free.
      </p>
    )
  },
  {
    id: "17",
    title: "Limitation of Liability",
    content: (
      <p>
        In no case shall Deepthi Living & Wellness, our directors, officers, employees, affiliates, agents, contractors, interns, or suppliers be liable for any injury, loss, claim, or any direct, indirect, incidental, punitive, special, or consequential damages of any kind, including, without limitation lost profits, lost revenue, lost savings, loss of data, or any similar damages arising from your use of the service or any products procured using the service.
      </p>
    )
  },
  {
    id: "18",
    title: "Indemnification",
    content: (
      <p>
        You agree to indemnify, defend, and hold harmless Deepthi Living & Wellness and our parent, subsidiaries, affiliates, partners, officers, directors, agents, contractors, licensors, service providers, subcontractors, suppliers, and employees, harmless from any claim or demand, including reasonable attorneys’ fees, made by any third party due to or arising out of your breach of these Terms & Conditions or your violation of any law or the rights of a third party.
      </p>
    )
  },
  {
    id: "19",
    title: "Dispute Resolution & Arbitration",
    content: (
      <p>
        Any dispute, claim, or controversy arising out of or relating to these Terms & Conditions, or the breach thereof, shall be settled by binding arbitration administered by recognized arbitration associations in India, rather than in court, except that you may assert claims in small claims court if your claims qualify. You agree to waive any right to a jury trial or to participate in a class action.
      </p>
    )
  },
  {
    id: "20",
    title: "Severability",
    content: (
      <p>
        In the event that any provision of these Terms & Conditions is determined to be unlawful, void, or unenforceable, such provision shall nonetheless be enforceable to the fullest extent permitted by applicable law, and the unenforceable portion shall be deemed to be severed from these Terms. Such determination shall not affect the validity and enforceability of any other remaining provisions.
      </p>
    )
  },
  {
    id: "21",
    title: "Waiver",
    content: (
      <p>
        The failure of us to exercise or enforce any right or provision of these Terms & Conditions shall not constitute a waiver of such right or provision. A waiver by us of any default or breach shall not constitute a waiver of any subsequent default or breach.
      </p>
    )
  },
  {
    id: "22",
    title: "Entire Agreement",
    content: (
      <p>
        These Terms & Conditions, alongside our Privacy Policy and any other legal notices published on the site, constitute the entire agreement and understanding between you and us, governing your use of the Service. They supersede any prior or contemporaneous agreements, communications, and proposals, whether oral or written, between you and us (including, but not limited to, any prior versions of the Terms & Conditions).
      </p>
    )
  },
  {
    id: "23",
    title: "Changes to Terms",
    content: (
      <p>
        We reserve the right, at our sole discretion, to update, change, or replace any part of these Terms & Conditions by posting updates and changes to our website. It is your responsibility to check our website periodically for changes. Your continued use of or access to our website following the posting of any changes constitutes binding acceptance of those changes.
      </p>
    )
  },
  {
    id: "24",
    title: "Contact Information",
    content: (
      <p>
        Questions about the Terms & Conditions should be sent directly to our legal and customer support teams at <strong className="text-[#1F4D3A]">care@deepthiliving.com</strong> or via the contact form on our website. We aim to address all legal and policy inquiries within 72 business hours.
      </p>
    )
  }
]

export default function TermsPage() {
  return (
    <main className="min-h-screen" style={{ background: "#FDFBF7" }}>
      <Navbar />

      {/* Page Hero */}
      <div className="relative pt-20 overflow-hidden" style={{ minHeight: "280px", display: "flex", alignItems: "flex-end" }}>
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1600&auto=format&fit=crop" 
            alt="Deepthi Living Wellness" 
            className="w-full h-full object-cover"
            style={{ objectPosition: 'center 40%' }}
          />
          {/* Overlays for legibility and brand color */}
          <div className="absolute inset-0 bg-[#1F4D3A]/50" />
          <div className="absolute inset-0 bg-black/20" />
        </div>
        
        {/* Decorative pattern overlay */}
        <div className="absolute inset-0 opacity-[0.05] z-0" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(200,169,107,0.9) 1px, transparent 0)", backgroundSize: "24px 24px" }} />
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full pb-14 pt-16 relative z-10">
          <p className="text-[11px] font-bold tracking-[0.26em] uppercase mb-4" style={{ color: "#C8A96B" }}>Legal Information</p>
          <h1 className="text-4xl md:text-6xl font-serif" style={{ color: "#FDFBF7", fontWeight: 300 }}>Terms & Conditions</h1>
        </div>
      </div>

      <section className="px-6 lg:px-8 py-10" style={{ background: "#FDFBF7" }}>
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#C8A96B] mb-8 border-b border-[#C8A96B]/20 pb-2 inline-block">
            Last Updated: July 16, 2026
          </p>

          <div className="space-y-4">
            {termsContent.map((section, idx) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 group"
              >
                {/* Large Editorial Number */}
                <div className="md:col-span-1 md:text-right md:pr-2">
                  <span className="font-serif text-2xl text-[#1F4D3A]/30 font-bold group-hover:text-[#C8A96B] transition-colors duration-500">
                    {section.id}.
                  </span>
                </div>
                
                {/* Content Block */}
                <div className="md:col-span-11 pt-1">
                  <h2 className="text-lg font-serif text-[#1F4D3A] font-bold mb-2">
                    {section.title}
                  </h2>
                  <div className="text-sm leading-relaxed font-sans text-[#6B6B60]">
                    {section.content}
                  </div>
                </div>

                <div className="col-span-1 md:col-span-12">
                  <hr className="mt-2 border-[#1F4D3A]/5 group-hover:border-[#C8A96B]/20 transition-colors duration-500" />
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mt-12 p-6 md:p-8 border border-[#C8A96B]/30 rounded-[1rem] bg-white text-center shadow-md"
          >
            <p className="font-serif text-2xl text-[#1F4D3A] font-light mb-2">Have Questions?</p>
            <p className="font-sans font-light text-[#6B6B60] mb-6 text-sm">
              If you have any inquiries regarding these Terms & Conditions, our wellness team is here to guide you.
            </p>
            <a href="mailto:care@deepthiliving.com" className="inline-flex items-center justify-center px-6 py-3 bg-[#1F4D3A] text-[#FDFBF7] text-[10px] font-bold uppercase tracking-[0.2em] rounded-full hover:bg-[#C8A96B] transition-colors duration-500">
              Contact Us
            </a>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
