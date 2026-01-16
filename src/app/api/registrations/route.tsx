import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { stripe } from '@/lib/stripe'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { eventId, name, email, phone, collegeName, branch, year } = body

        if (!eventId || !name || !email) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const event = await db.event.findUnique({
            where: { id: eventId },
        })

        if (!event) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 })
        }

        // 1. Create registration record (pending)
        const registration = await db.registration.create({
            data: {
                eventId,
                name,
                email,
                phone,
                collegeName,
                branch,
                year,
                paymentStatus: event.feeINR === 0 ? 'paid' : 'pending',
            }
        })

        if (event.feeINR === 0) {
            return NextResponse.json({ registrationId: registration.id })
        }

        // 2. Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'inr',
                        product_data: {
                            name: `Registration: ${event.title}`,
                            description: `Participation fee for ${event.title}`,
                        },
                        unit_amount: event.feeINR * 100, // Stripe expects amount in paise
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.APP_BASE_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.APP_BASE_URL}/e/${event.slug}?cancelled=true`,
            customer_email: email,
            metadata: {
                registrationId: registration.id,
                eventId: event.id,
            },
        })

        // 3. Update registration with session ID
        await db.registration.update({
            where: { id: registration.id },
            data: { stripeSessionId: session.id }
        })

        return NextResponse.json({
            registrationId: registration.id,
            paymentUrl: session.url
        })
    } catch (error: any) {
        console.error('Registration API error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
