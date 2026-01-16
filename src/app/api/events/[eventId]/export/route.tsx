import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(
    req: Request,
    { params }: { params: { eventId: string } }
) {
    const session = await getSession()
    if (!session?.user?.clubId) return new Response('Unauthorized', { status: 401 })

    const event = await db.event.findUnique({
        where: { id: params.eventId },
        include: { registrations: true }
    })

    if (!event || event.clubId !== session.user.clubId) {
        return new Response('Not Found', { status: 404 })
    }

    const registrations = event.registrations

    // Construct CSV
    const headers = ['ID', 'Name', 'Email', 'Phone', 'College', 'Branch', 'Year', 'Status', 'Registered At']
    const rows = registrations.map(r => [
        r.id,
        r.name,
        r.email,
        r.phone || '',
        r.collegeName || '',
        r.branch || '',
        r.year || '',
        r.paymentStatus,
        new Date(r.createdAt).toLocaleString()
    ])

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')

    return new Response(csvContent, {
        headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="participants-${event.slug}.csv"`
        }
    })
}
