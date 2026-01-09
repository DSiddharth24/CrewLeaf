import React from 'react'
import { Users, CreditCard, Clock, CheckCircle } from 'lucide-react'

export default function OverviewTab({ event }: { event: any }) {
    const registrations = event.registrations || []
    const paidCount = registrations.filter((r: any) => r.paymentStatus === 'paid').length
    const pendingCount = registrations.filter((r: any) => r.paymentStatus === 'pending').length
    const totalRevenue = paidCount * event.feeINR

    const cards = [
        { label: 'Total Registered', value: registrations.length, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
        { label: 'Confirmed (Paid)', value: paidCount, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10' },
        { label: 'Pending Payment', value: pendingCount, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/10' },
        { label: 'Revenue Generated', value: `₹${totalRevenue}`, icon: CreditCard, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    ]

    return (
        <div className="space-y-8">
            <div className="grid md:grid-cols-4 gap-6">
                {cards.map((card) => (
                    <div key={card.label} className="glass p-6 rounded-2xl border-white/5">
                        <div className={`w-10 h-10 ${card.bg} ${card.color} rounded-lg flex items-center justify-center mb-4`}>
                            <card.icon className="w-5 h-5" />
                        </div>
                        <p className="text-slate-500 text-sm font-medium mb-1 uppercase tracking-wider">{card.label}</p>
                        <p className="text-2xl font-bold">{card.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 glass p-8 rounded-2xl border-white/5">
                    <h3 className="text-lg font-bold mb-4">Event Description</h3>
                    <p className="text-slate-400 leading-relaxed whitespace-pre-wrap">{event.description}</p>
                </div>
                <div className="glass p-8 rounded-2xl border-white/5">
                    <h3 className="text-lg font-bold mb-4">Logistics</h3>
                    <dl className="space-y-4">
                        <div>
                            <dt className="text-xs text-slate-500 uppercase font-bold mb-1">Venue</dt>
                            <dd className="text-slate-200">{event.venue}</dd>
                        </div>
                        <div>
                            <dt className="text-xs text-slate-500 uppercase font-bold mb-1">Location</dt>
                            <dd className="text-slate-200">{event.city}, {event.state}</dd>
                        </div>
                        <div>
                            <dt className="text-xs text-slate-500 uppercase font-bold mb-1">Max Capacity</dt>
                            <dd className="text-slate-200">{event.maxParticipants || 'Unlimited'}</dd>
                        </div>
                    </dl>
                </div>
            </div>
        </div>
    )
}
