'use client'

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '@/services/authService'
import { useToast } from '@/hooks/use-toast'
import {
    ShieldCheck, KeyRound, Mail, Eye, EyeOff, Loader2, CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function PasswordStrengthBar({ password }: { password: string }) {
    const score = (() => {
        if (!password) return 0
        let s = 0
        if (password.length >= 8)  s++
        if (password.length >= 12) s++
        if (/[A-Z]/.test(password)) s++
        if (/[0-9]/.test(password)) s++
        if (/[^A-Za-z0-9]/.test(password)) s++
        return s
    })()
    const labels = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong']
    const colors = ['', 'bg-red-500', 'bg-orange-500', 'bg-amber-400', 'bg-green-500', 'bg-emerald-500']
    if (!password) return null
    return (
        <div className="mt-2 space-y-1">
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(i => (
                    <div
                        key={i}
                        className={cn(
                            'h-1 flex-1 rounded-full transition-colors duration-300',
                            i <= score ? colors[score] : 'bg-gray-700'
                        )}
                    />
                ))}
            </div>
            <p className={cn('text-xs font-medium', score >= 4 ? 'text-green-400' : score >= 3 ? 'text-amber-400' : 'text-red-400')}>
                {labels[score]}
            </p>
        </div>
    )
}

type FieldProps = {
    id: string
    label: string
    value: string
    onChange: (v: string) => void
    placeholder?: string
    autoComplete?: string
}

function PasswordField({ id, label, value, onChange, placeholder, autoComplete }: FieldProps) {
    const [show, setShow] = useState(false)
    return (
        <div>
            <label htmlFor={id} className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                {label}
            </label>
            <div className="relative">
                <input
                    id={id}
                    type={show ? 'text' : 'password'}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                    autoComplete={autoComplete ?? 'off'}
                    className="w-full bg-white border border-slate-300 text-slate-800 placeholder-slate-400 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-colors"
                />
                <button
                    type="button"
                    onClick={() => setShow(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    tabIndex={-1}
                    aria-label={show ? 'Hide password' : 'Show password'}
                >
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
            </div>
        </div>
    )
}

// ─── Change-Password card ─────────────────────────────────────────────────────

function ChangePasswordCard() {
    const navigate = useNavigate()
    const { toast } = useToast()

    const [form, setForm] = useState({
        current_password: '',
        new_password: '',
        confirm_password: '',
    })
    const [loading, setLoading] = useState(false)
    const [done, setDone] = useState(false)

    const set = (k: keyof typeof form) => (v: string) => setForm(f => ({ ...f, [k]: v }))

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (loading || done) return

        if (!form.current_password || !form.new_password || !form.confirm_password) {
            toast({ title: 'All fields are required', variant: 'destructive' })
            return
        }
        if (form.new_password !== form.confirm_password) {
            toast({ title: 'Passwords do not match', variant: 'destructive' })
            return
        }
        if (form.new_password.length < 8 || !/[A-Za-z]/.test(form.new_password) || !/[0-9]/.test(form.new_password)) {
            toast({ title: 'Password must be at least 8 characters with a letter and a number', variant: 'destructive' })
            return
        }

        setLoading(true)
        try {
            const res = await authService.changePassword(form)
            setDone(true)
            toast({ title: res.message })
            // API invalidates session — redirect to login after a short delay
            if (res.relogin) {
                setTimeout(() => navigate('/admin/login', { replace: true }), 2000)
            }
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Something went wrong'
            toast({ title: msg, variant: 'destructive' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-200 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <KeyRound className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                    <h2 className="text-slate-900 font-black text-">Change Password</h2>
                    <p className="text-gray-500 text-xs mt-0.5">You will be signed out after changing your password</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {done ? (
                    <div className="flex flex-col items-center gap-3 py-6 text-center">
                        <CheckCircle2 className="w-12 h-12 text-green-400" />
                        <p className="text-slate-800 font-bold">Password changed successfully!</p>
                        <p className="text-gray-400 text-sm">Redirecting you to login…</p>
                    </div>
                ) : (
                    <>
                        <PasswordField
                            id="cp-current"
                            label="Current Password"
                            value={form.current_password}
                            onChange={set('current_password')}
                            placeholder="Enter your current password"
                            autoComplete="current-password"
                        />

                        <div>
                            <PasswordField
                                id="cp-new"
                                label="New Password"
                                value={form.new_password}
                                onChange={set('new_password')}
                                placeholder="Min. 8 chars, letters + numbers"
                                autoComplete="new-password"
                            />
                            <PasswordStrengthBar password={form.new_password} />
                        </div>

                        <PasswordField
                            id="cp-confirm"
                            label="Confirm New Password"
                            value={form.confirm_password}
                            onChange={set('confirm_password')}
                            placeholder="Re-enter new password"
                            autoComplete="new-password"
                        />

                        {/* Match indicator */}
                        {form.confirm_password && (
                            <p className={cn('text-xs font-medium', form.new_password === form.confirm_password ? 'text-green-400' : 'text-red-400')}>
                                {form.new_password === form.confirm_password ? '✓ Passwords match' : '✗ Passwords do not match'}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/50 text-black font-black text-sm py-3 rounded-xl transition-colors"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                            {loading ? 'Updating…' : 'Update Password'}
                        </button>
                    </>
                )}
            </form>
        </div>
    )
}

// ─── Change-Email card ────────────────────────────────────────────────────────

function ChangeEmailCard() {
    const { toast } = useToast()

    const [form, setForm] = useState({ current_password: '', new_email: '' })
    const [loading, setLoading] = useState(false)
    const [successEmail, setSuccessEmail] = useState<string | null>(null)

    const set = (k: keyof typeof form) => (v: string) => setForm(f => ({ ...f, [k]: v }))

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (loading) return

        if (!form.current_password || !form.new_email) {
            toast({ title: 'All fields are required', variant: 'destructive' })
            return
        }
        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
        if (!emailRe.test(form.new_email)) {
            toast({ title: 'Please enter a valid email address', variant: 'destructive' })
            return
        }

        setLoading(true)
        try {
            const res = await authService.changeEmail(form)
            setSuccessEmail(res.new_email)
            setForm({ current_password: '', new_email: '' })
            toast({ title: res.message })
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Something went wrong'
            toast({ title: msg, variant: 'destructive' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-200 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                    <h2 className="text-slate-900 font-black text-">Change Email Address</h2>
                    <p className="text-gray-500 text-xs mt-0.5">Your email is used to sign in — confirm with your password</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {successEmail && (
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20">
                        <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                        <p className="text-green-300 text-sm font-medium">Email updated to <span className="font-bold">{successEmail}</span></p>
                    </div>
                )}

                <div>
                    <label htmlFor="ce-email" className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                        New Email Address
                    </label>
                    <input
                        id="ce-email"
                        type="email"
                        value={form.new_email}
                        onChange={e => set('new_email')(e.target.value)}
                        placeholder="admin@example.com"
                        autoComplete="email"
                        className="w-full bg-white border border-slate-300 text-slate-800 placeholder-slate-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-colors"
                    />
                </div>

                <PasswordField
                    id="ce-password"
                    label="Confirm with Current Password"
                    value={form.current_password}
                    onChange={set('current_password')}
                    placeholder="Enter your current password to confirm"
                    autoComplete="current-password"
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/50 text-black font-black text-sm py-3 rounded-xl transition-colors"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                    {loading ? 'Updating…' : 'Update Email'}
                </button>
            </form>
        </div>
    )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminAccountPage() {
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Page header */}
            <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                    <h1 className="text-slate-900 font-black text-">Account Security</h1>
                    <p className="text-gray-500 text-sm">Manage your admin credentials</p>
                </div>
            </div>

            {/* Security notice */}
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
                <ShieldCheck className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <p className="text-amber-300/80 text-xs leading-relaxed">
                    All credential changes require your current password as confirmation. 
                    After changing your password you will be automatically signed out for security.
                </p>
            </div>

            <ChangePasswordCard />
            <ChangeEmailCard />
        </div>
    )
}
