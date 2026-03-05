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

export default function App() {
  return (
    <RootLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/pickles" element={<PicklesPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/snacks" element={<SnacksPage />} />
        <Route path="/spices" element={<SpicesPage />} />
      </Routes>
    </RootLayout>
  );
}