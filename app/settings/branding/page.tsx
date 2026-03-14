'use client'

import { useState, useEffect } from 'react'
import { useOrg } from '@/components/providers/OrgProvider'
import { loadBrandConfig, saveBrandConfig } from '@/lib/branding/store'
import type { BrandConfig } from '@/lib/branding/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { CheckCircle2, Palette, Type, MessageSquare, Save } from 'lucide-react'

export default function BrandingSettingsPage() {
  const { currentOrg } = useOrg()
  const orgId = currentOrg?.id || 'default'
  const [config, setConfig] = useState<BrandConfig | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setConfig(loadBrandConfig(orgId))
  }, [orgId])

  const handleSave = () => {
    if (!config) return
    saveBrandConfig(config)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const update = (field: string, value: string) => {
    if (!config) return
    setConfig({ ...config, [field]: value })
  }

  const updateColor = (field: string, value: string) => {
    if (!config) return
    setConfig({ ...config, colors: { ...config.colors, [field]: value } })
  }

  const updateFont = (field: string, value: string) => {
    if (!config) return
    setConfig({ ...config, fonts: { ...config.fonts, [field]: value } })
  }

  const updateVoice = (field: string, value: string | string[]) => {
    if (!config) return
    setConfig({ ...config, voice: { ...config.voice, [field]: value } })
  }

  if (!config) return null

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Brand Settings</h1>
          <p className="text-muted-foreground mt-1">
            Define your brand — every generated document and AI output will match your identity.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saved}>
          {saved ? (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Saved
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Brand
            </>
          )}
        </Button>
      </div>

      {/* Company Basics */}
      <Card>
        <CardHeader>
          <CardTitle>Company Info</CardTitle>
          <CardDescription>Basic brand identity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Company Name</label>
            <Input
              value={config.companyName}
              onChange={e => update('companyName', e.target.value)}
              placeholder="Acme Construction LLC"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Tagline</label>
            <Input
              value={config.tagline || ''}
              onChange={e => update('tagline', e.target.value)}
              placeholder="Building tomorrow, today"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Website</label>
            <Input
              value={config.website || ''}
              onChange={e => update('website', e.target.value)}
              placeholder="https://acmeconstruction.com"
            />
          </div>
        </CardContent>
      </Card>

      {/* Colors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Brand Colors
          </CardTitle>
          <CardDescription>Colors used in generated documents and reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {([
              ['primary', 'Primary'],
              ['primaryForeground', 'Primary Text'],
              ['secondary', 'Secondary'],
              ['accent', 'Accent'],
              ['background', 'Background'],
              ['foreground', 'Text'],
            ] as const).map(([key, label]) => (
              <div key={key} className="space-y-2">
                <label className="text-xs font-medium">{label}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={(config.colors as Record<string, string>)[key]}
                    onChange={e => updateColor(key, e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border border-border"
                  />
                  <Input
                    value={(config.colors as Record<string, string>)[key]}
                    onChange={e => updateColor(key, e.target.value)}
                    className="text-xs h-8"
                    placeholder="#000000"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Preview */}
          <div className="mt-6 rounded-lg overflow-hidden border">
            <div
              className="p-4"
              style={{ background: config.colors.primary, color: config.colors.primaryForeground }}
            >
              <h3 className="font-bold text-lg">{config.companyName || 'Your Company'}</h3>
              {config.tagline && <p className="text-sm opacity-90">{config.tagline}</p>}
            </div>
            <div className="p-4" style={{ background: config.colors.background, color: config.colors.foreground }}>
              <p className="text-sm">This is how your branded documents will look.</p>
              <p className="text-sm mt-2" style={{ color: config.colors.accent }}>
                Accent text stands out like this.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Typography */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            Typography
          </CardTitle>
          <CardDescription>Font families for generated content</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Heading Font</label>
            <Input
              value={config.fonts.heading}
              onChange={e => updateFont('heading', e.target.value)}
              placeholder="Inter, system-ui, sans-serif"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Body Font</label>
            <Input
              value={config.fonts.body}
              onChange={e => updateFont('body', e.target.value)}
              placeholder="Inter, system-ui, sans-serif"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Monospace Font</label>
            <Input
              value={config.fonts.mono}
              onChange={e => updateFont('mono', e.target.value)}
              placeholder="JetBrains Mono, monospace"
            />
          </div>
        </CardContent>
      </Card>

      {/* Voice & Tone */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Voice & Tone
          </CardTitle>
          <CardDescription>
            How AI-generated content should sound. Every email, report, and coaching note will match this voice.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Overall Tone</label>
            <select
              value={config.voice.tone}
              onChange={e => updateVoice('tone', e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="friendly">Friendly</option>
              <option value="authoritative">Authoritative</option>
              <option value="warm">Warm & Approachable</option>
              <option value="technical">Technical</option>
              <option value="bold">Bold & Direct</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">What do you call customers?</label>
              <Input
                value={config.voice.customerTerm}
                onChange={e => updateVoice('customerTerm', e.target.value)}
                placeholder="client, customer, partner"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">What do you call your team?</label>
              <Input
                value={config.voice.teamTerm}
                onChange={e => updateVoice('teamTerm', e.target.value)}
                placeholder="team, crew, staff"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Style Keywords</label>
            <Input
              value={config.voice.style.join(', ')}
              onChange={e => updateVoice('style', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
              placeholder="clear, confident, helpful, data-driven"
            />
            <p className="text-xs text-muted-foreground">Comma-separated descriptors</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Words/Phrases to Avoid</label>
            <Input
              value={config.voice.avoids.join(', ')}
              onChange={e => updateVoice('avoids', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
              placeholder="synergy, leverage, touch base, circle back"
            />
            <p className="text-xs text-muted-foreground">Comma-separated words the AI should never use</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Example Phrases</label>
            <textarea
              value={config.voice.examplePhrases.join('\n')}
              onChange={e => updateVoice('examplePhrases', e.target.value.split('\n').filter(Boolean))}
              placeholder={"We build it right the first time.\nYour project, our priority.\nSafety isn't negotiable."}
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <p className="text-xs text-muted-foreground">One per line — phrases that sound like your brand</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Additional Brand Notes</label>
            <textarea
              value={config.notes || ''}
              onChange={e => update('notes', e.target.value)}
              placeholder="Any other guidelines for AI-generated content..."
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Save button at bottom */}
      <div className="flex justify-end pb-8">
        <Button onClick={handleSave} size="lg" disabled={saved}>
          {saved ? (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Brand Saved
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Brand Settings
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
