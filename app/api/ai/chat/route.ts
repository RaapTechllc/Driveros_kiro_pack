import { NextRequest } from 'next/server'
import { buildSystemPrompt } from '@/lib/ai/prompts'
import type { ChatRequest } from '@/lib/ai/types'

/**
 * POST /api/ai/chat
 *
 * Streaming AI chat endpoint. Sends company memory + page context + conversation
 * to Claude and streams the response back as Server-Sent Events.
 *
 * Requires ANTHROPIC_API_KEY environment variable.
 */
export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'AI is not configured. Set ANTHROPIC_API_KEY in environment.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    )
  }

  let body: ChatRequest
  try {
    body = await request.json()
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid request body' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const { messages, pageContext, memory } = body

  if (!messages || !pageContext || !memory) {
    return new Response(
      JSON.stringify({ error: 'Missing required fields: messages, pageContext, memory' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // Build the system prompt with memory and page context
  const systemPrompt = buildSystemPrompt(memory, pageContext)

  // Limit conversation history to last 20 messages to control token usage
  const recentMessages = messages.slice(-20).map(m => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }))

  try {
    // Call Claude API directly with streaming
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5-20250929',
        max_tokens: 1024,
        system: systemPrompt,
        messages: recentMessages,
        stream: true,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[AI Chat] Claude API error:', response.status, errorText)
      return new Response(
        JSON.stringify({ error: 'AI service error. Please try again.' }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Stream the response using SSE format
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader()
        if (!reader) {
          controller.close()
          return
        }

        const decoder = new TextDecoder()
        let buffer = ''

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() || ''

            for (const line of lines) {
              if (!line.startsWith('data: ')) continue
              const data = line.slice(6).trim()

              if (data === '[DONE]') continue

              try {
                const event = JSON.parse(data)

                if (event.type === 'content_block_delta' && event.delta?.text) {
                  // Forward the text chunk
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ type: 'text', content: event.delta.text })}\n\n`)
                  )
                }

                if (event.type === 'message_stop') {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ type: 'done', content: '' })}\n\n`)
                  )
                }
              } catch {
                // Skip unparseable lines
              }
            }
          }

          // Final done signal
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'done', content: '' })}\n\n`)
          )
        } catch (err) {
          console.error('[AI Chat] Stream error:', err)
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'error', content: 'Stream interrupted' })}\n\n`)
          )
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (err) {
    console.error('[AI Chat] Request error:', err)
    return new Response(
      JSON.stringify({ error: 'Failed to connect to AI service.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
