import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'

export async function POST(req: Request) {
    const body = await req.text()
    const signature = headers().get('Stripe-Signature') as string

    let event

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        )
    } catch (err: any) {
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as any
        const registrationId = session.metadata.registrationId
        const paymentIntentId = session.payment_intent as string

        if (registrationId) {
            await db.registration.update({
                where: { id: registrationId },
                data: {
                    paymentStatus: 'paid',
                    stripePaymentIntentId: paymentIntentId,
                },
            })
            console.log(`Registration ${registrationId} marked as PAID`)
        }
    }

    return NextResponse.json({ received: true })
}
