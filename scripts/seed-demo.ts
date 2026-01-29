#!/usr/bin/env tsx
/**
 * Seed Demo Data - "Golden Path" Scenario
 * Creates a realistic demo environment for judges/investors
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

async function seedDemoData() {
  console.log('🌱 Seeding demo data for DriverOS...')

  try {
    // 1. Create Demo Organization
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: 'Racer\'s Edge Motorsports',
        industry: 'Automotive Performance',
        size: '50-100 employees',
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (orgError) throw orgError
    console.log('✅ Created demo organization:', org.name)

    // 2. Create Demo User
    const { data: user, error: userError } = await supabase.auth.signUp({
      email: 'demo@driveros.app',
      password: 'Demo123!@#',
      options: {
        data: {
          full_name: 'Demo Driver',
          role: 'Owner',
        },
      },
    })

    if (userError) throw userError
    console.log('✅ Created demo user: demo@driveros.app')

    // 3. Link User to Organization
    await supabase.from('organization_members').insert({
      organization_id: org.id,
      user_id: user.user?.id,
      role: 'owner',
      joined_at: new Date().toISOString(),
    })

    // 4. Seed North Star Goal
    await supabase.from('north_stars').insert({
      organization_id: org.id,
      goal: 'Achieve $5M ARR by Q4 2026',
      target_date: '2026-12-31',
      current_value: 2800000,
      target_value: 5000000,
      unit: 'USD',
      created_at: new Date().toISOString(),
    })
    console.log('✅ Created North Star goal')

    // 5. Seed Sample Actions (Pit Stop)
    const actions = [
      {
        title: 'Launch new product line',
        category: 'Product',
        status: 'in_progress',
        priority: 'high',
        due_date: '2026-03-15',
        impact_score: 85,
      },
      {
        title: 'Hire 2 senior sales reps',
        category: 'Team',
        status: 'planned',
        priority: 'high',
        due_date: '2026-02-28',
        impact_score: 75,
      },
      {
        title: 'Implement CRM system',
        category: 'Operations',
        status: 'completed',
        priority: 'medium',
        due_date: '2026-01-15',
        impact_score: 60,
      },
    ]

    for (const action of actions) {
      await supabase.from('actions').insert({
        organization_id: org.id,
        ...action,
        created_at: new Date().toISOString(),
      })
    }
    console.log(`✅ Created ${actions.length} sample actions`)

    // 6. Seed Recent Check-ins
    const checkIns = [
      {
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        revenue: 2600000,
        team_morale: 8,
        customer_satisfaction: 7,
        notes: 'Strong week. New client signed.',
      },
      {
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        revenue: 2500000,
        team_morale: 7,
        customer_satisfaction: 7,
        notes: 'Steady progress on product development.',
      },
    ]

    for (const checkIn of checkIns) {
      await supabase.from('check_ins').insert({
        organization_id: org.id,
        ...checkIn,
      })
    }
    console.log(`✅ Created ${checkIns.length} check-ins`)

    // 7. Seed Guardrails
    const guardrails = [
      {
        type: 'financial',
        metric: 'Burn Rate',
        threshold: 100000,
        current_value: 85000,
        status: 'green',
      },
      {
        type: 'team',
        metric: 'Employee Retention',
        threshold: 85,
        current_value: 92,
        status: 'green',
      },
      {
        type: 'customer',
        metric: 'Churn Rate',
        threshold: 5,
        current_value: 3.2,
        status: 'green',
      },
    ]

    for (const guardrail of guardrails) {
      await supabase.from('guardrails').insert({
        organization_id: org.id,
        ...guardrail,
        created_at: new Date().toISOString(),
      })
    }
    console.log(`✅ Created ${guardrails.length} guardrails`)

    console.log('\n🎉 Demo data seeded successfully!')
    console.log('\n📋 Demo Credentials:')
    console.log('   Email: demo@driveros.app')
    console.log('   Password: Demo123!@#')
    console.log('\n🚀 Start the app and login to see the demo!')

  } catch (error) {
    console.error('❌ Error seeding demo data:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  seedDemoData().then(() => process.exit(0))
}

export { seedDemoData }
