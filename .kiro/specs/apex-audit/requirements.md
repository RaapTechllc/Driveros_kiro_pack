# Apex Audit - Ultra Premium Business Analysis

## Overview
A comprehensive business audit that goes beyond Flash Scan (5 min) and Full Audit (15 min) to provide deep strategic analysis. Takes 30-45 minutes to complete, delivers executive-level insights.

## Naming
- **Apex Audit** - Fits the Gear 5 (Apex) theme
- Tagline: "The full picture. The real numbers. The path forward."

## Form Sections (8 sections, ~80 fields)

### 1. Company Profile (Essential)
- Company name (text)
- Website (url)
- Industry (dropdown: Home Services, Tech, Healthcare, Finance, Retail, Manufacturing, Other)
- Primary product/service (textarea)
- Employees (dropdown: Just me, 2-10, 11-50, 51-200, 200+)
- Years in business (number)
- Legal entity (dropdown: Sole Prop, LLC, S-Corp, C-Corp, Partnership)
- Geography (dropdown: Local, Regional, National, International)

### 2. Revenue & Profit
- Annual revenue (number with presets: <100K, 100K-500K, 500K-1M, 1M-5M, 5M+)
- Current yearly profit (number)
- Monthly revenue (number)
- Gross margin % (slider 0-100)
- Net margin % (slider 0-100)
- Cash on hand (number)
- Monthly burn rate (number)

### 3. Sales & Marketing
- Primary selling mechanism (dropdown: In-Person, Phone, Online, Hybrid)
- Primary advertising (dropdown: Paid Ads, SEO, Social, Referrals, Cold Outreach, None)
- Primary lead source (dropdown: Referrals, Paid Search, Social, Content, Events, Other)
- Average deal size (number)
- Sales cycle days (number)
- Close rate % (slider)
- Monthly marketing spend (number)
- Monthly leads (number)
- Sales team size (number)

### 4. Customers
- Total customers (number)
- New customers/month (number)
- Customer acquisition cost (number)
- Customer lifetime value (number)
- Monthly churn % (slider)
- NPS score (slider -100 to 100)
- Average order value (number)

### 5. Operations
- Primary delivery (dropdown: Done for you, Done with you, DIY/Self-serve, Product)
- Tech status (dropdown: Minimal, Basic CRM, Integrated Stack, Custom/Advanced)
- Team structure (textarea)
- Workflow stages (textarea)
- Quality metrics (textarea)

### 6. Growth Planning
- 12-month revenue goal (number)
- Main growth channel (dropdown)
- Biggest constraint (dropdown: Cash, Capacity, Demand, Delivery, People, Marketing, Tech)
- Exit timeline (dropdown: No plans, 1-2 years, 3-5 years, 5+ years)
- Exit target amount (number)

### 7. Tech Stack (checkboxes)
- CRM (HubSpot, Salesforce, Other, None)
- Accounting (QuickBooks, Xero, NetSuite, Other)
- Marketing (Meta Ads, Google Ads, Email platform)
- Analytics (GA4, Mixpanel, Custom)
- Communication (Slack, Teams, Other)

### 8. Additional Context
- Value proposition (textarea)
- Key differentiators (textarea)
- Top customer objections (textarea)
- What's working well (textarea)
- Biggest challenges (textarea)

## AI Analysis Output

### Executive Summary
- Business health score (0-100)
- Stage assessment (Startup, Growth, Scale, Mature)
- Primary bottleneck identified
- 90-day priority recommendation

### Financial Analysis
- Unit economics breakdown
- CAC:LTV ratio assessment
- Margin optimization opportunities
- Cash runway analysis

### Growth Opportunities
- Channel recommendations based on profile
- Pricing optimization suggestions
- Market expansion possibilities

### Risk Assessment
- Top 3 business risks
- Mitigation strategies
- Compliance gaps (if any)

### Action Plan
- Immediate (This week): 3 actions
- Short-term (30 days): 5 actions
- Medium-term (90 days): 3 strategic initiatives

## Technical Implementation
- Route: `/apex-audit`
- Form: Multi-step wizard (8 steps)
- Storage: localStorage (like other audits)
- Analysis: Client-side rules engine + enhanced scoring
- Export: PDF-style summary + CSV data
