'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { DemoModeToggle } from '@/components/demo/DemoModeToggle'
import { FeatureShowcase } from '@/components/landing/FeatureShowcase'
import { Zap, Target, Gauge, ArrowRight, CheckCircle2, Crown } from 'lucide-react'

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return { ref, isVisible }
}

export default function HomePage() {
  const featuresReveal = useScrollReveal()
  return (
    <div className="relative min-h-screen overflow-hidden bg-background dark:bg-[#0a0a0a]">
      {/* Animated background mesh gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-50%] left-[-20%] w-[800px] h-[800px] rounded-full
                        bg-gradient-radial from-orange-500/20 via-orange-500/5 to-transparent
                        blur-3xl animate-pulse"
          style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-[-30%] right-[-10%] w-[600px] h-[600px] rounded-full
                        bg-gradient-radial from-yellow-500/20 via-yellow-500/5 to-transparent
                        blur-3xl animate-pulse"
          style={{ animationDuration: '4s', animationDelay: '2s' }} />

        {/* Grid overlay for technical feel */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-16">
        <div className="max-w-6xl w-full">

          {/* Hero Section - Asymmetric layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left: Bold headline */}
            <div className="space-y-8">
              <div className="inline-block">
                <span className="text-primary text-sm font-bold tracking-[0.3em] uppercase">
                  Stop Guessing. Start Moving.
                </span>
                <div className="h-px bg-gradient-to-r from-primary to-transparent mt-2" />
              </div>

              <h1 className="font-display text-6xl lg:text-7xl font-bold leading-[0.95] tracking-tight">
                <span className="text-foreground">Know Your </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-400">
                  One Thing
                </span>
                <span className="text-foreground"> This Week</span>
              </h1>

              <p className="text-muted-foreground text-xl leading-relaxed max-w-lg">
                5 minutes from now, you&apos;ll know exactly what&apos;s holding your business back
                and the <span className="text-primary font-semibold">three moves</span> that fix it.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/flash-scan">
                  <Button
                    size="lg"
                    variant="shimmer"
                    className="group w-full sm:w-auto"
                  >
                    <span className="relative z-10 flex items-center gap-3">
                      <Zap className="w-5 h-5" />
                      Get My 3 Actions
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Button>
                </Link>

                <Link href="/full-audit">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    Deep Dive Audit
                  </Button>
                </Link>
              </div>

              <p className="text-sm text-muted-foreground flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Free • No signup • Used by 500+ business owners
              </p>
            </div>

            {/* Right: Visual element - Animated Gear */}
            <div className="relative hidden lg:block">
              <div className="relative w-full aspect-square max-w-md mx-auto">
                {/* Rotating gear visualization */}
                <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-spin-slow" />
                <div className="absolute inset-8 rounded-full border-4 border-primary/30 animate-spin-reverse" />
                <div className="absolute inset-16 rounded-full border-4 border-primary/40 animate-spin-slow" />

                {/* Center metric display */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <div className="text-9xl font-mono font-bold text-foreground">5</div>
                    <div className="text-primary font-bold text-xl tracking-wider">GEARS</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Showcase Carousel */}
          <div className="mt-32">
            <FeatureShowcase />
          </div>

          {/* Feature Grid - Racing stripes aesthetic */}
          <div
            ref={featuresReveal.ref}
            className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              { icon: Zap, title: 'Flash Scan', desc: 'Walk away with your #1 constraint and 3 actions to fix it', gear: '1-2', time: '5 min', href: '/flash-scan' },
              { icon: Target, title: 'Full Audit', desc: 'See which of your 5 business engines needs attention first', gear: '3-4', time: '15 min', href: '/full-audit' },
              { icon: Crown, title: 'Apex Audit', desc: 'Executive-level analysis with 80+ data points and strategic roadmap', gear: '5', time: '30-45 min', href: '/pricing', premium: true }
            ].map((feature, i) => (
              <Link key={i} href={feature.href}>
                <div
                  className={`group relative overflow-hidden rounded-2xl border-2 p-8 h-full
                             hover:border-primary/50 transition-all duration-500
                             hover:shadow-[0_0_30px_rgba(255,71,19,0.1)] cursor-pointer
                             ${feature.premium
                      ? 'border-yellow-500/30 bg-gradient-to-br from-yellow-500/5 to-orange-500/5'
                      : 'border-border bg-card'}
                             ${featuresReveal.isVisible
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-8'}`}
                  style={{ transitionDelay: `${i * 150}ms` }}
                >
                  {/* Racing stripe accent */}
                  <div className={`absolute top-0 left-0 w-1 h-0 bg-gradient-to-b ${feature.premium ? 'from-yellow-500 to-orange-500' : 'from-primary to-accent'}
                                  group-hover:h-full transition-all duration-500`} />

                  {/* Gear number badge */}
                  <div className={`absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center border ${feature.premium
                      ? 'bg-yellow-500/10 border-yellow-500/20'
                      : 'bg-primary/10 border-primary/20'
                    }`}>
                    <span className={`font-mono font-bold text-sm ${feature.premium ? 'text-yellow-500' : 'text-primary'}`}>
                      {feature.gear}
                    </span>
                  </div>

                  <div className={`mb-4 group-hover:scale-110 transition-transform ${feature.premium ? 'text-yellow-500' : 'text-primary'}`}>
                    <feature.icon className="w-8 h-8" />
                  </div>

                  <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                    {feature.title}
                    {feature.premium && (
                      <span className="ml-2 text-xs font-normal px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">
                        Premium
                      </span>
                    )}
                  </h3>

                  <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                    {feature.desc}
                  </p>

                  <div className="text-xs text-muted-foreground">
                    ⏱ {feature.time}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Demo Mode Toggle */}
          <div className="mt-16 flex justify-center">
            <DemoModeToggle />
          </div>
        </div>
      </div>
    </div>
  )
}
