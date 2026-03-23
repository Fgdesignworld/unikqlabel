
import React from 'react';
import { CartProvider } from '@/context/cart-context';
import { CartSidebar } from '@/components/cart-sidebar';
import { FloatingWhatsApp } from '@/components/floating-whatsapp';
import { MobileBottomBar } from '@/components/mobile-bottom-bar';
import { ScrollToTop } from '@/components/scroll-to-top';
import { OfferPopup } from '@/components/offer-popup';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-sans antialiased bg-[#0f0f0f] text-[#fef3e2] min-h-screen">
      <CartProvider>
        <ScrollToTop />
        {children}
        <CartSidebar />
        <FloatingWhatsApp />
        <MobileBottomBar />
        <OfferPopup />
      </CartProvider>
    </div>
  );
}
