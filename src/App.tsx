import { Routes, Route } from 'react-router-dom';

import RootLayout from '@/app/layout';

import HomePage from '@/app/page';
import AboutPage from '@/app/about/page';
import CheckoutPage from '@/app/checkout/page';
import ContactPage from '@/app/contact/page';
import ProductsPage from '@/app/products/page';
import ProductDetailPage from '@/app/products/detail';
import MenPage from '@/app/men/page';
import WomenPage from '@/app/women/page';
import UnisexPage from '@/app/unisex/page';
import TrackOrderPage from '@/app/track/page';

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
import AdminVariantsPage from '@/app/admin/variants/page';
import AdminColorsPage from '@/app/admin/colors/page';
import AdminLeadsPage from '@/app/admin/leads/page';

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<RootLayout><HomePage /></RootLayout>} path="/" />
      <Route path="/about" element={<RootLayout><AboutPage /></RootLayout>} />
      <Route path="/checkout" element={<RootLayout><CheckoutPage /></RootLayout>} />
      <Route path="/contact" element={<RootLayout><ContactPage /></RootLayout>} />
      <Route path="/men" element={<RootLayout><MenPage /></RootLayout>} />
      <Route path="/women" element={<RootLayout><WomenPage /></RootLayout>} />
      <Route path="/unisex" element={<RootLayout><UnisexPage /></RootLayout>} />
      <Route path="/track" element={<RootLayout><TrackOrderPage /></RootLayout>} />
      <Route path="/products" element={<RootLayout><ProductsPage /></RootLayout>} />
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
        <Route path="variants" element={<AdminVariantsPage />} />
        <Route path="colors" element={<AdminColorsPage />} />
        <Route path="leads" element={<AdminLeadsPage />} />
      </Route>
    </Routes>
  );
}
