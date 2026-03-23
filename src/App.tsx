import { Routes, Route } from 'react-router-dom';

import RootLayout from '@/app/layout';

import HomePage from '@/app/page';
import AboutPage from '@/app/about/page';
import CheckoutPage from '@/app/checkout/page';
import ContactPage from '@/app/contact/page';
import PicklesPage from '@/app/pickles/page';
import ProductsPage from '@/app/products/page';
import SnacksPage from '@/app/snacks/page';
import SpicesPage from '@/app/spices/page';

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

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<RootLayout><HomePage /></RootLayout>} path="/" />
      <Route path="/about" element={<RootLayout><AboutPage /></RootLayout>} />
      <Route path="/checkout" element={<RootLayout><CheckoutPage /></RootLayout>} />
      <Route path="/contact" element={<RootLayout><ContactPage /></RootLayout>} />
      <Route path="/pickles" element={<RootLayout><PicklesPage /></RootLayout>} />
      <Route path="/products" element={<RootLayout><ProductsPage /></RootLayout>} />
      <Route path="/snacks" element={<RootLayout><SnacksPage /></RootLayout>} />
      <Route path="/spices" element={<RootLayout><SpicesPage /></RootLayout>} />

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
      </Route>
    </Routes>
  );
}
