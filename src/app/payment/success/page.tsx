import { db } from '@/lib/db'
import { stripe } from '@/lib/stripe'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'

interface SuccessPageProps {
    searchParams: { session_id?: string; registration_id?: string }
}

export default async function PaymentSuccessPage({ searchParams }: SuccessPageProps) {
    let registration = null

    if (searchParams.session_id) {
        const session = await stripe.checkout.sessions.retrieve(searchParams.session_id)
        const registrationId = session.metadata?.registrationId
        if (registrationId) {
            registration = await db.registration.findUnique({
                where: { id: registrationId },
                include: { event: true }
            })
        }
    } else if (searchParams.registration_id) {
        // For free events
        registration = await db.registration.findUnique({
            where: { id: searchParams.registration_id },
            include: { event: true }
        })
    }

    if (!registration) {
        return notFound()
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
            <div className="glass max-w-xl w-full p-12 rounded-3xl text-center border-white/10 shadow-2xl">
                <div className="flex justify-center mb-8">
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </div>
                </div>

                <h1 className="text-4xl font-extrabold text-white mb-4">Registration Successful!</h1>
                <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                    You're all set! You have successfully registered for <br />
                    <span className="text-white font-bold">{registration.event.title}</span>.
                </p>

                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 text-left mb-8 space-y-3">
                    <div className="flex justify-between">
                        <span className="text-slate-500">Attendee</span>
                        <span className="text-white font-medium">{registration.name}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500">Status</span>
                        <span className="text-green-400 font-bold uppercase tracking-widest text-xs py-1 px-2 bg-green-400/10 rounded">Paid</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-slate-800">
                        <span className="text-slate-500">Booking ID</span>
                        <span className="text-slate-300 font-mono text-xs">{registration.id.slice(0, 8)}</span>
                    </div>
                </div>

                <Link href="/" className="inline-block bg-purple-600 hover:bg-purple-500 text-white font-bold px-8 py-3 rounded-xl transition-all">
                    Return to Home
                </Link>
            </div>
        </div>
    )
}
