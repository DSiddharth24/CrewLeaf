import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, createSession } from '@/lib/auth'

export async function POST(request: Request) {
    try {
        const { name, email, password, phone, collegeName, clubName } = await request.json()

        if (!email || !password || !name || !clubName) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const existingUser = await db.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 })
        }

        const passwordHash = await hashPassword(password)

        // Transaction to create User and Club
        const result = await db.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    name,
                    email,
                    phone,
                    passwordHash,
                    collegeName,
                    role: 'club_admin',
                },
            })

            const club = await tx.club.create({
                data: {
                    name: clubName,
                    collegeName,
                    ownerUserId: user.id,
                },
            })

            return { user, club }
        })

        await createSession({
            id: result.user.id,
            email: result.user.email,
            role: result.user.role,
            clubId: result.club.id,
        })

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Sign-up error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
