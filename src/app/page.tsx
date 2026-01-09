import Link from 'next/link'
import { ArrowRight, Calendar, CreditCard, ShieldCheck } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-purple-500/30">
      {/* Hero Section */}
      <header className="relative pt-20 pb-16 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-full bg-gradient-radial from-purple-900/20 to-transparent opacity-50" />

        <nav className="fixed top-0 left-0 w-full z-50 glass border-none border-b border-white/5 py-4 px-8 flex justify-between items-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
            FestPilot
          </div>
          <div className="flex gap-6 items-center">
            <Link href="/auth/sign-in" className="text-sm font-medium hover:text-purple-400 transition-colors">Login</Link>
            <Link href="/auth/sign-up" className="bg-white text-slate-950 px-5 py-2 rounded-full text-sm font-bold hover:bg-slate-200 transition-all active:scale-95">Get Started</Link>
          </div>
        </nav>

        <div className="max-w-5xl mx-auto text-center relative z-10 pt-12">
          <div className="inline-block px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-6 animate-pulse">
            Introducing FestPilot 1.0
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
            Elevate Your <span className="text-purple-500">College Fest</span> <br />
            to Net Level.
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            The all-in-one platform for college clubs to manage event registrations,
            secure payments via Stripe, and automatic certificate generation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/sign-up" className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-4 rounded-xl text-lg font-bold transition-all flex items-center justify-center gap-2 group">
              Start Your Club <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="#features" className="bg-slate-900/50 hover:bg-slate-900 border border-slate-800 text-slate-300 px-8 py-4 rounded-xl text-lg font-bold transition-all">
              See How It Works
            </Link>
          </div>
        </div>
      </header>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="glass p-8 rounded-2xl border-white/5 hover:border-purple-500/30 transition-all group">
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Calendar className="text-purple-500 w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Event Management</h3>
            <p className="text-slate-400 leading-relaxed">
              Create beautiful microsites for your events in seconds. Customize every detail from dates to fees.
            </p>
          </div>
          <div className="glass p-8 rounded-2xl border-white/5 hover:border-purple-500/30 transition-all group">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <CreditCard className="text-indigo-500 w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Secure Payments</h3>
            <p className="text-slate-400 leading-relaxed">
              Integrated Stripe Checkout for real INR payments. Hassle-free finance tracking for your treasures.
            </p>
          </div>
          <div className="glass p-8 rounded-2xl border-white/5 hover:border-purple-500/30 transition-all group">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <ShieldCheck className="text-blue-500 w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Smart Certificates</h3>
            <p className="text-slate-400 leading-relaxed">
              Generate and issue digital certificates automatically upon participation. Verifiable via public links.
            </p>
          </div>
        </div>
      </section>

      {/* Social Proof / Trust */}
      <footer className="py-12 border-t border-white/5 text-center text-slate-500">
        <p>© 2025 FestPilot. Built for the next generation of college leaders.</p>
      </footer>
    </div>
  )
}
