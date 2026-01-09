'use client'

import React from 'react'
import { Download, Search, Filter } from 'lucide-react'
import { format } from 'date-fns'

export default function ParticipantsTab({ eventId, registrations }: { eventId: string, registrations: any[] }) {
    const [search, setSearch] = React.useState('')

    const filteredRegs = registrations.filter(r =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.email.toLowerCase().includes(search.toLowerCase())
    )

    const handleExport = () => {
        window.open(`/api/events/${eventId}/export`, '_blank')
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-slate-900 border border-white/5 rounded-xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                    />
                </div>
                <button
                    onClick={handleExport}
                    className="bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 border border-white/5 transition-all"
                >
                    <Download className="w-5 h-5" />
                    Export CSV
                </button>
            </div>

            <div className="glass overflow-hidden rounded-2xl border-white/5">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-slate-500 text-xs font-bold uppercase tracking-widest">
                        <tr>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">College/Branch</th>
                            <th className="px-6 py-4">Payment</th>
                            <th className="px-6 py-4">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredRegs.map((reg) => (
                            <tr key={reg.id} className="hover:bg-white/[0.02] transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-bold">{reg.name}</div>
                                    <div className="text-xs text-slate-500">{reg.email}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium">{reg.collegeName || 'N/A'}</div>
                                    <div className="text-xs text-slate-500">{reg.branch} {reg.year && `(Year ${reg.year})`}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${reg.paymentStatus === 'paid'
                                            ? 'bg-green-500/10 text-green-500'
                                            : 'bg-amber-500/10 text-amber-500'
                                        }`}>
                                        {reg.paymentStatus}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-500">
                                    {format(new Date(reg.createdAt), 'MMM d, p')}
                                </td>
                            </tr>
                        ))}
                        {filteredRegs.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-20 text-center text-slate-500">
                                    No matching participants found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
