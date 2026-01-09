'use client'

import { useState } from 'react'

interface RegistrationFormProps {
    eventId: string
    feeINR: number
    eventSlug: string
}

export default function RegistrationForm({ eventId, feeINR, eventSlug }: RegistrationFormProps) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        collegeName: '',
        branch: '',
        year: '',
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            // 1. Create Registration Record
            const res = await fetch('/api/registrations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, eventId }),
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Registration failed')

            const { registrationId, paymentUrl } = data

            // 2. Redirect based on fee
            if (feeINR === 0) {
                window.location.href = `/payment/success?registration_id=${registrationId}`
            } else if (paymentUrl) {
                window.location.href = paymentUrl
            } else {
                throw new Error('Payment URL not generated')
            }
        } catch (err: any) {
            setError(err.message)
            setLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Full Name</label>
                    <input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                        placeholder="Rahul Sharma"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Email</label>
                    <input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                        placeholder="rahul@college.edu"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Phone</label>
                    <input
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                        placeholder="+91..."
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">College Name</label>
                    <input
                        name="collegeName"
                        value={formData.collegeName}
                        onChange={handleChange}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                        placeholder="IIT Delhi"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Branch</label>
                    <input
                        name="branch"
                        value={formData.branch}
                        onChange={handleChange}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                        placeholder="Computer Science"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Year of Study</label>
                    <select
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                        required
                    >
                        <option value="">Select Year</option>
                        <option value="1">1st Year</option>
                        <option value="2">2nd Year</option>
                        <option value="3">3rd Year</option>
                        <option value="4">4th Year</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl text-center font-medium">
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-900/20 active:scale-[0.98] transition-all disabled:opacity-50"
            >
                {loading ? 'Processing...' : feeINR > 0 ? `Pay ₹${feeINR} & Register` : 'Register for Free'}
            </button>

            <p className="text-center text-xs text-slate-500 mt-4">
                By registering, you agree to our terms and conditions.
            </p>
        </form>
    )
}
