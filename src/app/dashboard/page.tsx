import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Calendar, Users, IndianRupee, Trophy, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
    const session = await getSession()
    if (!session?.user?.clubId) {
        redirect('/auth/sign-in')
    }

    const clubId = session.user.clubId

    // Fetch stats details
    const [eventCount, registrations, club] = await Promise.all([
        db.event.count({ where: { clubId } }),
        db.registration.findMany({
            where: {
                paymentStatus: 'paid',
                event: { clubId }
            },
            include: { event: true }
        }),
        db.club.findUnique({ where: { id: clubId } })
    ])

    const totalRevenue = registrations.reduce((sum, reg) => sum + reg.event.feeINR, 0)
    const totalPaid = registrations.length
    const totalPending = await db.registration.count({
        where: { paymentStatus: 'pending', event: { clubId } }
    })

    const stats = [
        { label: 'Total Events', value: eventCount, icon: Calendar, color: 'text-purple-400', bg: 'bg-purple-400/10' },
        { label: 'Registrations', value: totalPaid + totalPending, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
        { label: 'Revenue (INR)', value: `₹${totalRevenue}`, icon: IndianRupee, color: 'text-green-400', bg: 'bg-green-400/10' },
        { label: 'Paid Attendees', value: totalPaid, icon: Trophy, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    ]

    return (
        <div className="max-w-6xl mx-auto">
            <header className="mb-10">
                <h1 className="text-3xl font-bold mb-2">Welcome back to {club?.name}</h1>
                <p className="text-slate-400">Here's what's happening with your events today.</p>
            </header>

            <div className="grid md:grid-cols-4 gap-6 mb-12">
                {stats.map((stat) => (
                    <div key={stat.label} className="glass p-6 rounded-2xl border-white/5">
                        <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-lg flex items-center justify-center mb-4`}>
                            <stat.icon className="w-5 h-5" />
                        </div>
                        <p className="text-slate-400 text-sm font-medium mb-1 uppercase tracking-wider">{stat.label}</p>
                        <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <div className="glass p-8 rounded-2xl border-white/5">
                    <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
                    <div className="space-y-4">
                        <Link href="/dashboard/events/new" className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-purple-500/50 transition-all group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <span className="font-medium text-slate-200">Create New Event</span>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
