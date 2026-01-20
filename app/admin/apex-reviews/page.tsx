'use client'

import { useState, useEffect } from 'react'

import { Button } from '@/components/ui/Button'
import { Crown, ArrowLeft, CheckCircle2, Clock, FileText, ChevronRight } from 'lucide-react'
import { ApexAuditData } from '@/lib/apex-audit-types'

interface Submission {
    id: string
    submittedAt: string
    status: 'pending_review' | 'completed'
    data: ApexAuditData
    analysis?: string
}

export default function ApexReviewsPage() {
    const [submissions, setSubmissions] = useState<Submission[]>([])
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
    const [analysisText, setAnalysisText] = useState('')

    useEffect(() => {
        const loaded = JSON.parse(localStorage.getItem('apex_audit_submissions') || '[]')
        setSubmissions(loaded)
    }, [])

    const handleSelect = (sub: Submission) => {
        setSelectedSubmission(sub)
        setAnalysisText(sub.analysis || '')
    }

    const handleSaveAnalysis = () => {
        if (!selectedSubmission) return

        const updatedSub = {
            ...selectedSubmission,
            status: 'completed' as const,
            analysis: analysisText
        }

        const updatedList = submissions.map(s => s.id === selectedSubmission.id ? updatedSub : s)
        setSubmissions(updatedList)
        localStorage.setItem('apex_audit_submissions', JSON.stringify(updatedList))
        setSelectedSubmission(null) // Go back to list
    }

    const formatDate = (iso: string) => {
        return new Date(iso).toLocaleDateString() + ' ' + new Date(iso).toLocaleTimeString()
    }

    if (selectedSubmission) {
        return (
            <div className="max-w-7xl mx-auto h-[calc(100vh-100px)] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" onClick={() => setSelectedSubmission(null)}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                        <h1 className="text-xl font-bold">Reviewing: {selectedSubmission.data.company_name}</h1>
                    </div>
                    <Button variant="shimmer" onClick={handleSaveAnalysis}>
                        Save & Complete Review
                    </Button>
                </div>

                <div className="flex-1 grid grid-cols-2 gap-6 overflow-hidden">
                    {/* Left: Data View */}
                    <div className="overflow-y-auto pr-2 pb-10 space-y-6">
                        <div className="p-4 rounded-xl bg-card border border-border">
                            <h3 className="font-bold mb-4 flex items-center gap-2">
                                <Crown className="w-4 h-4 text-yellow-500" />
                                Submitted Data
                            </h3>
                            <div className="space-y-6 text-sm">
                                {Object.entries(selectedSubmission.data).map(([key, value]) => {
                                    // Simple rudimentary formatting
                                    if (!value) return null
                                    return (
                                        <div key={key} className="grid grid-cols-1 gap-1 pb-2 border-b border-white/5 last:border-0">
                                            <span className="text-muted-foreground font-medium capitalize">{key.replace(/_/g, ' ')}</span>
                                            <span className="text-foreground font-mono bg-muted/30 p-1.5 rounded break-words">
                                                {Array.isArray(value) ? value.join(', ') : String(value)}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right: Analysis Builder */}
                    <div className="flex flex-col h-full overflow-hidden">
                        <div className="flex-1 p-4 rounded-xl bg-card border border-border flex flex-col">
                            <h3 className="font-bold mb-2 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-primary" />
                                Expert Roadmap Builder
                            </h3>
                            <textarea
                                className="flex-1 w-full bg-background border border-border rounded-lg p-4 font-mono text-sm resize-none focus:outline-none focus:border-primary"
                                placeholder="# Executive Summary&#10;&#10;Based on the analysis of {Company}, we have identified..."
                                value={analysisText}
                                onChange={(e) => setAnalysisText(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">Apex Reviews</h1>
                    <p className="text-muted-foreground">Admin portal for expert business analysis.</p>
                </div>
                <div className="bg-muted px-4 py-2 rounded-lg text-sm">
                    {submissions.filter(s => s.status === 'pending_review').length} Pending
                </div>
            </div>

            <div className="grid gap-4">
                {submissions.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground bg-card border border-border rounded-xl">
                        No audit submissions found.
                    </div>
                ) : (
                    submissions.map(sub => (
                        <div
                            key={sub.id}
                            onClick={() => handleSelect(sub)}
                            className="group flex items-center justify-between p-6 rounded-xl bg-card border border-border hover:border-primary/50 cursor-pointer transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${sub.status === 'completed'
                                    ? 'bg-green-500/10 text-green-500'
                                    : 'bg-yellow-500/10 text-yellow-500'
                                    }`}>
                                    {sub.status === 'completed' ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-foreground">{sub.data.company_name || 'Unnamed Company'}</h3>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <span>{formatDate(sub.submittedAt)}</span>
                                        <span>•</span>
                                        <span className="capitalize">{sub.data.industry || 'Unknown Industry'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className={`px-3 py-1 text-xs font-medium rounded-full ${sub.status === 'completed'
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-yellow-500/20 text-yellow-400'
                                    }`}>
                                    {sub.status === 'pending_review' ? 'Pending Review' : 'Completed'}
                                </div>
                                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
