import React from 'react';
import { useSettings } from '@/context/settings-context'

interface InvoiceTemplateProps {
  id: string;
  invoiceNumber: string;
  date: string;
  customerDetails: {
    name: string;
    phone: string;
    address: string;
    city: string;
    pincode: string;
  };
  items: Array<{
    name: string;
    weight: string;
    quantity: number;
    price: number;
    image: string;
  }>;
  subtotal: number;
  delivery: number | string;
  total: number;
  startIndex?: number; // Added to support sequential numbering
  showTotals?: boolean; // Controlled by the generator
  showBillingInfo?: boolean; // Controlled by the generator
  showFooter?: boolean; // Added to only show on final page
}

export const InvoiceTemplate = ({
  id,
  invoiceNumber,
  date,
  customerDetails,
  items,
  subtotal,
  delivery,
  total,
  startIndex = 0,
  showTotals = true,
  showBillingInfo = true,
  showFooter = true,
}: InvoiceTemplateProps) => {
  const { settings } = useSettings()
  return (
    <div
      id={id}
      style={{
        position: 'absolute',
        top: '-9999px',
        left: '-9999px',
        width: '800px',
        padding: '35px 45px',
        backgroundColor: '#ffffff',
        color: '#1a1a1a',
        fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
        lineHeight: '1.3',
        boxSizing: 'border-box',
      }}
    >
      {/* Header Accent */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '10px', background: 'linear-gradient(90deg, #d97706, #b45309, #78350f)' }} />

      {/* Subtle Watermark */}
      <div style={{ 
        position: 'absolute', 
        top: '55%', 
        left: '50%', 
        transform: 'translate(-50%, -50%) rotate(-30deg)', 
        fontSize: '110px', 
        fontWeight: '900', 
        color: 'rgba(217, 119, 6, 0.03)', 
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
        zIndex: 0,
        textTransform: 'uppercase'
      }}>
        Laxmi Home Foods
      </div>

      {/* Header */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '35px', marginTop: '10px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '900', color: '#000', letterSpacing: '-1.5px', lineHeight: 1 }}>
            Laxmi <span style={{ color: '#d97706' }}>Home Foods</span>
          </h1>
          <p style={{ margin: '6px 0 0 0', color: '#666', fontSize: '14px', fontWeight: '500' }}>Pure Taste of Tradition • Fresh & Homemade</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '3px', color: '#d97706' }}>Invoice</h2>
          <div style={{ marginTop: '8px', fontSize: '14px', color: '#333' }}>
            <p style={{ margin: '2px 0' }}><strong>No:</strong> <span style={{ color: '#000' }}>{invoiceNumber}</span></p>
            <p style={{ margin: '2px 0' }}><strong>Date:</strong> <span style={{ color: '#000' }}>{date}</span></p>
          </div>
        </div>
      </div>

      {/* Details Section */}
      {showBillingInfo && (
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: '40px', marginBottom: '35px' }}>
          <div style={{ flex: 1, padding: '15px 20px', backgroundColor: '#fdf8f0', border: '1px solid #fee2b3', borderRadius: '12px' }}>
            <h3 style={{ textTransform: 'uppercase', fontSize: '10px', fontWeight: '800', color: '#b45309', letterSpacing: '1.2px', marginBottom: '10px' }}>Billed To</h3>
            <p style={{ margin: '0', fontSize: '18px', fontWeight: '800', color: '#000' }}>{customerDetails.name}</p>
            <p style={{ margin: '4px 0', fontSize: '14px', color: '#444', fontWeight: '500' }}>+91 {customerDetails.phone}</p>
            <div style={{ marginTop: '8px', fontSize: '13px', color: '#444', lineHeight: '1.5' }}>
              <p style={{ margin: 0 }}>{customerDetails.address}</p>
              <p style={{ margin: 0 }}>{customerDetails.city} - {customerDetails.pincode}</p>
            </div>
          </div>
          <div style={{ width: '200px', paddingTop: '5px' }}>
            <h3 style={{ textTransform: 'uppercase', fontSize: '10px', fontWeight: '800', color: '#999', letterSpacing: '1.2px', marginBottom: '10px' }}>Store Info</h3>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#000' }}>Laxmi Home Foods</p>
            <p style={{ margin: '4px 0', fontSize: '13px', color: '#666' }}>Quality Homemade Products</p>
            <p style={{ margin: '4px 0', fontSize: '13px', color: '#d97706', fontWeight: '700' }}>WA: +91 8639424039</p>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: showTotals ? '30px' : '0' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #1a1a1a' }}>
              <th style={{ textAlign: 'left', padding: '12px 10px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#000', letterSpacing: '1px', width: '40px' }}>No.</th>
              <th style={{ textAlign: 'left', padding: '12px 10px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#000', letterSpacing: '1px' }}>Item Details</th>
              <th style={{ textAlign: 'center', padding: '12px 10px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#000', letterSpacing: '1px' }}>Weight</th>
              <th style={{ textAlign: 'center', padding: '12px 10px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#000', letterSpacing: '1px' }}>Qty</th>
              <th style={{ textAlign: 'right', padding: '12px 10px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#000', letterSpacing: '1px' }}>Rate</th>
              <th style={{ textAlign: 'right', padding: '12px 10px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#000', letterSpacing: '1px' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td style={{ textAlign: 'left', padding: '12px 10px', borderBottom: '1px solid #f0f0f0', fontSize: '13px', fontWeight: '700', color: '#666' }}>{startIndex + index + 1}</td>
                <td style={{ padding: '12px 10px', borderBottom: '1px solid #f0f0f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <img src={item.image} crossOrigin="anonymous" style={{ width: '45px', height: '45px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #fee2b3', padding: '1px', backgroundColor: '#fff' }} alt="" />
                    <div>
                      <p style={{ margin: 0, fontWeight: '800', fontSize: '14px', color: '#000' }}>{item.name}</p>
                      <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#999', fontWeight: '600', textTransform: 'uppercase' }}>Authentic • Homemade</p>
                    </div>
                  </div>
                </td>
                <td style={{ textAlign: 'center', padding: '12px 10px', borderBottom: '1px solid #f0f0f0', fontSize: '13px', fontWeight: '600' }}>{item.weight}</td>
                <td style={{ textAlign: 'center', padding: '12px 10px', borderBottom: '1px solid #f0f0f0', fontSize: '13px', fontWeight: '600' }}>{item.quantity}</td>
                <td style={{ textAlign: 'right', padding: '12px 10px', borderBottom: '1px solid #f0f0f0', fontSize: '13px', fontWeight: '600' }}>{settings?.currency_symbol || '₹'}{item.price}</td>
                <td style={{ textAlign: 'right', padding: '12px 10px', borderBottom: '1px solid #f0f0f0', fontSize: '14px', fontWeight: '800', color: '#d97706' }}>{settings?.currency_symbol || '₹'}{item.price * item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Section */}
      {showTotals && (
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
          <div style={{ width: '280px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', fontSize: '13px', color: '#666', fontWeight: '500' }}>
              <span>Subtotal</span>
              <span style={{ color: '#000', fontWeight: '700' }}>{settings?.currency_symbol || '₹'}{subtotal}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', fontSize: '13px', color: '#666', fontWeight: '500' }}>
              <span>Delivery</span>
              <span style={{ 
                color: typeof delivery === 'string' && delivery.includes('Free') ? '#10b981' : '#000', 
                fontWeight: '700' 
              }}>
                {typeof delivery === 'string' ? delivery : `${settings?.currency_symbol || '₹'}${delivery}`}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 12px', marginTop: '10px', backgroundColor: '#000', borderRadius: '10px', color: '#fff' }}>
              <span style={{ fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px', alignSelf: 'center' }}>Total Amount</span>
              <span style={{ fontSize: '20px', fontWeight: '900', color: '#fbbf24' }}>{settings?.currency_symbol || '₹'}{total}</span>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      {showFooter && (
        <div style={{ position: 'relative', zIndex: 1, marginTop: '40px', textAlign: 'center' }}>
          <p style={{ margin: '0 0 5px 0', fontSize: '14px', fontWeight: '800', color: '#000' }}>Thank you for your order!</p>
          <p style={{ margin: 0, fontSize: '12px', color: '#666', fontWeight: '500' }}>Questions? WhatsApp: <span style={{ color: '#d97706', fontWeight: '700' }}>+91 8639424039</span></p>
          <div style={{ marginTop: '20px', borderTop: '1px dashed #eee', paddingTop: '15px', fontSize: '10px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '2px' }}>
            • Quality Homemade Traditions •
          </div>
        </div>
      )}
    </div>
  );
};
