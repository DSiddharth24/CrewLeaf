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
    const { title, signatureLeftName, signatureLeftRole, signatureRightName, signatureRightRole } = body

    const template = await db.certificateTemplate.upsert({
        where: { eventId: params.eventId },
        update: {
            title,
            signatureLeftName,
            signatureLeftRole,
            signatureRightName,
            signatureRightRole
        },
        create: {
            eventId: params.eventId,
            title,
            signatureLeftName,
            signatureLeftRole,
            signatureRightName,
            signatureRightRole
        }
    })

    return NextResponse.json(template)
}
