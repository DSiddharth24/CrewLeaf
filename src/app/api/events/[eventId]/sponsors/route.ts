import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function POST(
    req: Request,
    { params }: { params: { eventId: string } }
) {
    const session = await getSession()
    if (!session?.user?.clubId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const sponsor = await db.sponsor.create({
        data: {
            eventId: params.eventId,
            ...body
        }
    })
    return NextResponse.json(sponsor)
}

export async function DELETE(
    req: Request,
    { params }: { params: { eventId: string } }
) {
    const { searchParams } = new URL(req.url)
    const sponsorId = searchParams.get('sponsorId')
    if (!sponsorId) return NextResponse.json({ error: 'Missing ID' }, { status: 400 })

    await db.sponsor.delete({ where: { id: sponsorId } })
    return NextResponse.json({ success: true })
}
