import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Award, Download, ShieldCheck, ChevronLeft } from 'lucide-react'

interface CertificatePageProps {
    params: { certificateNumber: string }
}

export default async function CertificateVerificationPage({ params }: CertificatePageProps) {
    const cert = await db.certificateIssued.findUnique({
        where: { certificateNumber: params.certificateNumber },
        include: {
            event: { include: { club: true } },
            registration: true
        }
    })

    if (!cert) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
            <div className="max-w-4xl w-full">
                <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-white mb-8 transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                    Back to FestPilot
                </Link>

                <div className="glass p-12 rounded-[40px] border-white/10 shadow-3xl text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8">
                        <div className="flex items-center gap-2 bg-green-500/10 text-green-500 px-4 py-2 rounded-full border border-green-500/20">
                            <ShieldCheck className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-widest">Verified</span>
                        </div>
                    </div>

                    <Award className="w-16 h-16 text-purple-500 mx-auto mb-8" />

                    <h1 className="text-4xl font-extrabold mb-4">Certificate of Achievement</h1>
                    <p className="text-xl text-slate-400 mb-12">
                        This document verifies that <span className="text-white font-bold">{cert.registration.name}</span> <br />
                        has participated in <span className="text-purple-400 font-bold">{cert.event.title}</span>.
                    </p>

                    <div className="grid md:grid-cols-3 gap-8 text-left mb-12 border-t border-white/5 pt-12">
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-bold mb-1">Issue Date</p>
                            <p className="font-medium">{new Date(cert.issuedAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-bold mb-1">Organization</p>
                            <p className="font-medium">{cert.event.club.name}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-bold mb-1">Certificate ID</p>
                            <p className="font-mono text-xs">{cert.certificateNumber}</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 border-t border-white/5">
                        <a
                            href={cert.pdfUrl || '#'}
                            download
                            className="bg-purple-600 hover:bg-purple-500 text-white px-10 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-purple-900/20 active:scale-95 transition-all"
                        >
                            <Download className="w-5 h-5" />
                            Download PDF
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}
