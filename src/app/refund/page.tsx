"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { motion } from "framer-motion"

const refundContent = [
  {
    id: "01",
    title: "Overview",
    content: (
      <p>
        At Deepthi Living & Wellness, we hold our botanical products to the highest standards of quality and purity. Because our formulations are natural, personal care items, we have strict hygiene and safety protocols. This Refund & Return Policy outlines the specific conditions under which returns and refunds are accepted.
      </p>
    )
  },
  {
    id: "02",
    title: "14-Day Return Window",
    content: (
      <p>
        We accept returns on physical products within <strong>14 days</strong> of the delivery date. To be eligible for a return, the item must be completely unused, unopened, and in the exact same condition that you received it. The item must also be in its original, sealed packaging.
      </p>
    )
  },
  {
    id: "03",
    title: "Non-Returnable Items",
    content: (
      <>
        <p className="mb-2">For health, safety, and hygiene reasons, the following items are strictly non-returnable and non-refundable:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Any product that has been opened, unsealed, or used.</li>
          <li>Gift cards and digital gift certificates.</li>
          <li>Items purchased during a final sale, clearance, or promotional event.</li>
          <li>Custom or personalized wellness bundles.</li>
        </ul>
      </>
    )
  },
  {
    id: "04",
    title: "Damaged or Defective Products",
    content: (
      <p>
        We meticulously inspect every order before dispatch. However, if your product arrives damaged or compromised during transit, please contact us at <em className="text-[#C8A96B]">care@deepthiliving.com</em> within <strong>48 hours</strong> of delivery. You must include your order number and clear photographs of the damaged item and packaging. We will expedite a replacement or issue a full refund at our discretion.
      </p>
    )
  },
  {
    id: "05",
    title: "Return Process",
    content: (
      <>
        <p className="mb-2">To initiate a return, please follow these steps:</p>
        <ul className="list-decimal pl-5 space-y-1">
          <li>Email <em className="text-[#C8A96B]">care@deepthiliving.com</em> with your order number and reason for return.</li>
          <li>Wait for our team to approve the return and provide you with a Return Merchandise Authorization (RMA) number and shipping address.</li>
          <li>Securely pack the unopened item(s) and clearly write the RMA number on the outside of the package.</li>
          <li>Ship the package using a trackable shipping service.</li>
        </ul>
      </>
    )
  },
  {
    id: "06",
    title: "Return Shipping Costs",
    content: (
      <p>
        You will be responsible for paying your own shipping costs for returning your item, unless the return is due to our error (e.g., you received an incorrect or defective item). Original shipping costs are non-refundable. If you receive a refund, the cost of original shipping will be deducted from your refund. We highly recommend using a trackable shipping service or purchasing shipping insurance, as we cannot guarantee that we will receive your returned item.
      </p>
    )
  },
  {
    id: "07",
    title: "Refund Processing Times",
    content: (
      <p>
        Once your return is received and inspected by our warehouse team, we will send you an email to notify you of the approval or rejection of your refund. If approved, your refund will be processed, and a credit will automatically be applied to your credit card or original method of payment within <strong>5 to 10 business days</strong>, depending on your financial institution.
      </p>
    )
  },
  {
    id: "08",
    title: "Late or Missing Refunds",
    content: (
      <p>
        If you haven’t received a refund after 10 business days, first check your bank account again. Then, contact your credit card company or bank, as it often takes processing time before a refund is officially posted. If you’ve done all of this and still have not received your refund, please contact us at <strong className="text-[#1F4D3A]">care@deepthiliving.com</strong>.
      </p>
    )
  },
  {
    id: "09",
    title: "Exchanges",
    content: (
      <p>
        We only replace items if they are defective or damaged upon arrival. We do not offer direct exchanges for different products. If you wish to try a different product, you must return the unopened original item (subject to this policy) and place a new order for the desired item.
      </p>
    )
  },
  {
    id: "10",
    title: "Allergic Reactions",
    content: (
      <p>
        As all of our products are formulated with potent, natural botanical ingredients, we strongly advise reading the full ingredient list before purchase. We do not offer refunds for allergic reactions or sensitivities. We recommend performing a patch test before full application. If you have specific known allergies, please consult with a healthcare professional prior to purchasing.
      </p>
    )
  }
]

export default function RefundPage() {
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
          <p className="text-[11px] font-bold tracking-[0.26em] uppercase mb-4" style={{ color: "#C8A96B" }}>Customer Care</p>
          <h1 className="text-4xl md:text-6xl font-serif" style={{ color: "#FDFBF7", fontWeight: 300 }}>Refund Policy</h1>
        </div>
      </div>

      <section className="px-6 lg:px-8 py-10" style={{ background: "#FDFBF7" }}>
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#C8A96B] mb-8 border-b border-[#C8A96B]/20 pb-2 inline-block">
            Last Updated: July 16, 2026
          </p>

          <div className="space-y-4">
            {refundContent.map((section, idx) => (
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
            <p className="font-serif text-2xl text-[#1F4D3A] font-light mb-2">Need to Start a Return?</p>
            <p className="font-sans font-light text-[#6B6B60] mb-6 text-sm">
              If your item meets the conditions above, our customer care team is ready to assist you with the return process.
            </p>
            <a href="mailto:care@deepthiliving.com" className="inline-flex items-center justify-center px-6 py-3 bg-[#1F4D3A] text-[#FDFBF7] text-[10px] font-bold uppercase tracking-[0.2em] rounded-full hover:bg-[#C8A96B] transition-colors duration-500">
              Contact Support
            </a>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
