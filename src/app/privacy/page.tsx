"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { motion } from "framer-motion"

const privacyContent = [
  {
    id: "01",
    title: "Introduction & Scope",
    content: (
      <p>
        Deepthi Living & Wellness ("we," "our," or "us") respects your privacy and is deeply committed to protecting it through our compliance with this policy. This Privacy Policy describes the types of personal data we may collect from you or that you may provide when you visit our website, as well as our practices for collecting, using, maintaining, protecting, and disclosing that data across our global e-commerce infrastructure.
      </p>
    )
  },
  {
    id: "02",
    title: "Definitions",
    content: (
      <p>
        For the purposes of this Privacy Policy: <strong>"Personal Data"</strong> means any information relating to an identified or identifiable natural person. <strong>"Data Controller"</strong> refers to Deepthi Living & Wellness, the legal entity that determines the purposes and means of processing Personal Data. <strong>"Data Processor"</strong> refers to third-party vendors (like AWS or Stripe) who process data on our behalf.
      </p>
    )
  },
  {
    id: "03",
    title: "Information We Collect Directly From You",
    content: (
      <>
        <p className="mb-2">We collect personal information that you voluntarily provide to us when you register, express an interest in obtaining information, or purchase products. This includes:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Identity Data:</strong> First name, last name, username, title, and date of birth.</li>
          <li><strong>Contact Data:</strong> Billing address, delivery address, email address, and telephone numbers.</li>
          <li><strong>Financial Data:</strong> Bank account and payment card details (processed securely via encrypted gateways; we do not store full credit card numbers).</li>
          <li><strong>Transaction Data:</strong> Details about payments to and from you and other details of products you have purchased from us.</li>
        </ul>
      </>
    )
  },
  {
    id: "04",
    title: "Information We Collect Automatically",
    content: (
      <p>
        As you interact with our website, we will automatically collect Technical Data about your equipment, browsing actions, and patterns. We collect this personal data by using cookies, server logs, web beacons, pixels, and other similar technologies. This includes your IP address, browser type and version, time zone setting, browser plug-in types and versions, operating system, and platform technology.
      </p>
    )
  },
  {
    id: "05",
    title: "Information from Third Parties",
    content: (
      <p>
        We may receive personal data about you from various third parties and public sources, such as analytics providers (like Google), advertising networks (like Meta/Facebook), and search information providers. We may also receive Contact, Financial, and Transaction Data from providers of technical, payment, and delivery services.
      </p>
    )
  },
  {
    id: "06",
    title: "How We Use Your Information",
    content: (
      <>
        <p className="mb-2">We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>To perform the contract we are about to enter into or have entered into with you (e.g., processing your order).</li>
          <li>To manage our relationship with you, including notifying you about changes to our terms or asking you to leave a review.</li>
          <li>To administer and protect our business and this website (including troubleshooting, data analysis, testing, and system maintenance).</li>
          <li>To deliver relevant website content and advertisements to you and measure or understand the effectiveness of the advertising we serve.</li>
        </ul>
      </>
    )
  },
  {
    id: "07",
    title: "Legal Basis for Processing (GDPR)",
    content: (
      <p>
        For users in the European Economic Area (EEA) and UK, our legal basis for collecting and using the personal information described above will depend on the personal information concerned and the specific context in which we collect it. We normally process personal information from you where we need the information to perform a contract with you, where the processing is in our legitimate interests, or where we have your explicit consent to do so.
      </p>
    )
  },
  {
    id: "08",
    title: "Sharing & Disclosure of Information",
    content: (
      <p>
        We strictly <strong>do not sell</strong> your personal data. We may share your personal data with internal third parties (subsidiaries) and external third parties, such as service providers acting as processors who provide IT, system administration, shipping logistics (e.g., FedEx, UPS), and payment processing services. We require all third parties to respect the security of your personal data and to treat it in accordance with the law.
      </p>
    )
  },
  {
    id: "09",
    title: "International Data Transfers",
    content: (
      <p>
        We share your personal data within our corporate group. This will involve transferring your data outside the European Economic Area (EEA). Whenever we transfer your personal data out of the EEA, we ensure a similar degree of protection is afforded to it by implementing safeguards, such as specific contracts approved by the European Commission (Standard Contractual Clauses) which give personal data the same protection it has in Europe.
      </p>
    )
  },
  {
    id: "10",
    title: "Cookies, Pixels & Tracking Technologies",
    content: (
      <p>
        You can set your browser to refuse all or some browser cookies, or to alert you when websites set or access cookies. If you disable or refuse cookies, please note that some parts of this website may become inaccessible or not function properly. We use both session cookies (which expire when you close your browser) and persistent cookies (which stay on your device until deleted).
      </p>
    )
  },
  {
    id: "11",
    title: "Third-Party Analytics",
    content: (
      <p>
        We use Google Analytics and similar services to evaluate your use of our website, compile reports on activity, and provide other services relating to website activity and internet usage. These third parties use cookies and other technologies to help analyze and provide us the data. By using our website, you consent to the processing of data about you by these analytics providers.
      </p>
    )
  },
  {
    id: "12",
    title: "Targeted Advertising & Opt-Out",
    content: (
      <p>
        We may use your Identity, Contact, Technical, Usage, and Profile Data to form a view on what we think you may want or need, or what may be of interest to you. You can opt-out of targeted advertising by using the opt-out mechanisms provided by the Digital Advertising Alliance (DAA) or by adjusting your privacy settings directly on platforms like Facebook and Google.
      </p>
    )
  },
  {
    id: "13",
    title: "Data Security & Encryption",
    content: (
      <p>
        We have put in place appropriate, enterprise-grade security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way, altered, or disclosed. This includes TLS/SSL encryption for data in transit and AES-256 encryption for data at rest. Access to your personal data is strictly limited to employees, agents, and contractors who have a business need to know.
      </p>
    )
  },
  {
    id: "14",
    title: "Data Retention Policy",
    content: (
      <p>
        We will only retain your personal data for as long as reasonably necessary to fulfill the purposes we collected it for. By law, we have to keep basic information about our customers (including Contact, Identity, Financial and Transaction Data) for six years for tax and auditing purposes. In some circumstances, we will anonymize your personal data so that it can no longer be associated with you, in which case we may use this information indefinitely without further notice to you.
      </p>
    )
  },
  {
    id: "15",
    title: "Your Rights: General",
    content: (
      <p>
        Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to request access to your personal data, request correction of your personal data, request erasure of your personal data, object to processing of your personal data, request restriction of processing your personal data, request transfer of your personal data, and the right to withdraw consent.
      </p>
    )
  },
  {
    id: "16",
    title: "Your Rights: GDPR (European Users)",
    content: (
      <p>
        If you are a resident of the EEA or UK, you have the right to lodge a complaint at any time with a supervisory authority for data protection issues. We would, however, appreciate the chance to deal with your concerns before you approach the supervisory authority, so please contact us in the first instance. You have the absolute right to be "forgotten" and have all identifiable records purged from our systems upon request.
      </p>
    )
  },
  {
    id: "17",
    title: "Your Rights: CCPA/CPRA (California Residents)",
    content: (
      <p>
        If you are a California resident, the California Consumer Privacy Act (CCPA) provides you with specific rights regarding your personal information. You have the right to request that we disclose certain information to you about our collection and use of your personal information over the past 12 months. We do not sell personal information, and therefore we have not sold personal information in the preceding 12 months.
      </p>
    )
  },
  {
    id: "18",
    title: "Do Not Track (DNT) Signals",
    content: (
      <p>
        Some web browsers incorporate a "Do Not Track" (DNT) or similar feature that signals to websites that a user does not want to have their online activity and behavior tracked. At this time, there is no uniform technological standard for recognizing and implementing DNT signals. As such, we do not currently respond to DNT browser signals.
      </p>
    )
  },
  {
    id: "19",
    title: "Children's Privacy",
    content: (
      <p>
        Our website is intended for a general audience and is not directed to children. We do not knowingly collect personal information from children under 16. If we become aware that we have collected personal data from a child under 16 without legally valid parental consent, we will take immediate steps to delete such information from our databases.
      </p>
    )
  },
  {
    id: "20",
    title: "Automated Decision-Making & Profiling",
    content: (
      <p>
        We do not use your personal data for automated decision-making or profiling that produces legal or similarly significant effects. We may use basic automated systems to recommend products or personalize your browsing experience based on your past purchase history.
      </p>
    )
  },
  {
    id: "21",
    title: "Third-Party Links",
    content: (
      <p>
        This website may include links to third-party websites, plug-ins, and applications. Clicking on those links or enabling those connections may allow third parties to collect or share data about you. We do not control these third-party websites and are not responsible for their privacy statements. When you leave our website, we encourage you to read the privacy policy of every website you visit.
      </p>
    )
  },
  {
    id: "22",
    title: "Changes to This Privacy Policy",
    content: (
      <p>
        We keep our Privacy Policy under regular review. Any changes we make to our privacy policy in the future will be posted on this page and, where appropriate, notified to you by email. Please check back frequently to see any updates or changes to our privacy policy.
      </p>
    )
  },
  {
    id: "23",
    title: "Contact Information & Data Protection Officer",
    content: (
      <p>
        We have appointed a data protection officer (DPO) who is responsible for overseeing questions in relation to this privacy policy. If you have any questions about this privacy policy, including any requests to exercise your legal rights, please contact the DPO at <strong className="text-[#1F4D3A]">privacy@deepthiliving.com</strong>.
      </p>
    )
  }
]

export default function PrivacyPage() {
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
          <p className="text-[11px] font-bold tracking-[0.26em] uppercase mb-4" style={{ color: "#C8A96B" }}>Data Protection</p>
          <h1 className="text-4xl md:text-6xl font-serif" style={{ color: "#FDFBF7", fontWeight: 300 }}>Privacy Policy</h1>
        </div>
      </div>

      <section className="px-6 lg:px-8 py-10" style={{ background: "#FDFBF7" }}>
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#C8A96B] mb-8 border-b border-[#C8A96B]/20 pb-2 inline-block">
            Last Updated: July 16, 2026
          </p>

          <div className="space-y-4">
            {privacyContent.map((section, idx) => (
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
            <p className="font-serif text-2xl text-[#1F4D3A] font-light mb-2">Data Privacy Questions?</p>
            <p className="font-sans font-light text-[#6B6B60] mb-6 text-sm">
              If you have any inquiries regarding how we handle your data, our privacy officer is here to guide you.
            </p>
            <a href="mailto:privacy@deepthiliving.com" className="inline-flex items-center justify-center px-6 py-3 bg-[#1F4D3A] text-[#FDFBF7] text-[10px] font-bold uppercase tracking-[0.2em] rounded-full hover:bg-[#C8A96B] transition-colors duration-500">
              Email Privacy Team
            </a>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
