#!/usr/bin/env tsx
/**
 * Reset Demo Data
 * Wipes database and re-seeds with fresh demo data
 * Perfect for back-to-back demos
 */

import { createClient } from '@supabase/supabase-js'
import { seedDemoData } from './seed-demo'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

async function resetDemo() {
  console.log('🔄 Resetting demo environment...')

  try {
    // Delete all data (in reverse order of dependencies)
    const tables = [
      'guardrails',
      'check_ins',
      'actions',
      'north_stars',
      'organization_members',
      'organizations',
    ]

    for (const table of tables) {
      const { error } = await supabase.from(table).delete().neq('id', 0)
      if (error) {
        console.warn(`⚠️ Warning deleting ${table}:`, error.message)
      } else {
        console.log(`✅ Cleared ${table}`)
      }
    }

    // Delete demo user
    const { data: users } = await supabase.auth.admin.listUsers()
    const demoUser = users?.users.find(u => u.email === 'demo@driveros.app')
    if (demoUser) {
      await supabase.auth.admin.deleteUser(demoUser.id)
      console.log('✅ Deleted demo user')
    }

    console.log('\n🌱 Re-seeding demo data...\n')
    
    // Re-seed
    await seedDemoData()

    console.log('\n✨ Demo reset complete!')

  } catch (error) {
    console.error('❌ Error resetting demo:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  resetDemo().then(() => process.exit(0))
}

export { resetDemo }
