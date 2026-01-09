'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignUpPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        collegeName: '',
        clubName: '',
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const res = await fetch('/api/auth/sign-up', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            const data = await res.json()
            if (res.ok) {
                router.push('/dashboard')
                router.refresh()
            } else {
                setError(data.error || 'Something went wrong')
            }
        } catch (err) {
            setError('Connection error. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    return (
        <div className="glass p-8 rounded-2xl shadow-2xl border border-white/10 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="text-center mb-6">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                    Launch Your Club
                </h1>
                <p className="text-slate-400 mt-2">Get started with FestPilot today</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Your Name</label>
                        <input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="John Doe"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Phone</label>
                        <input
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="+91..."
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">College Email</label>
                    <input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="admin@college.edu"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                    <input
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="••••••••"
                        required
                    />
                </div>

                <div className="pt-2 border-t border-slate-700/50">
                    <label className="block text-sm font-medium text-purple-400 mb-1">Club Name</label>
                    <input
                        name="clubName"
                        value={formData.clubName}
                        onChange={handleChange}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Coding Club / Music Society"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">College Name</label>
                    <input
                        name="collegeName"
                        value={formData.collegeName}
                        onChange={handleChange}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="IIT Bombay / VIT"
                        required
                    />
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-lg text-center">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold py-3 rounded-lg shadow-lg active:scale-[0.98] transition-all disabled:opacity-50"
                >
                    {loading ? 'Creating Account...' : 'Sign Up & Create Club'}
                </button>
            </form>

            <div className="mt-6 text-center text-slate-400 text-sm">
                Already have an account?{' '}
                <Link href="/auth/sign-in" className="text-purple-400 hover:text-purple-300 font-medium underline underline-offset-4">
                    Sign In
                </Link>
            </div>
        </div>
    )
}
