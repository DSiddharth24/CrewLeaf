import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import RegistrationForm from '@/components/RegistrationForm'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

interface RegisterPageProps {
    params: { slug: string }
}

export default async function PublicRegisterPage({ params }: RegisterPageProps) {
    const event = await db.event.findUnique({
        where: { slug: params.slug },
    })

    if (!event) {
        notFound()
    }

    const now = new Date()
    if (now < event.registrationOpen || now > event.registrationClose) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-8 text-center">
                <div className="max-w-md glass p-12 rounded-3xl border-white/5">
                    <h1 className="text-3xl font-bold mb-4">Registration Closed</h1>
                    <p className="text-slate-400 mb-8">Sorry, registration for this event is no longer active.</p>
                    <Link href={`/e/${event.slug}`} className="text-purple-400 hover:underline">Back to Event Details</Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12">
            <div className="max-w-3xl mx-auto">
                <Link href={`/e/${event.slug}`} className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors group">
                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    Back to details
                </Link>

                <header className="mb-12">
                    <h1 className="text-4xl font-extrabold mb-3">Event Registration</h1>
                    <p className="text-slate-400 text-lg">Secure your spot for <span className="text-purple-400 font-bold">{event.title}</span></p>
                </header>

                <div className="glass p-8 md:p-10 rounded-3xl border-white/10 shadow-2xl">
                    <RegistrationForm eventId={event.id} feeINR={event.feeINR} eventSlug={event.slug} />
                </div>
            </div>
        </div>
    )
}
