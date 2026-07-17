"use client"

import { useState, useEffect } from 'react'
import { deliveryService, type DeliveryRule } from '@/services/deliveryService'
import { useToast } from '@/hooks/use-toast'
import { Save, Loader2, Truck, AlertTriangle, CheckCircle2, IndianRupee } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Preview row ─────────────────────────────────────────────────────────────
function PreviewRow({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
    return (
        <div className="flex items-center justify-between py-2.5 border-b border-slate-200 last:border-0">
            <span className="text-gray-400 text-sm">{label}</span>
            <span className={cn('text-sm font-bold', highlight ? 'text-amber-400' : 'text-white')}>{value}</span>
        </div>
    )
}

export default function AdminDeliveryPage() {
    const { toast } = useToast()
    const [rule, setRule]           = useState<DeliveryRule | null>(null)
    const [form, setForm]           = useState<Omit<DeliveryRule, 'id' | 'updated_at'>>({
        min_order_amount:    0,
        delivery_fee:        40,
        free_delivery_above: 500,
        is_active:           true,
    })
    const [loading, setLoading]     = useState(true)
    const [saving, setSaving]       = useState(false)
    const [dirty, setDirty]         = useState(false)
    const [testAmount, setTestAmount] = useState('')

    const load = async () => {
        try {
            const data = await deliveryService.adminGet()
            if (data) {
                setRule(data)
                setForm({
                    min_order_amount:    parseFloat(data.min_order_amount as unknown as string) || 0,
                    delivery_fee:        parseFloat(data.delivery_fee as unknown as string) || 40,
                    free_delivery_above: parseFloat(data.free_delivery_above as unknown as string) || 500,
                    is_active:           !!data.is_active,
                })
            }
        } catch {
            toast({ title: 'Failed to load delivery rules', variant: 'destructive' })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [])

    const setField = (key: keyof typeof form, val: unknown) => {
        setForm(prev => ({ ...prev, [key]: val }))
        setDirty(true)
    }

    const handleSave = async () => {
        // Validation
        if (form.free_delivery_above > 0 && form.free_delivery_above <= form.min_order_amount) {
            toast({ title: '"Free delivery above" must be greater than minimum order', variant: 'destructive' })
            return
        }
        setSaving(true)
        try {
            const updated = await deliveryService.update(form)
            setRule(updated)
            toast({ title: 'Delivery rules saved!' })
            setDirty(false)
        } catch {
            toast({ title: 'Save failed', variant: 'destructive' })
        } finally {
            setSaving(false)
        }
    }

    // Live preview for test amount
    const testSubtotal = parseFloat(testAmount) || 0
    const testBlocked  = form.min_order_amount > 0 && testSubtotal > 0 && testSubtotal < form.min_order_amount
    const testFree     = testSubtotal >= form.free_delivery_above
    const testFee      = testFree ? 0 : form.delivery_fee

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full" />
            </div>
        )
    }

    return (
        <div className="p-4 md:p-6 max-w-2xl space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">Delivery Rules</h1>
                    <p className="text-gray-500 text-sm mt-1">Configure minimum order & delivery fees</p>
                </div>
                <button onClick={handleSave} disabled={saving || !dirty}
                    className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black text-sm font-black rounded-xl transition-all">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Rules
                </button>
            </div>

            {dirty && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2.5 text-amber-400 text-sm font-bold">
                    You have unsaved changes
                </div>
            )}

            {/* Rule form */}
            <div className="bg-[#F8F9FD] border border-slate-200 rounded-2xl p-5 space-y-5">
                <div className="flex items-center gap-2 pb-4 border-b border-slate-200">
                    <Truck className="w-5 h-5 text-amber-500" />
                    <h2 className="text-slate-900 font-black">Delivery Configuration</h2>
                </div>

                {/* Min order */}
                <div>
                    <label className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-2">
                        Minimum Order Amount (₹)
                    </label>
                    <div className="relative">
                        <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                        <input type="number" min={0} step={0.01} value={form.min_order_amount}
                            onChange={e => setField('min_order_amount', parseFloat(e.target.value) || 0)}
                            className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-amber-500/50 transition-all"
                        />
                    </div>
                    <p className="text-gray-600 text-xs mt-1">Set to 0 to allow any order amount</p>
                </div>

                {/* Delivery fee */}
                <div>
                    <label className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-2">
                        Delivery Fee (₹)
                    </label>
                    <div className="relative">
                        <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                        <input type="number" min={0} step={0.01} value={form.delivery_fee}
                            onChange={e => setField('delivery_fee', parseFloat(e.target.value) || 0)}
                            className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-amber-500/50 transition-all"
                        />
                    </div>
                </div>

                {/* Free above */}
                <div>
                    <label className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-2">
                        Free Delivery Above (₹)
                    </label>
                    <div className="relative">
                        <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                        <input type="number" min={0} step={0.01} value={form.free_delivery_above}
                            onChange={e => setField('free_delivery_above', parseFloat(e.target.value) || 0)}
                            className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-amber-500/50 transition-all"
                        />
                    </div>
                    <p className="text-gray-600 text-xs mt-1">Set to 0 to always charge delivery fee</p>
                </div>

                {/* Active toggle */}
                <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-4">
                    <div>
                        <p className="text-slate-800 text-sm font-bold">Enable Delivery Rules</p>
                        <p className="text-gray-500 text-xs mt-0.5">When disabled, no delivery fee is charged</p>
                    </div>
                    <button type="button" onClick={() => setField('is_active', !form.is_active)}
                        className={cn('w-11 h-6 rounded-full transition-colors relative', form.is_active ? 'bg-amber-500' : 'bg-gray-700')}>
                        <span className={cn('absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all', form.is_active ? 'left-5' : 'left-0.5')} />
                    </button>
                </div>

                {/* Validation warning */}
                {form.free_delivery_above > 0 && form.free_delivery_above <= form.min_order_amount && (
                    <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 text-red-400 text-sm">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        "Free delivery above" must be greater than minimum order amount
                    </div>
                )}
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: 'Min Order', value: form.min_order_amount > 0 ? `₹${form.min_order_amount}` : 'No min', color: 'text-blue-400' },
                    { label: 'Delivery Fee', value: `₹${form.delivery_fee}`, color: 'text-amber-400' },
                    { label: 'Free Above', value: form.free_delivery_above > 0 ? `₹${form.free_delivery_above}` : 'Never free', color: 'text-green-400' },
                ].map(s => (
                    <div key={s.label} className="bg-[#F8F9FD] border border-slate-200 rounded-2xl p-4 text-center">
                        <p className="text-gray-500 text-xs font-bold mb-1">{s.label}</p>
                        <p className={cn('text-lg font-black', s.color)}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Live simulator */}
            <div className="bg-[#F8F9FD] border border-slate-200 rounded-2xl p-5">
                <h3 className="text-slate-900 font-black mb-4">Rule Simulator</h3>
                <div className="relative mb-4">
                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                    <input type="number" min={0} value={testAmount} onChange={e => setTestAmount(e.target.value)}
                        placeholder="Enter cart total to test..."
                        className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-4 py-2.5 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-amber-500/50 transition-all"
                    />
                </div>

                {testAmount && (
                    <div className="space-y-1">
                        <PreviewRow label="Cart Total" value={`₹${testSubtotal.toFixed(2)}`} />
                        <PreviewRow label="Delivery Fee" value={testBlocked ? '—' : `₹${testFee.toFixed(2)}`} highlight={testFee === 0 && !testBlocked} />
                        <PreviewRow label="Order Total" value={testBlocked ? 'Blocked' : `₹${(testSubtotal + testFee).toFixed(2)}`} />
                        <div className="mt-3 pt-3 border-t border-slate-200">
                            {testBlocked ? (
                                <div className="flex items-center gap-2 text-red-400 text-sm font-bold">
                                    <AlertTriangle className="w-4 h-4" />
                                    Order blocked — minimum is ₹{form.min_order_amount}
                                </div>
                            ) : testFee === 0 ? (
                                <div className="flex items-center gap-2 text-green-400 text-sm font-bold">
                                    <CheckCircle2 className="w-4 h-4" />
                                    Free delivery applies!
                                </div>
                            ) : (
                                <div className="text-gray-500 text-sm">
                                    Add ₹{(form.free_delivery_above - testSubtotal).toFixed(2)} more for free delivery
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
