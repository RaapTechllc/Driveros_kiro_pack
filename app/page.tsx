import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { DemoModeToggle } from '@/components/demo/DemoModeToggle'
import { Zap, Target, Gauge, ArrowRight, CheckCircle2 } from 'lucide-react'

export default function HomePage() {
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
                  Performance Dashboard
                </span>
                <div className="h-px bg-gradient-to-r from-primary to-transparent mt-2" />
              </div>

              <h1 className="font-display text-7xl lg:text-8xl font-bold leading-[0.9] tracking-tight">
                <span className="text-foreground">Driver</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-400">
                  OS
                </span>
              </h1>

              <p className="text-muted-foreground text-xl leading-relaxed max-w-lg">
                Turn your <span className="text-primary font-semibold">North Star</span> into
                weekly wins with <span className="text-foreground font-semibold">instant</span> business insights.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/flash-scan">
                  <Button
                    size="lg"
                    className="group w-full sm:w-auto"
                  >
                    <span className="relative z-10 flex items-center gap-3">
                      <Zap className="w-5 h-5" />
                      Start Flash Scan
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
                    Full Audit
                  </Button>
                </Link>
              </div>

              <p className="text-sm text-muted-foreground flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Free • No signup • Results in under 5 minutes
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

          {/* Feature Grid - Racing stripes aesthetic */}
          <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: 'Flash Scan', desc: '5-minute assessment with instant recommendations', gear: '1-2' },
              { icon: Target, title: 'Full Audit', desc: 'Complete engine analysis with risk assessment', gear: '3-4' },
              { icon: Gauge, title: 'Dashboard', desc: 'Real-time tracking of your business velocity', gear: '5' }
            ].map((feature, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-2xl border-2 border-border
                           bg-card p-8
                           hover:border-primary/50 transition-all duration-300
                           hover:shadow-[0_0_30px_rgba(255,71,19,0.1)]"
              >
                {/* Racing stripe accent */}
                <div className="absolute top-0 left-0 w-1 h-0 bg-gradient-to-b from-primary to-accent
                                group-hover:h-full transition-all duration-500" />

                {/* Gear number badge */}
                <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-primary/10
                                flex items-center justify-center border border-primary/20">
                  <span className="text-primary font-mono font-bold text-sm">
                    {feature.gear}
                  </span>
                </div>

                <div className="text-primary mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-8 h-8" />
                </div>

                <h3 className="font-display text-2xl font-bold text-foreground mb-3">
                  {feature.title}
                </h3>

                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </div>
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
