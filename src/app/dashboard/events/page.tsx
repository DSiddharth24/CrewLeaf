import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Calendar, MapPin, Users, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'

export default async function EventsListPage() {
    const session = await getSession()
    if (!session?.user?.clubId) redirect('/auth/sign-in')

    const events = await db.event.findMany({
        where: { clubId: session.user.clubId },
        order: { createdAt: 'desc' } as any,
        include: { _count: { select: { registrations: true } } }
    })

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-bold">Your Events</h1>
                    <p className="text-slate-400 mt-1">Manage and track your club activities</p>
                </div>
                <Link href="/dashboard/events/new" className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95">
                    <Plus className="w-5 h-5" />
                    Create Event
                </Link>
            </div>

            <div className="grid gap-6">
                {events.length === 0 ? (
                    <div className="glass p-20 text-center rounded-3xl border-white/5">
                        <Calendar className="w-16 h-16 text-slate-700 mx-auto mb-6" />
                        <h2 className="text-2xl font-bold mb-2">No events found</h2>
                        <p className="text-slate-400 mb-8">You haven't created any events yet. Let's get started!</p>
                        <Link href="/dashboard/events/new" className="text-purple-400 hover:underline font-bold">Create your first event</Link>
                    </div>
                ) : (
                    events.map((event) => (
                        <Link
                            key={event.id}
                            href={`/dashboard/events/${event.id}`}
                            className="glass p-6 rounded-2xl border-white/5 hover:border-purple-500/30 transition-all flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 bg-slate-900 rounded-xl overflow-hidden border border-white/5">
                                    {event.posterUrl ? (
                                        <img src={event.posterUrl} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-purple-900/30 to-indigo-900/30 flex items-center justify-center">
                                            <Calendar className="text-slate-700 w-8 h-8" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2 group-hover:text-purple-400 transition-colors">{event.title}</h3>
                                    <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-4 h-4" />
                                            {format(event.startDateTime, 'PPP')}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="w-4 h-4" />
                                            {event.venue}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Users className="w-4 h-4" />
                                            {event._count.registrations} Registrations
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                        </Link>
                    ))
                )}
            </div>
        </div>
    )
}
