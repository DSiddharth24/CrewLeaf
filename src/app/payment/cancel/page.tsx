import Link from 'next/link'
import { XCircle, ArrowLeft } from 'lucide-react'

export default function PaymentCancelPage() {
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
            <div className="glass max-w-md w-full p-12 rounded-3xl text-center border-white/10 shadow-2xl">
                <div className="flex justify-center mb-8">
                    <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center">
                        <XCircle className="w-10 h-10 text-red-500" />
                    </div>
                </div>

                <h1 className="text-3xl font-extrabold text-white mb-4">Payment Cancelled</h1>
                <p className="text-slate-400 mb-10 leading-relaxed">
                    The payment process was interrupted or cancelled. Don't worry, your registration details are saved as pending.
                </p>

                <div className="space-y-4">
                    <Link href="/" className="block w-full bg-slate-900 border border-white/10 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2">
                        <ArrowLeft className="w-5 h-5" />
                        Go Back Home
                    </Link>
                </div>
            </div>
        </div>
    )
}
