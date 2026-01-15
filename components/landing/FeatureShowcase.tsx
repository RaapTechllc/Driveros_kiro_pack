'use client'

import { useState, useEffect } from 'react'
import {
  ChevronLeft, ChevronRight,
  LineChart, Activity, BarChart3, PieChart,
  FileSpreadsheet, Database, ArrowRight,
  CheckCircle2, AlertTriangle, ShieldCheck,
  Gauge, Zap, TrendingUp, Layers
} from 'lucide-react'

interface Showcase {
  title: string
  description: string
  caption: string
}

const showcases: Showcase[] = [
  {
    title: 'Flash Scan Results',
    description: 'See your bottleneck, KPI, and next 3 moves in under 5 minutes',
    caption: 'Accelerator metric + quick wins grounded in your constraint'
  },
  {
    title: 'Dashboard Overview',
    description: 'Track velocity and keep the plan moving every week',
    caption: 'Engine health, trends, and prioritized actions in one view'
  },
  {
    title: 'Full Audit Analysis',
    description: 'Get the 5-engine scorecard and risk flags',
    caption: 'Mechanism-first analysis with do-now priorities'
  },
  {
    title: 'Export & Integrate',
    description: 'Bring your plan into Excel, Sheets, or your ops stack',
    caption: 'Own your data and keep momentum outside the app'
  }
]

export function FeatureShowcase() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // Auto-advance every 6 seconds to give time to read
  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % showcases.length)
    }, 6000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const goToPrevious = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev - 1 + showcases.length) % showcases.length)
  }

  const goToNext = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev + 1) % showcases.length)
  }

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false)
    setCurrentIndex(index)
  }

  const current = showcases[currentIndex]

  // Render different visual content based on the active slide
  const renderVisualContent = () => {
    switch (currentIndex) {
      case 0: // Flash Scan - Infographic Mockup
        return (
          <div className="w-full h-full bg-[#0a0a0a] rounded-xl border border-white/10 p-6 flex flex-col md:flex-row gap-6 font-sans relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

            {/* Left Col: Acceleration Gauge */}
            <div className="flex-1 flex flex-col items-center justify-center p-4 bg-white/5 rounded-lg border border-white/5 relative">
              <span className="text-muted-foreground text-xs uppercase tracking-widest mb-4">Acceleration Score</span>
              <div className="relative w-40 h-40">
                {/* SVG Gauge */}
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#333" strokeWidth="8" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="220 283" className="text-primary drop-shadow-[0_0_10px_rgba(var(--primary),0.5)]" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-white">87</span>
                  <span className="text-[10px] text-green-400 font-medium">STRONG MOMENTUM</span>
                </div>
              </div>
            </div>

            {/* Right Col: Bottlenecks & Steps */}
            <div className="flex-[1.5] flex flex-col justify-between">
              <div className="mb-4">
                <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-3">
                  <AlertTriangle className="h-4 w-4 text-orange-500" /> TOP 3 BOTTLENECKS
                </h4>
                <div className="space-y-2">
                  <div className="bg-white/5 p-2 rounded border-l-2 border-orange-500 text-xs text-gray-300">
                    Limited Operational Capacity
                  </div>
                  <div className="bg-white/5 p-2 rounded border-l-2 border-yellow-500 text-xs text-gray-300">
                    Inefficient Lead Conversion
                  </div>
                  <div className="bg-white/5 p-2 rounded border-l-2 border-blue-500 text-xs text-gray-300">
                    Outdated Technology Stack
                  </div>
                </div>
              </div>

              <div>
                <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" /> NEXT STEPS
                </h4>
                <div className="text-xs text-muted-foreground">
                  <span className="text-green-400">→</span> Hire 2 senior project managers (Q3)
                </div>
              </div>
            </div>
          </div>
        )

      case 1: // Dashboard Overview - Code Mockup
        return (
          <div className="w-full h-full p-6 flex flex-col gap-4 bg-[#0a0a0a] rounded-xl border border-white/10 shadow-2xl overflow-hidden font-mono text-xs">
            {/* Mock Header */}
            <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-2">
              <span className="text-muted-foreground font-bold tracking-wider">DRIVER OS DASHBOARD</span>
              <div className="flex gap-2 items-center">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-green-500">LIVE</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 h-full">
              {/* Widget 1: Velocity */}
              <div className="col-span-2 bg-white/5 rounded p-3 flex flex-col justify-between border border-white/5">
                <div className="flex justify-between text-muted-foreground mb-2">
                  <span>VELOCITY TREND</span>
                  <Activity className="h-4 w-4 text-blue-400" />
                </div>
                <div className="flex-1 flex items-end gap-2 px-1">
                  {[40, 65, 45, 80, 55, 90, 85].map((h, i) => (
                    <div key={i} className="flex-1 bg-gradient-to-t from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300 transition-all rounded-t-sm" style={{ height: `${h}%` }}></div>
                  ))}
                </div>
              </div>

              {/* Widget 2: Engine Health */}
              <div className="bg-white/5 rounded p-3 flex flex-col items-center justify-center border border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent"></div>
                <span className="absolute top-3 left-3 text-muted-foreground text-[10px]">HEALTH</span>
                <div className="relative h-20 w-20 rounded-full border-4 border-white/10 flex items-center justify-center">
                  <span className="text-xl font-bold text-white">92%</span>
                  <div className="absolute inset-0 rounded-full border-4 border-green-500 border-l-transparent rotate-45 shadow-[0_0_15px_rgba(34,197,94,0.4)]"></div>
                </div>
              </div>

              {/* Widget 3: Priorities */}
              <div className="col-span-3 bg-white/5 rounded p-3 border border-white/5">
                <div className="text-muted-foreground mb-2 flex items-center gap-2">
                  <ShieldCheck className="h-3 w-3 text-primary" />
                  <span>PRIORITIZED ACTIONS</span>
                </div>
                <div className="space-y-2">
                  {['Fix Lead Leakage in Stage 2', 'Hire Ops Manager', 'Update OKRs'].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 bg-black/40 p-2 rounded border border-white/5">
                      <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                      <span className="text-gray-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case 2: // Full Audit Analysis - Code Mockup
        return (
          <div className="w-full h-full p-8 flex flex-col bg-[#0f1115] rounded-xl border border-white/10 shadow-2xl font-sans relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"></div>

            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <BarChart3 className="text-primary h-5 w-5" /> 5-ENGINE SCORECARD
            </h3>

            <div className="space-y-4 flex-1">
              {[
                { label: 'LEADERSHIP', score: 85, color: 'bg-emerald-500', w: '85%' },
                { label: 'PRODUCT', score: 92, color: 'bg-emerald-500', w: '92%' },
                { label: 'MARKETING', score: 45, color: 'bg-red-500', w: '45%' },
                { label: 'SALES', score: 60, color: 'bg-yellow-500', w: '60%' },
                { label: 'OPERATIONS', score: 78, color: 'bg-emerald-500', w: '78%' },
              ].map((engine, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold tracking-wider text-muted-foreground">
                    <span>{engine.label}</span>
                    <span className={engine.score < 50 ? 'text-red-400' : 'text-white'}>{engine.score}/100</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${engine.color} shadow-[0_0_10px_currentColor] transition-all duration-1000`}
                      style={{ width: engine.w }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-3 bg-red-500/10 p-2 rounded border border-red-500/20">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-red-200 text-xs font-medium">CRITICAL RISK: MARKETING ENGINE UNDERPERFORMING</span>
            </div>
          </div>
        )

      case 3: // Export & Integrate - Code Mockup
        return (
          <div className="w-full h-full p-6 flex flex-col justify-center items-center bg-gradient-to-br from-gray-900 to-black rounded-xl border border-white/10 shadow-2xl relative overflow-hidden">
            {/* Data stream effect */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(90deg, transparent 50%, rgba(255,255,255,0.1) 50%)', backgroundSize: '20px 20px' }}></div>

            <div className="flex items-center gap-4 md:gap-8 relative z-10 w-full justify-center">
              {/* Source */}
              <div className="flex flex-col items-center gap-3">
                <div className="h-16 w-16 md:h-20 md:w-20 rounded-xl bg-primary/20 border-2 border-primary flex items-center justify-center shadow-[0_0_30px_rgba(var(--primary),0.3)]">
                  <Database className="h-8 w-8 text-primary" />
                </div>
                <span className="text-xs font-bold text-muted-foreground tracking-widest">DRIVER OS</span>
              </div>

              {/* Flow Animation */}
              <div className="flex flex-col items-center gap-1 flex-1 max-w-[100px]">
                <div className="flex gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-white/50 animate-bounce delay-75"></div>
                  <div className="h-1.5 w-1.5 rounded-full bg-white/50 animate-bounce delay-150"></div>
                  <div className="h-1.5 w-1.5 rounded-full bg-white/50 animate-bounce delay-300"></div>
                </div>
                <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
                <ArrowRight className="text-muted-foreground h-4 w-4" />
              </div>

              {/* Destinations */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 bg-white/5 p-2 rounded-lg border border-white/10 w-32 md:w-40 hover:bg-white/10 transition-colors group cursor-pointer">
                  <FileSpreadsheet className="text-green-500 h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-medium text-gray-300">Excel / CSV</span>
                </div>
                <div className="flex items-center gap-3 bg-white/5 p-2 rounded-lg border border-white/10 w-32 md:w-40 hover:bg-white/10 transition-colors group cursor-pointer">
                  <div className="h-4 w-4 text-blue-500 font-bold flex items-center justify-center text-[10px] border border-blue-500 rounded group-hover:scale-110 transition-transform">G</div>
                  <span className="text-xs font-medium text-gray-300">Sheets</span>
                </div>
                <div className="flex items-center gap-3 bg-white/5 p-2 rounded-lg border border-white/10 w-32 md:w-40 hover:bg-white/10 transition-colors group cursor-pointer">
                  <Layers className="text-purple-500 h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-medium text-gray-300">Ops Stack</span>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  // Pre-load content
  useEffect(() => {
    // optional: could prefetch images here if using them
  }, [])

  return (
    <div className="relative w-full max-w-6xl mx-auto px-4">
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-3">See It In Action</h2>
        <p className="text-muted-foreground text-lg">
          From assessment to action in minutes, not weeks
        </p>
      </div>

      {/* Main Display Area - 16:9 Aspect Ratio Container */}
      <div className="relative w-full aspect-[16/9] bg-card/50 backdrop-blur-sm border-2 border-border/50 rounded-2xl overflow-hidden shadow-2xl group mx-auto">

        {/* Visual Content Rendered Here */}
        <div className="absolute inset-0 p-4 md:p-8 flex items-center justify-center transition-all duration-500">
          {renderVisualContent()}
        </div>

        {/* Navigation Arrows (Hover only) */}
        <button
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 backdrop-blur border border-white/10 hover:bg-black/80 hover:scale-110 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 z-10"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>

        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 backdrop-blur border border-white/10 hover:bg-black/80 hover:scale-110 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 z-10"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Caption/Description for current slide */}
      <div className="text-center mt-6 h-12 transition-all duration-300">
        <p className="text-xl font-medium text-foreground">{current.caption}</p>
      </div>

      {/* Navigation Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8 w-full max-w-6xl mx-auto">
        {showcases.map((showcase, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`
              relative flex flex-col items-start p-4 rounded-xl border-2 transition-all duration-300 text-left
              ${index === currentIndex
                ? 'border-primary bg-primary/5 shadow-[0_0_20px_rgba(var(--primary),0.1)]'
                : 'border-transparent bg-card/50 hover:bg-muted/50 hover:border-border/50'
              }
            `}
            aria-label={`Go to slide ${showcase.title}`}
            aria-current={index === currentIndex ? 'true' : 'false'}
          >
            <span
              className={`text-sm font-bold mb-1 transition-colors ${index === currentIndex ? 'text-primary' : 'text-foreground'
                }`}
            >
              {showcase.title}
            </span>
            <span className="text-xs text-muted-foreground line-clamp-2">
              {showcase.description}
            </span>

            {/* Active Indicator Line */}
            {index === currentIndex && (
              <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-b-xl opacity-50 shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
