import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { comparePassword, createSession } from '@/lib/auth'

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json()

        if (!email || !password) {
            return NextResponse.json({ error: 'Missing email or password' }, { status: 400 })
        }

        const user = await db.user.findUnique({
            where: { email },
            include: { clubs: { take: 1 } }
        })

        if (!user || !(await comparePassword(password, user.passwordHash))) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
        }

        const clubId = user.clubs[0]?.id

        await createSession({
            id: user.id,
            email: user.email,
            role: user.role,
            clubId,
        })

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Sign-in error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
