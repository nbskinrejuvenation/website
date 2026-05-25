import { anthropic } from '@ai-sdk/anthropic'
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  type UIMessage,
} from 'ai'
import { z } from 'zod'
import { CHAT_SYSTEM_PROMPT } from '@/lib/chat/system-prompt'
import { getBookingCalendar, getAvailableSlotsForDate } from '@/lib/booking/slots'
import { bookConsultation } from '@/lib/booking/create-consultation'
import { CLINIC_TIMEZONE } from '@/lib/booking/constants'

// Node.js runtime — needed for Supabase admin client, Google Calendar, and Resend
export const maxDuration = 30

function todayInSydney(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: CLINIC_TIMEZONE })
}

export async function POST(req: Request) {
  const body = await req.json()
  const messages: UIMessage[] = body.messages ?? []

  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response('Invalid messages payload', { status: 400 })
  }

  // Inject today's date so Claude can reason about "tomorrow", "Saturday", etc.
  const today = todayInSydney()
  const datePrefix = `Today's date (Sydney time): ${today}\n\n`

  const recentMessages = messages.slice(-20)
  const modelMessages = await convertToModelMessages(recentMessages)

  const result = streamText({
    model: anthropic('claude-haiku-4-5'),
    system: datePrefix + CHAT_SYSTEM_PROMPT,
    messages: modelMessages,
    maxOutputTokens: 600,
    temperature: 0.4,
    // Allow tool call → result → follow-up response (up to 5 steps)
    stopWhen: stepCountIs(5),
    tools: {
      // ── Tool 1: fetch available slots ──────────────────────────────────────
      getAvailableSlots: tool({
        description:
          'Fetch available consultation time slots. Call this when the visitor wants to book and you need to show them real availability. ' +
          'Pass a specific date (YYYY-MM-DD) if they have a preference, otherwise omit it to get the next several available days.',
        inputSchema: z.object({
          preferredDate: z
            .string()
            .optional()
            .describe(
              'Preferred date in YYYY-MM-DD format. Omit to get the next available days.',
            ),
        }),
        execute: async ({ preferredDate }) => {
          try {
            if (preferredDate) {
              const slots = await getAvailableSlotsForDate(preferredDate)
              if (slots.length === 0) {
                return {
                  available: false,
                  date: preferredDate,
                  message: `No slots available on ${preferredDate}. Please suggest another date.`,
                }
              }
              return { available: true, date: preferredDate, slots }
            }

            // No preference — return up to 5 upcoming days with availability
            const calendar = await getBookingCalendar()
            const upcoming = calendar.slice(0, 5)
            if (upcoming.length === 0) {
              return {
                available: false,
                message:
                  'No availability in the next 3 weeks. Please call the clinic directly.',
              }
            }
            return { available: true, days: upcoming }
          } catch {
            return {
              error:
                'Could not load availability right now. Please try again or call us directly.',
            }
          }
        },
      }),

      // ── Tool 2: create the booking ─────────────────────────────────────────
      createConsultation: tool({
        description:
          'Create a confirmed consultation booking. Only call this AFTER you have collected the visitor\'s full name, email, chosen date, and chosen time, ' +
          'AND have read those details back to them for confirmation. Never call this speculatively.',
        inputSchema: z.object({
          full_name: z.string().describe("Visitor's full name"),
          email: z.string().email().describe("Visitor's email address"),
          phone: z.string().optional().describe("Visitor's phone number (optional)"),
          treatment_interest: z
            .string()
            .optional()
            .describe('Treatment or concern the visitor mentioned'),
          date: z.string().describe('Booking date in YYYY-MM-DD format'),
          time: z
            .string()
            .describe(
              'Booking time in HH:mm 24-hour format (e.g. "10:00", "14:30")',
            ),
        }),
        execute: async input => {
          try {
            const result = await bookConsultation({
              ...input,
              source_page: '/chat',
            })
            return {
              success: true,
              bookingId: result.booking.id,
              clientName: result.client.full_name,
              startsAt: result.booking.starts_at,
              emailConfirmed: result.emailsSent.client,
            }
          } catch (err) {
            const message =
              err instanceof Error
                ? err.message
                : 'Booking failed. Please try again or call us directly.'
            return { success: false, error: message }
          }
        },
      }),
    },
  })

  return result.toUIMessageStreamResponse()
}
