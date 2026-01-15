'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  HelpCircle, 
  Keyboard, 
  AlertTriangle, 
  BookOpen,
  ChevronDown,
  ChevronRight,
  Zap,
  Target,
  BarChart3,
  Upload,
  Calendar,
  Settings
} from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
  category: string
}

const faqs: FAQItem[] = [
  {
    category: 'Getting Started',
    question: 'What is the difference between Flash Scan and Full Audit?',
    answer: 'Flash Scan is a 5-minute snapshot that shows your bottleneck, your KPI, and your next 3 quick wins. Full Audit is a 15-minute deep dive that scores all 5 business engines, flags risks, and generates a prioritized action plan you can run this week.'
  },
  {
    category: 'Getting Started',
    question: 'How do I start using DriverOS?',
    answer: 'Start with a Flash Scan. Fill in 5 quick fields, get your bottleneck and KPI, then act on the first three wins. Upgrade to Full Audit anytime when you want the full engine scorecard and risk flags.'
  },
  {
    category: 'Getting Started',
    question: 'What is Demo Mode?',
    answer: 'Demo Mode lets you explore all DriverOS features using sample data from a fictional company (TechFlow Solutions). Your real data is backed up and restored when you exit. Access it from Settings or the homepage.'
  },
  {
    category: 'Dashboard',
    question: 'What do the Business Gears mean?',
    answer: 'Gears 1-5 represent your business maturity: Gear 1 (Idle) - Just starting, Gear 2 (First) - Building foundations, Gear 3 (Second) - Gaining momentum, Gear 4 (Third) - Strong performance, Gear 5 (Apex) - Operating at peak. Your gear is calculated from engine scores and risk factors.'
  },
  {
    category: 'Dashboard',
    question: 'How do I track action progress?',
    answer: 'Click on any action status badge to cycle through states: todo → doing → done. Your progress is saved automatically. Use filters to view actions by engine, owner, or status.'
  },
  {
    category: 'Dashboard',
    question: 'What are the 5 Business Engines?',
    answer: 'The 5 engines are: Sales (revenue generation), Marketing (lead generation & brand), Operations (delivery & efficiency), Finance (cash flow & profitability), and People (team & culture). Each engine is scored 0-100 in Full Audit.'
  },
  {
    category: 'Year Board',
    question: 'How do I use the Year Board?',
    answer: 'The Year Board helps you plan your year using Jesse Itzler\'s methodology. Add items (Plays, Milestones, Rituals, Tune-ups) and organize them by quarter and department. Drag and drop to reorganize. Use "Generate AI Plan" for intelligent suggestions based on your business data.'
  },
  {
    category: 'Year Board',
    question: 'What are Plays, Milestones, Rituals, and Tune-ups?',
    answer: 'Plays are major initiatives (6 per year recommended). Milestones are measurable targets (3-6 per year). Rituals are recurring habits that compound (4 per year). Tune-ups are quarterly reviews to adjust course.'
  },
  {
    category: 'Data',
    question: 'Is my data secure?',
    answer: 'All data is stored locally in your browser\'s localStorage. Nothing is sent to external servers. You own your data completely. Export anytime from Dashboard or Settings.'
  },
  {
    category: 'Data',
    question: 'How do I export my data?',
    answer: 'Go to Dashboard → Export & Tools section. You can export actions, goals, meeting templates individually, or download everything as a combined CSV or JSON backup. Excel-ready format is also available.'
  },
  {
    category: 'Data',
    question: 'Can I import existing data?',
    answer: 'Yes! Go to Import Data from the sidebar. Download our CSV templates, fill them with your data, and upload. Validation ensures data integrity before import.'
  },
  {
    category: 'Meetings',
    question: 'What are the meeting templates?',
    answer: 'We provide three templates: Warm-Up (10min daily standup), Pit Stop (30min weekly review), and Full Tune-Up (75min monthly deep dive). Each generates relevant actions based on your discussion.'
  }
]

const shortcuts = [
  { keys: ['G', 'D'], description: 'Go to Dashboard' },
  { keys: ['G', 'Y'], description: 'Go to Year Board' },
  { keys: ['G', 'S'], description: 'Go to Settings' },
  { keys: ['G', 'H'], description: 'Go to Help' },
  { keys: ['?'], description: 'Show keyboard shortcuts' },
  { keys: ['Esc'], description: 'Close modals/dialogs' },
]

const troubleshooting = [
  {
    problem: 'Dashboard shows "No data"',
    solutions: [
      'Complete a Flash Scan or Full Audit first',
      'Check if Demo Mode is enabled in Settings',
      'Clear browser cache and reload'
    ]
  },
  {
    problem: 'CSV import fails',
    solutions: [
      'Download and use our template files',
      'Ensure CSV encoding is UTF-8',
      'Check that required fields are filled',
      'Remove any special characters from data'
    ]
  },
  {
    problem: 'Theme changes don\'t persist',
    solutions: [
      'Ensure cookies/localStorage are enabled',
      'Try a hard refresh (Ctrl+Shift+R)',
      'Check if private/incognito mode is active'
    ]
  },
  {
    problem: 'Year Board items disappear',
    solutions: [
      'Check if browser storage is full',
      'Export data before clearing cache',
      'Verify autosave is working (watch for save indicators)'
    ]
  }
]

const featureGuides = [
  {
    icon: <Zap className="h-5 w-5" />,
    title: 'Flash Scan',
    description: 'Quick 5-minute business assessment',
    href: '/flash-scan'
  },
  {
    icon: <BarChart3 className="h-5 w-5" />,
    title: 'Full Audit',
    description: 'Comprehensive engine analysis',
    href: '/full-audit'
  },
  {
    icon: <Target className="h-5 w-5" />,
    title: 'Year Board',
    description: 'Annual planning with AI assistance',
    href: '/year-board'
  },
  {
    icon: <Upload className="h-5 w-5" />,
    title: 'Import Data',
    description: 'Bring in your existing data',
    href: '/import'
  },
  {
    icon: <Calendar className="h-5 w-5" />,
    title: 'Meetings',
    description: 'Structured meeting templates',
    href: '/meetings'
  },
  {
    icon: <Settings className="h-5 w-5" />,
    title: 'Settings',
    description: 'Customize your experience',
    href: '/settings'
  }
]

export default function HelpPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const categories = ['all', ...Array.from(new Set(faqs.map(f => f.category)))]
  const filteredFaqs = selectedCategory === 'all' 
    ? faqs 
    : faqs.filter(f => f.category === selectedCategory)

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Help Center</h1>
        <p className="text-muted-foreground mt-1">
          Everything you need to get the most out of DriverOS
        </p>
      </div>

      {/* Quick Start Guides */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Quick Start Guides
          </CardTitle>
          <CardDescription>
            Jump to any feature
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {featureGuides.map((guide) => (
              <a
                key={guide.href}
                href={guide.href}
                className="p-4 rounded-lg border hover:border-primary hover:bg-primary/5 transition-all"
              >
                <div className="flex items-center gap-2 mb-1 text-primary">
                  {guide.icon}
                  <span className="font-medium">{guide.title}</span>
                </div>
                <p className="text-xs text-muted-foreground">{guide.description}</p>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Find answers to common questions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedCategory === cat
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {cat === 'all' ? 'All' : cat}
              </button>
            ))}
          </div>

          {/* FAQ List */}
          <div className="space-y-2">
            {filteredFaqs.map((faq, index) => (
              <div 
                key={index}
                className="border rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {expandedFaq === index ? (
                      <ChevronDown className="h-4 w-4 text-primary" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="font-medium">{faq.question}</span>
                  </div>
                  <Badge variant="outline" className="ml-2 shrink-0">
                    {faq.category}
                  </Badge>
                </button>
                {expandedFaq === index && (
                  <div className="px-4 pb-4 pl-11">
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Keyboard Shortcuts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </CardTitle>
          <CardDescription>
            Navigate faster with keyboard commands
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {shortcuts.map((shortcut, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <span className="text-sm">{shortcut.description}</span>
                <div className="flex gap-1">
                  {shortcut.keys.map((key, i) => (
                    <kbd
                      key={i}
                      className="px-2 py-1 text-xs font-mono bg-background border rounded shadow-sm"
                    >
                      {key}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Press keys in sequence (e.g., G then D) for navigation shortcuts
          </p>
        </CardContent>
      </Card>

      {/* Troubleshooting */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Troubleshooting
          </CardTitle>
          <CardDescription>
            Common issues and how to fix them
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {troubleshooting.map((item, index) => (
            <div key={index} className="border rounded-lg p-4">
              <h4 className="font-medium text-destructive mb-2">{item.problem}</h4>
              <ul className="space-y-1">
                {item.solutions.map((solution, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    {solution}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Contact/Support */}
      <Card>
        <CardHeader>
          <CardTitle>Need More Help?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            DriverOS is designed to be intuitive. If you're stuck:
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span className="text-primary">1.</span>
              Try Demo Mode to explore features with sample data
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary">2.</span>
              Check the FAQ section above for common questions
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary">3.</span>
              Export your data before making major changes
            </li>
          </ul>
          <div className="pt-4 border-t">
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
