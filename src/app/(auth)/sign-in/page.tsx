'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignInPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const res = await fetch('/api/auth/sign-in', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            })

            const data = await res.json()
            if (res.ok) {
                router.push('/dashboard')
                router.refresh()
            } else {
                setError(data.error || 'Invalid credentials')
            }
        } catch (err) {
            setError('Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="glass p-8 rounded-2xl shadow-2xl border border-white/10">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                    Welcome Back
                </h1>
                <p className="text-slate-400 mt-2">Sign in to manage your club events</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                        placeholder="admin@college.edu"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                        placeholder="••••••••"
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
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold py-3 rounded-lg shadow-lg shadow-purple-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Signing In...' : 'Sign In'}
                </button>
            </form>

            <div className="mt-6 text-center text-slate-400 text-sm">
                Don't have an account?{' '}
                <Link href="/auth/sign-up" className="text-purple-400 hover:text-purple-300 font-medium underline underline-offset-4">
                    Create a Club
                </Link>
            </div>
        </div>
    )
}
