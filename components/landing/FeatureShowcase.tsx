'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Showcase {
  title: string
  description: string
  image: string
  caption: string
}

const showcases: Showcase[] = [
  {
    title: 'Flash Scan Results',
    description: 'Get instant business insights in under 5 minutes',
    image: '/screenshots/flash-scan-results.png',
    caption: 'Instant accelerator recommendations and quick wins'
  },
  {
    title: 'Dashboard Overview',
    description: 'Track your business velocity with the Signal Board',
    image: '/screenshots/dashboard-overview.png',
    caption: 'Real-time engine health and action prioritization'
  },
  {
    title: 'Full Audit Analysis',
    description: 'Complete 5-engine scoring with risk assessment',
    image: '/screenshots/full-audit-results.png',
    caption: 'Detailed analysis with brakes and do-now actions'
  },
  {
    title: 'Export & Integrate',
    description: 'Download your data to Excel or Google Sheets',
    image: '/screenshots/export-csv.png',
    caption: 'Complete data portability with CSV export'
  }
]

export function FeatureShowcase() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // Auto-advance every 4 seconds
  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % showcases.length)
    }, 4000)

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

  return (
    <div className="relative w-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-3">See It In Action</h2>
        <p className="text-muted-foreground text-lg">
          From assessment to actionable insights in minutes
        </p>
      </div>

      {/* Showcase Container */}
      <div className="relative bg-card border-2 border-border rounded-2xl overflow-hidden shadow-xl">
        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Title & Description */}
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold text-foreground">
              {current.title}
            </h3>
            <p className="text-muted-foreground">
              {current.description}
            </p>
          </div>

          {/* Image/Screenshot Placeholder */}
          <div className="relative w-full aspect-video bg-muted rounded-xl flex items-center justify-center overflow-hidden border border-border">
            {/* Fallback when no actual screenshot */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-yellow-500/10" />
            <div className="relative z-10 text-center space-y-4 p-8">
              <div className="text-8xl">📊</div>
              <p className="text-sm text-muted-foreground max-w-md">
                {current.caption}
              </p>
            </div>

            {/* Actual image would go here when screenshots are available */}
            {/* <Image
              src={current.image}
              alt={current.title}
              fill
              className="object-cover"
            /> */}
          </div>

          {/* Caption */}
          <p className="text-center text-sm text-muted-foreground italic">
            {current.caption}
          </p>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border hover:bg-background hover:scale-110 transition-all flex items-center justify-center"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border hover:bg-background hover:scale-110 transition-all flex items-center justify-center"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Indicators */}
      <div className="flex justify-center gap-2 mt-6">
        {showcases.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex
                ? 'w-8 bg-primary'
                : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Progress indicator text */}
      <div className="text-center mt-4 text-sm text-muted-foreground">
        {currentIndex + 1} / {showcases.length}
        {isAutoPlaying && (
          <span className="ml-2 text-xs">(auto-playing)</span>
        )}
      </div>
    </div>
  )
}
