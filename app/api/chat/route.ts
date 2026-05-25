import { anthropic } from '@ai-sdk/anthropic'
import { convertToModelMessages, streamText, type UIMessage } from 'ai'
import { CHAT_SYSTEM_PROMPT } from '@/lib/chat/system-prompt'

export const runtime = 'edge'

// Allow up to 30s for a full response to stream
export const maxDuration = 30

export async function POST(req: Request) {
  const body = await req.json()
  const messages: UIMessage[] = body.messages ?? []

  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response('Invalid messages payload', { status: 400 })
  }

  // Limit history sent to the model to keep costs predictable (last 20 messages)
  const recentMessages = messages.slice(-20)

  // Convert UIMessage[] → ModelMessage[] that the AI SDK understands
  const modelMessages = await convertToModelMessages(recentMessages)

  const result = streamText({
    model: anthropic('claude-haiku-4-5'),
    system: CHAT_SYSTEM_PROMPT,
    messages: modelMessages,
    maxOutputTokens: 512,
    temperature: 0.4,
  })

  // toTextStreamResponse works with TextStreamChatTransport on the client
  return result.toTextStreamResponse()
}
