import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function POST(request: Request) {
    try {
        const session = await getSession()
        if (!session?.user?.clubId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const {
            title, description, venue, city, state,
            startDateTime, endDateTime, registrationOpen, registrationClose,
            feeINR, maxParticipants, isPublic
        } = body

        // Slug generation
        let slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

        // Ensure slug uniqueness (simple increment)
        let uniqueSlug = slug
        let counter = 1
        while (await db.event.findUnique({ where: { slug: uniqueSlug } })) {
            uniqueSlug = `${slug}-${counter}`
            counter++
        }

        const event = await db.event.create({
            data: {
                clubId: session.user.clubId,
                title,
                slug: uniqueSlug,
                description,
                venue,
                city,
                state,
                startDateTime: new Date(startDateTime),
                endDateTime: new Date(endDateTime),
                registrationOpen: new Date(registrationOpen),
                registrationClose: new Date(registrationClose),
                feeINR: parseInt(feeINR),
                maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
                isPublic: !!isPublic,
            }
        })

        return NextResponse.json(event)
    } catch (error: any) {
        console.error('Event API error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function GET(request: Request) {
    const session = await getSession()
    if (!session?.user?.clubId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const events = await db.event.findMany({
        where: { clubId: session.user.clubId },
        orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(events)
}
