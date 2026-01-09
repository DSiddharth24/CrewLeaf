'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Info } from 'lucide-react'

export default function NewEventPage() {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        venue: '',
        city: '',
        state: '',
        startDateTime: '',
        endDateTime: '',
        registrationOpen: '',
        registrationClose: '',
        feeINR: 0,
        maxParticipants: '',
        isPublic: true,
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const res = await fetch('/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            const data = await res.json()
            if (res.ok) {
                router.push(`/dashboard/events/${data.id}`)
            } else {
                setError(data.error || 'Failed to create event')
            }
        } catch (err) {
            setError('Connection error')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value
        setFormData({ ...formData, [e.target.name]: value })
    }

    return (
        <div className="max-w-4xl mx-auto">
            <Link href="/dashboard/events" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 group">
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                Back to Events
            </Link>

            <div className="glass p-10 rounded-3xl border-white/5 shadow-2xl">
                <h1 className="text-3xl font-bold mb-8">Create New Event</h1>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <section className="space-y-4">
                        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Info className="w-4 h-4" />
                            Basic Information
                        </h2>
                        <div className="grid gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Event Title</label>
                                <input
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                    placeholder="e.g. Hackathon 2025"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                    placeholder="Describe your event..."
                                    required
                                />
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            Location & Logistics
                        </h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-slate-300 mb-2">Venue</label>
                                <input
                                    name="venue"
                                    value={formData.venue}
                                    onChange={handleChange}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                    placeholder="Main Stage"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">City</label>
                                <input
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                    placeholder="Mumbai"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">State</label>
                                <input
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                    placeholder="Maharashtra"
                                    required
                                />
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                            Date & Time
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Start Date & Time</label>
                                <input
                                    name="startDateTime"
                                    type="datetime-local"
                                    value={formData.startDateTime}
                                    onChange={handleChange}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">End Date & Time</label>
                                <input
                                    name="endDateTime"
                                    type="datetime-local"
                                    value={formData.endDateTime}
                                    onChange={handleChange}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                    required
                                />
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                            Registration Control
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Registration Opens</label>
                                <input
                                    name="registrationOpen"
                                    type="datetime-local"
                                    value={formData.registrationOpen}
                                    onChange={handleChange}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Registration Closes</label>
                                <input
                                    name="registrationClose"
                                    type="datetime-local"
                                    value={formData.registrationClose}
                                    onChange={handleChange}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Registration Fee (INR)</label>
                                <input
                                    name="feeINR"
                                    type="number"
                                    value={formData.feeINR}
                                    onChange={handleChange}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                    placeholder="0 for free"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Max Participants (Optional)</label>
                                <input
                                    name="maxParticipants"
                                    type="number"
                                    value={formData.maxParticipants}
                                    onChange={handleChange}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                    placeholder="Unlimited"
                                />
                            </div>
                        </div>
                    </section>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl text-center">
                            {error}
                        </div>
                    )}

                    <div className="pt-8 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-10 py-4 rounded-xl shadow-lg shadow-purple-900/20 active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Event'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
