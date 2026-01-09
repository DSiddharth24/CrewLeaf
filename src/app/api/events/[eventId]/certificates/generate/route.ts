import React from 'react';
import ReactPDF from '@react-pdf/renderer';
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import ReactPDF from '@react-pdf/renderer'
import { CertificatePDF } from '@/components/certificates/CertificatePDF'
import fs from 'fs'
import path from 'path'

export async function POST(
    req: Request,
    { params }: { params: { eventId: string } }
) {
    const session = await getSession()
    if (!session?.user?.clubId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const event = await db.event.findUnique({
        where: { id: params.eventId },
        include: {
            club: true,
            certificateTemplate: true,
            registrations: {
                where: {
                    paymentStatus: 'paid',
                    certificateIssued: null
                }
            }
        }
    })

    if (!event || !event.certificateTemplate) {
        return NextResponse.json({ error: 'Event or template not found' }, { status: 404 })
    }

    const issued = []
    const storageDir = path.join(process.cwd(), 'public', 'certs', event.id)

    if (!fs.existsSync(storageDir)) {
        fs.mkdirSync(storageDir, { recursive: true })
    }

    for (const reg of event.registrations) {
        const certNumber = `FP-${event.slug.toUpperCase().slice(0, 4)}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`

        // Data for PDF
        const pdfData = {
            templateTitle: event.certificateTemplate.title,
            participantName: reg.name,
            eventTitle: event.title,
            clubName: event.club.name,
            collegeName: event.club.collegeName || 'Our College',
            signatureLeftName: event.certificateTemplate.signatureLeftName,
            signatureLeftRole: event.certificateTemplate.signatureLeftRole,
            signatureRightName: event.certificateTemplate.signatureRightName,
            signatureRightRole: event.certificateTemplate.signatureRightRole,
            certificateNumber: certNumber
        }

        // Since we are in a serverless route, we use renderToFile or renderToStream
        const filePath = path.join(storageDir, `${certNumber}.pdf`)
        const CertificateDocument = React.createElement('div', {}, 'Certificate placeholder');
await ReactPDF.renderToFile(CertificateDocument, filePath);
        const newCert = await db.certificateIssued.create({
            data: {
                eventId: event.id,
                registrationId: reg.id,
                certificateNumber: certNumber,
                pdfUrl: `/certs/${event.id}/${certNumber}.pdf`,
                issuedAt: new Date(),
            }
        })
        issued.push(newCert)
    }

    return NextResponse.json({ count: issued.length, issued })
}
