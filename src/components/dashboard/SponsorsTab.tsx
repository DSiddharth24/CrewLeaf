'use client'

import React, { useState } from 'react'
import { Plus, Trash2, Edit2, IndianRupee, PieChart, Wallet } from 'lucide-react'

export default function SponsorsTab({ eventId, sponsors: initialSponsors }: { eventId: string, sponsors: any[] }) {
    const [sponsors, setSponsors] = useState(initialSponsors)
    const [showForm, setShowForm] = useState(false)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        contactPerson: '',
        committedAmountINR: 0,
        receivedAmountINR: 0,
    })

    // Calculations
    const totalCommitted = sponsors.reduce((sum, s) => sum + s.committedAmountINR, 0)
    const totalReceived = sponsors.reduce((sum, s) => sum + s.receivedAmountINR, 0)
    const balance = totalCommitted - totalReceived

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await fetch(`/api/events/${eventId}/sponsors`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })
            const newSponsor = await res.json()
            setSponsors([...sponsors, newSponsor])
            setShowForm(false)
            setFormData({ name: '', contactPerson: '', committedAmountINR: 0, receivedAmountINR: 0 })
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return
        await fetch(`/api/events/${eventId}/sponsors?sponsorId=${id}`, { method: 'DELETE' })
        setSponsors(sponsors.filter(s => s.id !== id))
    }

    return (
        <div className="space-y-10">
            {/* Finance Summary */}
            <div className="grid md:grid-cols-3 gap-6">
                <div className="glass p-6 rounded-2xl border-white/5 border-l-4 border-l-purple-500">
                    <div className="flex items-center gap-3 mb-2 text-slate-500">
                        <PieChart className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Total Committed</span>
                    </div>
                    <p className="text-2xl font-bold">₹{totalCommitted}</p>
                </div>
                <div className="glass p-6 rounded-2xl border-white/5 border-l-4 border-l-green-500">
                    <div className="flex items-center gap-3 mb-2 text-slate-500">
                        <Wallet className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Total Received</span>
                    </div>
                    <p className="text-2xl font-bold text-green-400">₹{totalReceived}</p>
                </div>
                <div className="glass p-6 rounded-2xl border-white/5 border-l-4 border-l-red-500">
                    <div className="flex items-center gap-3 mb-2 text-slate-500">
                        <IndianRupee className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Balance Pending</span>
                    </div>
                    <p className="text-2xl font-bold text-red-400">₹{balance}</p>
                </div>
            </div>

            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Partner Ecosystem</h3>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 text-sm transition-all active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    Add Sponsor
                </button>
            </div>

            {showForm && (
                <div className="glass p-8 rounded-2xl border-purple-500/30">
                    <form onSubmit={handleCreate} className="grid md:grid-cols-4 gap-6 items-end">
                        <div className="md:col-span-1">
                            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Partner Name</label>
                            <input
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-slate-900 border border-white/5 rounded-lg px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-purple-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Contact Info</label>
                            <input
                                value={formData.contactPerson}
                                onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
                                className="w-full bg-slate-900 border border-white/5 rounded-lg px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-purple-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Committed (INR)</label>
                            <input
                                type="number"
                                value={formData.committedAmountINR}
                                onChange={e => setFormData({ ...formData, committedAmountINR: parseInt(e.target.value) })}
                                className="w-full bg-slate-900 border border-white/5 rounded-lg px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-purple-500"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button type="submit" disabled={loading} className="flex-1 bg-white text-black py-2 rounded-lg font-bold text-sm">Save</button>
                            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-400 text-sm">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="glass overflow-hidden rounded-2xl border-white/5 text-sm">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                        <tr>
                            <th className="px-6 py-4">Sponsor</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Committed</th>
                            <th className="px-6 py-4">Received</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {sponsors.map((s) => (
                            <tr key={s.id} className="hover:bg-white/[0.02]">
                                <td className="px-6 py-4">
                                    <div className="font-bold">{s.name}</div>
                                    <div className="text-xs text-slate-500">{s.contactPerson}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${s.committedAmountINR === s.receivedAmountINR ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                        {s.committedAmountINR === s.receivedAmountINR ? 'Full' : 'Partial'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">₹{s.committedAmountINR}</td>
                                <td className="px-6 py-4 text-green-400 font-medium">₹{s.receivedAmountINR}</td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => handleDelete(s.id)} className="text-slate-600 hover:text-red-400 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {sponsors.length === 0 && !showForm && (
                            <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">No sponsors added for this event.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
