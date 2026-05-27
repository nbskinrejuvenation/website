import { CONSULTATION_DURATION_MINUTES } from '@/lib/booking/constants'
import {
  getAvailableSlotsForDuration,
  getBookingCalendarForDuration,
  resolveSlotTimes as resolveSlotTimesForDuration,
} from '@/lib/booking/availability'

export async function getAvailableSlotsForDate(dateKey: string): Promise<string[]> {
  return getAvailableSlotsForDuration(dateKey, CONSULTATION_DURATION_MINUTES)
}

export async function getBookingCalendar(): Promise<Array<{ date: string; slots: string[] }>> {
  return getBookingCalendarForDuration(CONSULTATION_DURATION_MINUTES)
}

export function resolveSlotTimes(
  dateKey: string,
  timeHHmm: string,
): { startsAt: Date; endsAt: Date } {
  return resolveSlotTimesForDuration(dateKey, timeHHmm, CONSULTATION_DURATION_MINUTES)
}
