// GA4 — global type safety for window.gtag
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

import RootLayout from '@/app/layout';

import HomePage from '@/app/page';
import AboutPage from '@/app/about/page';
import CheckoutPage from '@/app/checkout/page';
import ContactPage from '@/app/contact/page';
import ProductsPage from '@/app/products/page';
import ProductDetailPage from '@/app/products/detail';
import TrackOrderPage from '@/app/track/page';
import HairCarePage from '@/app/hair-care/page';
import BodyCarePage from '@/app/body-care/page';
import BestSellersPage from '@/app/best-sellers/page';
import SustainabilityPage from '@/app/sustainability/page';
import FaqPage from '@/app/faq/page';

// Admin pages
import AdminLoginPage from '@/app/admin/login/page';
import AdminLayout from '@/app/admin/layout';
import AdminDashboard from '@/app/admin/dashboard/page';
import AdminProductsPage from '@/app/admin/products/page';
import AdminProductFormPage from '@/app/admin/products/form-page';
import AdminOrdersPage from '@/app/admin/orders/page';
import AdminCategoriesPage from '@/app/admin/categories/page';
import AdminSeoPage from '@/app/admin/seo/page';
import AdminSettingsPage from '@/app/admin/settings/page';
import AdminPopupPage from '@/app/admin/popup/page';
import AdminDeliveryPage from '@/app/admin/delivery/page';
import AdminNotificationsPage from '@/app/admin/notifications/page';
import AdminReviewsPage from '@/app/admin/reviews/page'
import AdminCustomersPage from '@/app/admin/customers/page'
import AdminHeroPage from '@/app/admin/hero/page';
import AdminLeadsPage from '@/app/admin/leads/page';
import AdminCouponsPage from '@/app/admin/coupons/page';
import AdminInventoryPage from '@/app/admin/inventory/page';
import AdminAccountPage from '@/app/admin/account/page';

export default function App() {
  // GA4 — track page views on every SPA route change
  const location = useLocation();
  useEffect(() => {
    if (typeof window.gtag === 'function') {
      window.gtag('config', 'G-Q3R84P7LCB', {
        page_path: location.pathname,
      });
    }
  }, [location]);

  return (
    <Routes>
      {/* Public routes */}
      <Route element={<RootLayout><HomePage /></RootLayout>} path="/" />
      <Route path="/about" element={<RootLayout><AboutPage /></RootLayout>} />
      <Route path="/our-story" element={<RootLayout><AboutPage /></RootLayout>} />
      <Route path="/checkout" element={<RootLayout><CheckoutPage /></RootLayout>} />
      <Route path="/contact" element={<RootLayout><ContactPage /></RootLayout>} />
      <Route path="/hair-care" element={<RootLayout><HairCarePage /></RootLayout>} />
      <Route path="/body-care" element={<RootLayout><BodyCarePage /></RootLayout>} />
      <Route path="/best-sellers" element={<RootLayout><BestSellersPage /></RootLayout>} />
      <Route path="/sustainability" element={<RootLayout><SustainabilityPage /></RootLayout>} />
      <Route path="/faq" element={<RootLayout><FaqPage /></RootLayout>} />
      <Route path="/track" element={<RootLayout><TrackOrderPage /></RootLayout>} />
      <Route path="/products" element={<RootLayout><ProductsPage /></RootLayout>} />
      <Route path="/shop" element={<RootLayout><ProductsPage /></RootLayout>} />
      <Route path="/products/:slug" element={<RootLayout><ProductDetailPage /></RootLayout>} />

      {/* Admin routes */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="products/new" element={<AdminProductFormPage />} />
        <Route path="products/:id" element={<AdminProductFormPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="seo" element={<AdminSeoPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
        <Route path="popup" element={<AdminPopupPage />} />
        <Route path="delivery" element={<AdminDeliveryPage />} />
        <Route path="notifications" element={<AdminNotificationsPage />} />
        <Route path="reviews" element={<AdminReviewsPage />} />
        <Route path="customers" element={<AdminCustomersPage />} />
        <Route path="hero" element={<AdminHeroPage />} />
        <Route path="leads" element={<AdminLeadsPage />} />
        <Route path="coupons" element={<AdminCouponsPage />} />
        <Route path="inventory" element={<AdminInventoryPage />} />
        <Route path="account" element={<AdminAccountPage />} />
      </Route>
    </Routes>
  );
}
