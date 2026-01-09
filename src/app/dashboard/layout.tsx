'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
    LayoutDashboard,
    CalendarDays,
    Settings,
    LogOut,
    PlusCircle,
    Users,
    Trophy
} from 'lucide-react'

const navItems = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Events', href: '/dashboard/events', icon: CalendarDays },
    { name: 'Club Settings', href: '/dashboard/settings', icon: Settings },
]

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const router = useRouter()

    const handleLogout = async () => {
        await fetch('/api/auth/sign-out', { method: 'POST' })
        router.push('/')
        router.refresh()
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white flex">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/5 flex flex-col fixed inset-y-0">
                <div className="p-8">
                    <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                        FestPilot
                    </Link>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const active = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active
                                        ? 'bg-purple-600/10 text-purple-400 border border-purple-500/20'
                                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-white/5">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-10">
                {children}
            </main>
        </div>
    )
}
