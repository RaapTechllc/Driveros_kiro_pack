/**
 * Health check endpoint for Docker/k8s readiness probes.
 * GET /api/health → { status: 'ok', timestamp, version, uptime }
 */

import { NextResponse } from 'next/server'

const startTime = Date.now()

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.1.0',
    uptime: Math.floor((Date.now() - startTime) / 1000),
    environment: process.env.NODE_ENV || 'development',
  })
}
