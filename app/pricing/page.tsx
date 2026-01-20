'use client'

import React, { useState } from 'react'
import { CheckCircle2, Zap, LayoutDashboard, Crown, ArrowRight, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

export default function PricingPage() {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
    const [showDemoModal, setShowDemoModal] = useState(false)
    const [selectedPlan, setSelectedPlan] = useState('')

    const handlePlanSelection = (planName: string) => {
        setSelectedPlan(planName)
        setShowDemoModal(true)
    }

    const plans = [
        {
            name: 'Starter',
            price: 'Free',
            description: 'Perfect for solo founders just starting out.',
            features: [
                'Flash Scan (5-min audit)',
                'Basic Dashboard',
                '3 Core Metrics',
                'Community Support'
            ],
            cta: 'Get Started',
            icon: Zap
        },
        {
            name: 'Pro',
            price: billingCycle === 'monthly' ? '$49' : '$39',
            period: '/mo',
            description: 'For growing businesses needing deeper insights.',
            features: [
                'Everything in Starter',
                'Full Audit (5 Engines)',
                'Apex Audit (1/quarter)',
                'Action Plan Generator',
                'Historical Tracking'
            ],
            cta: 'Start Pro Trial',
            popular: true,
            icon: LayoutDashboard // Changed from CheckCircle2 to LayoutDashboard for Pro
        },
        {
            name: 'Growth',
            price: billingCycle === 'monthly' ? '$149' : '$119',
            period: '/mo',
            description: 'Complete operating system for scaling teams.',
            features: [
                'Everything in Pro',
                'Unlimited Apex Audits',
                'Team Access (5 Users)',
                'Year Board Strategy',
                'Priority Phone Support'
            ],
            cta: 'Contact Sales',
            icon: Crown
        }
    ]

    return (
        <div className="min-h-screen bg-background text-foreground py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-orange-500/10 blur-[100px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-yellow-500/10 blur-[100px]" />
            </div>

            <div className="max-w-7xl mx-auto text-center relative z-10">
                <h2 className="text-primary font-semibold tracking-wide uppercase text-sm mb-4">Pricing Plans</h2>
                <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6">
                    Invest in Your Business's <span className="text-primary">Operating System</span>
                </h1>
                <p className="max-w-2xl mx-auto text-xl text-muted-foreground mb-12">
                    Choose the right plan to clarify your strategy, optimize your operations, and accelerate your growth.
                </p>

                {/* Billing Toggle */}
                <div className="flex justify-center items-center gap-4 mb-16">
                    <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-foreground' : 'text-muted-foreground'}`}>Monthly</span>
                    <button
                        onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
                        className="w-14 h-7 bg-muted rounded-full p-1 relative transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    >
                        <div
                            className={`w-5 h-5 bg-primary rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${billingCycle === 'yearly' ? 'translate-x-7' : 'translate-x-0'
                                }`}
                        />
                    </button>
                    <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-foreground' : 'text-muted-foreground'}`}>
                        Yearly <span className="text-green-500 text-xs font-bold ml-1">(Save 20%)</span>
                    </span>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`relative rounded-2xl p-8 border ${plan.popular
                                    ? 'border-primary bg-card shadow-lg shadow-primary/10'
                                    : 'border-border bg-card/50'
                                } flex flex-col`}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                    Most Popular
                                </div>
                            )}

                            <div className="mb-6 flex items-center gap-3">
                                <div className={`p-3 rounded-xl ${plan.popular ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                    <plan.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold">{plan.name}</h3>
                            </div>

                            <div className="mb-6">
                                <span className="text-4xl font-bold">{plan.price}</span>
                                {plan.period && <span className="text-muted-foreground text-lg">{plan.period}</span>}
                                <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                            </div>

                            <ul className="space-y-4 mb-8 flex-1 text-left">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm">
                                        <CheckCircle2 className={`w-5 h-5 flex-shrink-0 ${plan.popular ? 'text-primary' : 'text-muted-foreground'}`} />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Button
                                variant={plan.popular ? 'default' : 'outline'}
                                size="lg"
                                className="w-full"
                                onClick={() => handlePlanSelection(plan.name)}
                            >
                                {plan.cta}
                                {plan.popular && <ArrowRight className="w-4 h-4 ml-2" />}
                            </Button>
                        </motion.div>
                    ))}
                </div>

                {/* Enterprise Callout */}
                <div className="mt-16 p-8 rounded-2xl bg-muted/30 border border-border text-center">
                    <h3 className="text-xl font-bold mb-2">Need a custom enterprise solution?</h3>
                    <p className="text-muted-foreground mb-6">We offer white-labeling, API access, and dedicated success managers for large agencies.</p>
                    <Button variant="outline" onClick={() => handlePlanSelection('Enterprise')}>
                        Contact Enterprise Sales
                    </Button>
                </div>
            </div>

            {/* Demo Success Modal */}
            <AnimatePresence>
                {showDemoModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl p-6 relative"
                        >
                            <button
                                onClick={() => setShowDemoModal(false)}
                                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                                </div>
                                <h3 className="text-2xl font-bold mb-2">Mockup Success</h3>
                                <p className="text-muted-foreground mb-6">
                                    You selected the <strong>{selectedPlan}</strong> plan.
                                    <br /><br />
                                    In a production environment, this would redirect you to a Stripe Checkout session securely using the keys configured in <code>.env</code>.
                                </p>
                                <div className="w-full bg-muted rounded-lg p-3 mb-6 text-left font-mono text-xs overflow-x-auto text-foreground/80">
                                    <div className="text-muted-foreground mb-1 uppercase tracking-wider text-[10px]">Simulated API Payload</div>
                                    <span className="text-blue-400">POST</span> /api/checkout/session<br />
                                    {`{`}
                                    <br />&nbsp;&nbsp;"plan": "{selectedPlan.toLowerCase()}",
                                    <br />&nbsp;&nbsp;"interval": "{billingCycle}"
                                    <br />{`}`}
                                </div>
                                <Button className="w-full" onClick={() => setShowDemoModal(false)}>
                                    Close Demo
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
