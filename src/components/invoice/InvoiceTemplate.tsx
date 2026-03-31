import React, { useState } from 'react';
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
    size?: string;
    color?: string;
    quantity: number;
    price: number;
    originalPrice?: number;
    discountPercent?: number;
    image: string;
  }>;
  subtotal: number;
  delivery: number | string;
  discount?: number;
  couponCode?: string | null;
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
  discount = 0,
  couponCode = null,
  total,
  startIndex = 0,
  showTotals = true,
  showBillingInfo = true,
  showFooter = true,
}: InvoiceTemplateProps) => {
  const { settings } = useSettings()
  const [logoError, setLogoError] = useState(false)

  // Resolve logo URL — follow the same pattern as admin settings and favicon handling
  // If it's a relative path (starts with /), prepend /api. Otherwise use as-is.
  const getLogoUrl = () => {
    const url = settings?.logo_url
    if (!url) return null
    // Already absolute URL? Use as-is
    if (url.startsWith('http')) return url
    // Relative path? Add /api prefix (backend stores as /uploads/... and serves at /api/uploads/...)
    if (url.startsWith('/')) return `/api${url}`
    // Default case - shouldn't happen
    return url
  }

  const logoPng = getLogoUrl()

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
        UNIKQ LABEL
      </div>

      {/* Header */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '35px', marginTop: '10px' }}>
        <div style={{ flex: 1 }}>
          {logoPng && !logoError ? (
            <img
              src={logoPng}
              crossOrigin="anonymous"
              alt={settings?.site_name || 'UNIKQ LABEL'}
              onError={() => {
                console.error('Logo failed to load:', logoPng)
                setLogoError(true)
              }}
              style={{ height: '70px', maxWidth: '250px', objectFit: 'contain', display: 'block', marginBottom: '5px' }}
            />
          ) : (
            <>
              <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '900', color: '#000', letterSpacing: '-1.5px', lineHeight: 1 }}>
                {settings?.site_name || 'UNIKQ LABEL'}
              </h1>
              <p style={{ margin: '6px 0 0 0', color: '#666', fontSize: '14px', fontWeight: '500' }}>{settings?.site_tagline || 'Premium Fashion \u2022 Everyday Royalty'}</p>
            </>
          )}
        </div>
        <div style={{ textAlign: 'right', marginLeft: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '3px', color: 'var(--theme-color)' }}>Invoice</h2>
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
            <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#000' }}>UNIKQ LABEL</p>
            <p style={{ margin: '4px 0', fontSize: '13px', color: '#666' }}>Premium Fashion Collective</p>
            <p style={{ margin: '4px 0', fontSize: '13px', color: 'var(--theme-color)', fontWeight: '700' }}>WA: {settings?.whatsapp || '+91 8639424039'}</p>
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
              <th style={{ textAlign: 'center', padding: '12px 10px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#000', letterSpacing: '1px' }}>Variant</th>
              <th style={{ textAlign: 'center', padding: '12px 10px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#000', letterSpacing: '1px' }}>Qty</th>
              <th style={{ textAlign: 'center', padding: '12px 10px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#000', letterSpacing: '1px' }}>Rate</th>
              <th style={{ textAlign: 'center', padding: '12px 10px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#000', letterSpacing: '1px' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td style={{ textAlign: 'left', padding: '12px 10px', borderBottom: '1px solid #f0f0f0', fontSize: '13px', fontWeight: '700', color: '#000000ff' }}>{startIndex + index + 1}</td>
                <td style={{ padding: '12px 10px', borderBottom: '1px solid #f0f0f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <img src={item.image} crossOrigin="anonymous" style={{ width: '45px', height: '45px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #fee2b3', padding: '1px', backgroundColor: '#fff' }} alt="" />
                    <div>
                      <p style={{ margin: 0, fontWeight: '800', fontSize: '14px', color: '#000' }}>{item.name}</p>
                    </div>
                  </div>
                </td>
                  <td style={{ textAlign: 'center', padding: '12px 10px', borderBottom: '1px solid #f0f0f0', fontSize: '12px', fontWeight: '600' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', flexWrap: 'wrap' }}>
                      {item.size && (
                        <span style={{ display: 'inline-block', backgroundColor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '6px', padding: '2px 7px', color: '#b45309', fontWeight: '700', fontSize: '11px', lineHeight: '1.4' }}>
                          {item.size}
                        </span>
                      )}
                      {item.color && (
                        <span style={{ display: 'inline-block', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '2px 7px', color: '#475569', fontWeight: '700', fontSize: '11px', lineHeight: '1.4' }}>
                          {item.color}
                        </span>
                      )}
                      {!item.size && !item.color && (
                        <span style={{ color: '#aaa', fontSize: '12px' }}>—</span>
                      )}
                    </div>
                  </td>
                <td style={{ textAlign: 'center', padding: '12px 10px', borderBottom: '1px solid #f0f0f0', fontSize: '13px', fontWeight: '600' }}>{item.quantity}</td>
                <td style={{ textAlign: 'center', padding: '12px 10px', borderBottom: '1px solid #f0f0f0', verticalAlign: 'middle' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                     {item.originalPrice && (
                      <div style={{ position: 'relative', display: 'inline-block', lineHeight: 1 }}>
                        <div style={{ fontSize: '10px', color: '#ef4444', fontWeight: '700', position: 'relative', zIndex: 1, padding: '0 2px' }}>
                          {settings?.currency_symbol || '₹'}{item.originalPrice}
                        </div>
                        {/* Forced offset for line to ensure it passes through text in PDF renderers - adjusted slightly lower */}
                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, height: '1.2px', backgroundColor: '#ef4444', zIndex: 2 }} />
                      </div>
                    )}
                    <div style={{ fontSize: '15px', fontWeight: '900', color: 'var(--theme-color)', lineHeight: 1 }}>
                      {settings?.currency_symbol || '₹'}{item.price}
                    </div>
                  </div>
                </td>
                <td style={{ textAlign: 'center', padding: '12px 10px', borderBottom: '1px solid #f0f0f0', verticalAlign: 'middle' }}>
                  <div style={{ fontSize: '15px', fontWeight: '900', color: '#000', lineHeight: 1 }}>
                    {settings?.currency_symbol || '₹'}{item.price * item.quantity}
                  </div>
                  {item.originalPrice && (
                    <div style={{ fontSize: '10px', color: '#10b981', fontWeight: '800', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Save {settings?.currency_symbol || '₹'}{Math.round((item.originalPrice - item.price) * item.quantity)}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Section */}
      {showTotals && (
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'flex-end', marginTop: '0px' }}>
          <div style={{ width: '280px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 15px', fontSize: '14px', color: '#4b5563', fontWeight: '600' }}>
              <span>Subtotal</span>
              <span style={{ color: '#000', fontWeight: '800' }}>{settings?.currency_symbol || '₹'}{subtotal}</span>
            </div>
            {(() => {
              const totalSaved = items.reduce((sum, item) => {
                if (item.originalPrice) {
                  return sum + Math.round((item.originalPrice - item.price) * item.quantity)
                }
                return sum
              }, 0)
              return totalSaved > 0 ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 15px', fontSize: '14px', color: '#dc2626', fontWeight: '800' }}>
                  <span>Discount Saved</span>
                  <span>-{settings?.currency_symbol || '₹'}{totalSaved}</span>
                </div>
              ) : null
            })()}
            {discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 15px', fontSize: '14px', color: '#10b981', fontWeight: '800' }}>
                <span>Coupon{couponCode ? ` (${couponCode})` : ''}</span>
                <span>-{settings?.currency_symbol || '₹'}{discount}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 15px 15px 15px', fontSize: '14px', color: '#4b5563', fontWeight: '600', borderBottom: '1px dashed #e5e7eb', marginBottom: '15px' }}>
              <span>Delivery</span>
              <span style={{ 
                color: typeof delivery === 'string' && (delivery.includes('Free') || delivery.includes('0')) ? '#10b981' : '#000', 
                fontWeight: '800' 
              }}>
                {typeof delivery === 'string' ? delivery : `${settings?.currency_symbol || '₹'}${delivery}`}
              </span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '0px 20px', 
              backgroundColor: '#000', 
              borderRadius: '12px', 
              color: '#fff',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              height: '40px',
              paddingBottom: '10px'
            }}>
              <span style={{ fontSize: '13px', fontWeight: '800', letterSpacing: '2px', marginBottom: '2px' }}>Total Amount</span>
              <span style={{ fontSize: '22px', fontWeight: '900', color: '#fbbf24', marginBottom: '2px' }}>{settings?.currency_symbol || '₹'}{total}</span>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      {showFooter && (
        <div style={{ position: 'relative', zIndex: 1, marginTop: '40px', textAlign: 'center' }}>
          <p style={{ margin: '0 0 5px 0', fontSize: '14px', fontWeight: '800', color: '#000' }}>Thank you for your order!</p>
          <p style={{ margin: 0, fontSize: '12px', color: '#666', fontWeight: '500' }}>Questions? WhatsApp: <span style={{ color: 'var(--theme-color)', fontWeight: '700' }}>{settings?.whatsapp || '+91 8639424039'}</span></p>

        </div>
      )}
    </div>
  );
};
