import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

const SECRET_KEY = process.env.JWT_SECRET_KEY || 'default-dev-secret-key-change-in-prod'
const key = new TextEncoder().encode(SECRET_KEY)
const COOKIE_NAME = 'festpilot_session'

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10)
}

export async function comparePassword(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed)
}

export async function encrypt(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(key)
}

export async function decrypt(input: string): Promise<any> {
    try {
        const { payload } = await jwtVerify(input, key, {
            algorithms: ['HS256'],
        })
        return payload
    } catch (error) {
        return null
    }
}

export async function getSession() {
    const session = cookies().get(COOKIE_NAME)?.value
    if (!session) return null
    return await decrypt(session)
}

export async function createSession(user: { id: string; email: string; role: string; clubId?: string }) {
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)
    const session = await encrypt({ user, expires })

    cookies().set(COOKIE_NAME, session, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        expires,
        sameSite: 'lax',
        path: '/',
    })
}

export async function deleteSession() {
    cookies().set(COOKIE_NAME, '', { expires: new Date(0) })
}
