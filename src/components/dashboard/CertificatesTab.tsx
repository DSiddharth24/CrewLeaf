'use client'

import React, { useState } from 'react'
import { Award, Save, Play, Search, Download, ExternalLink } from 'lucide-react'

export default function CertificatesTab({ event }: { event: any }) {
    const [template, setTemplate] = useState(event.certificateTemplate || {
        title: 'Certificate of Participation',
        signatureLeftName: '',
        signatureLeftRole: '',
        signatureRightName: '',
        signatureRightRole: '',
    })
    const [loading, setLoading] = useState(false)
    const [generating, setGenerating] = useState(false)
    const [issuedList, setIssuedList] = useState(event.certificatesIssued || [])

    const handleSaveTemplate = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/events/${event.id}/certificates/template`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(template),
            })
            const data = await res.json()
            setTemplate(data)
        } finally {
            setLoading(false)
        }
    }

    const handleGenerate = async () => {
        if (!confirm('This will generate certificates for all PAID participants without one. Continue?')) return
        setGenerating(true)
        try {
            const res = await fetch(`/api/events/${event.id}/certificates/generate`, { method: 'POST' })
            const data = await res.json()
            setIssuedList(data.issued)
            alert(`Successfully generated ${data.count} certificates!`)
        } finally {
            setGenerating(false)
        }
    }

    return (
        <div className="grid md:grid-cols-2 gap-12">
            {/* Template Editor */}
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Award className="w-5 h-5 text-purple-400" />
                        Certificate Template
                    </h3>
                    <button
                        onClick={handleSaveTemplate}
                        disabled={loading}
                        className="bg-white text-black px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        {loading ? 'Saving...' : 'Save Template'}
                    </button>
                </div>

                <div className="glass p-8 rounded-3xl border-white/5 space-y-4">
                    <div>
                        <label className="block text-xs uppercase text-slate-500 font-bold mb-2">Main Title</label>
                        <input
                            value={template.title}
                            onChange={e => setTemplate({ ...template, title: e.target.value })}
                            className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-2"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs uppercase text-slate-500 font-bold mb-2">Left Signature Name</label>
                            <input
                                value={template.signatureLeftName}
                                onChange={e => setTemplate({ ...template, signatureLeftName: e.target.value })}
                                className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase text-slate-500 font-bold mb-2">Left Role</label>
                            <input
                                value={template.signatureLeftRole}
                                onChange={e => setTemplate({ ...template, signatureLeftRole: e.target.value })}
                                className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase text-slate-500 font-bold mb-2">Right Signature Name</label>
                            <input
                                value={template.signatureRightName}
                                onChange={e => setTemplate({ ...template, signatureRightName: e.target.value })}
                                className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase text-slate-500 font-bold mb-2">Right Role</label>
                            <input
                                value={template.signatureRightRole}
                                onChange={e => setTemplate({ ...template, signatureRightRole: e.target.value })}
                                className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-2"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-white/5">
                    <button
                        onClick={handleGenerate}
                        disabled={generating}
                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 active:scale-95 transition-all shadow-lg disabled:opacity-50"
                    >
                        <Play className="w-5 h-5 fill-current" />
                        {generating ? 'Generating PDFs...' : 'Generate New Certificates'}
                    </button>
                </div>
            </section>

            {/* Issued List */}
            <section className="space-y-6">
                <h3 className="text-xl font-bold">Issued Certificates</h3>
                <div className="max-h-[600px] overflow-y-auto pr-2 custom-scrollbar space-y-3">
                    {issuedList.map((cert: any) => (
                        <div key={cert.id} className="glass p-4 rounded-xl border-white/5 flex items-center justify-between">
                            <div>
                                <div className="font-bold text-sm">#{cert.certificateNumber}</div>
                                <div className="text-xs text-slate-500">Issued at {new Date(cert.issuedAt).toLocaleDateString()}</div>
                            </div>
                            <div className="flex gap-2">
                                <a
                                    href={`/certificates/${cert.certificateNumber}`}
                                    target="_blank"
                                    className="p-2 text-slate-400 hover:text-purple-400"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            </div>
                        </div>
                    ))}
                    {issuedList.length === 0 && <p className="text-slate-500 text-center py-12">No certificates issued yet.</p>}
                </div>
            </section>
        </div>
    )
}
