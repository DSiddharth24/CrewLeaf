import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { format } from 'date-fns'
import { Calendar, MapPin, Ticket, Clock } from 'lucide-react'
import Link from 'next/link'

interface EventPageProps {
    params: { slug: string }
}

export default async function PublicEventPage({ params }: EventPageProps) {
    const event = await db.event.findUnique({
        where: { slug: params.slug },
        include: { club: true }
    })

    if (!event) {
        notFound()
    }

    const now = new Date()
    const registrationOpen = now >= event.registrationOpen && now <= event.registrationClose
    const feeText = event.feeINR === 0 ? 'Free' : `₹${event.feeINR}`

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            {/* Event Header/Poster */}
            <div className="relative h-[40vh] w-full overflow-hidden">
                {event.posterUrl ? (
                    <img src={event.posterUrl} alt={event.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-900 to-indigo-900" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
                <div className="absolute bottom-8 left-8 right-8 max-w-5xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">{event.title}</h1>
                    <p className="text-purple-400 font-medium text-lg">Hosted by {event.club.name}</p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-8 py-12 grid md:grid-cols-3 gap-12">
                {/* Left Column: Details */}
                <div className="md:col-span-2 space-y-12">
                    <section>
                        <h2 className="text-2xl font-bold mb-4 border-b border-white/10 pb-2">About Event</h2>
                        <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{event.description}</p>
                    </section>

                    <section className="grid grid-cols-2 gap-8">
                        <div className="flex items-start gap-3">
                            <Calendar className="text-purple-500 w-6 h-6 mt-1" />
                            <div>
                                <p className="text-sm text-slate-500 uppercase tracking-wider font-bold">Date</p>
                                <p className="text-lg">{format(event.startDateTime, 'PPP')}</p>
                                <p className="text-slate-400">{format(event.startDateTime, 'p')} - {format(event.endDateTime, 'p')}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <MapPin className="text-purple-500 w-6 h-6 mt-1" />
                            <div>
                                <p className="text-sm text-slate-500 uppercase tracking-wider font-bold">Venue</p>
                                <p className="text-lg">{event.venue}</p>
                                <p className="text-slate-400">{event.city}, {event.state}</p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Column: Registration Card */}
                <div className="space-y-6">
                    <div className="glass p-8 rounded-2xl sticky top-24 border-white/10">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-2 text-slate-400">
                                <Ticket className="w-5 h-5" />
                                <span>Entry Fee</span>
                            </div>
                            <span className="text-3xl font-bold text-white">{feeText}</span>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="flex items-center gap-2 text-sm">
                                <Clock className="w-4 h-4 text-purple-400" />
                                <span className={registrationOpen ? 'text-green-400' : 'text-red-400'}>
                                    {registrationOpen ? 'Registration is live' : 'Registration closed'}
                                </span>
                            </div>
                            {event.maxParticipants && (
                                <p className="text-sm text-slate-400">Limited to {event.maxParticipants} participants</p>
                            )}
                        </div>

                        {registrationOpen ? (
                            <Link
                                href={`/e/${event.slug}/register`}
                                className="block w-full text-center bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95"
                            >
                                Register Now
                            </Link>
                        ) : (
                            <button disabled className="w-full bg-slate-800 text-slate-500 font-bold py-4 rounded-xl cursor-not-allowed">
                                Closed
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
