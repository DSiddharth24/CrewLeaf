import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import {
    ChevronLeft,
    ExternalLink,
    Eye,
    Users,
    Handshake,
    Award,
    BarChart3
} from 'lucide-react'
import { format } from 'date-fns'

// Tab Components (to be implemented in separate files or same)
import OverviewTab from '@/components/dashboard/OverviewTab'
import ParticipantsTab from '@/components/dashboard/ParticipantsTab'
import SponsorsTab from '@/components/dashboard/SponsorsTab'
import CertificatesTab from '@/components/dashboard/CertificatesTab'

interface EventDetailPageProps {
    params: { eventId: string }
    searchParams: { tab?: string }
}

export default async function EventDetailPage({ params, searchParams }: EventDetailPageProps) {
    const session = await getSession()
    if (!session?.user?.clubId) redirect('/auth/sign-in')

    const event = await db.event.findUnique({
        where: { id: params.eventId },
        include: {
            club: true,
            _count: {
                select: { registrations: true }
            },
            registrations: true,
            sponsors: true,
            certificateTemplate: true
        }
    })

    if (!event || event.clubId !== session.user.clubId) {
        notFound()
    }

    const activeTab = searchParams.tab || 'overview'

    const tabs = [
        { id: 'overview', name: 'Overview', icon: BarChart3 },
        { id: 'participants', name: 'Participants', icon: Users },
        { id: 'sponsors', name: 'Sponsors', icon: Handshake },
        { id: 'certificates', name: 'Certificates', icon: Award },
    ]

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <Link href="/dashboard/events" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-all group">
                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    Back to Events
                </Link>
                <Link
                    href={`/e/${event.slug}`}
                    target="_blank"
                    className="flex items-center gap-2 text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors"
                >
                    <Eye className="w-4 h-4" />
                    View Public Page
                    <ExternalLink className="w-3.5 h-3.5" />
                </Link>
            </div>

            <header className="mb-10">
                <div className="flex items-start gap-6">
                    <div className="w-24 h-24 bg-slate-900 rounded-3xl overflow-hidden border border-white/5 flex-shrink-0">
                        {event.posterUrl ? (
                            <img src={event.posterUrl} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-purple-900/40 to-indigo-900/40" />
                        )}
                    </div>
                    <div>
                        <h1 className="text-4xl font-extrabold mb-2">{event.title}</h1>
                        <div className="flex items-center gap-3 text-slate-400">
                            <span className="bg-purple-600/10 text-purple-400 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                                {event.feeINR === 0 ? 'Free' : `₹${event.feeINR}`}
                            </span>
                            <span>•</span>
                            <span>{format(event.startDateTime, 'PPP')}</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Tabs Navigation */}
            <div className="flex border-b border-white/5 mb-8 overflow-x-auto scroller-hidden">
                {tabs.map((tab) => {
                    const Icon = tab.icon
                    const isActive = activeTab === tab.id
                    return (
                        <Link
                            key={tab.id}
                            href={`/dashboard/events/${event.id}?tab=${tab.id}`}
                            className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-all whitespace-nowrap ${isActive
                                    ? 'border-purple-500 text-purple-400 bg-purple-500/5'
                                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            <span className="font-semibold text-sm">{tab.name}</span>
                        </Link>
                    )
                })}
            </div>

            {/* Tab Content */}
            <div className="pb-20">
                {activeTab === 'overview' && <OverviewTab event={event} />}
                {activeTab === 'participants' && <ParticipantsTab eventId={event.id} registrations={event.registrations} />}
                {activeTab === 'sponsors' && <SponsorsTab eventId={event.id} sponsors={event.sponsors} />}
                {activeTab === 'certificates' && <CertificatesTab event={event} />}
            </div>
        </div>
    )
}
