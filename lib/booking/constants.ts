/** Clinic booking configuration */
export const CLINIC_TIMEZONE = 'Australia/Sydney'

/** Free consultation length */
export const CONSULTATION_DURATION_MINUTES = 30

/** Gap between appointments */
export const BOOKING_BUFFER_MINUTES = 15

/** How far ahead clients can book */
export const BOOKING_HORIZON_DAYS = 21

/** Earliest bookable time from now (hours) */
export const BOOKING_MIN_NOTICE_HOURS = 4

/** How long a Stripe checkout hold blocks the slot (minutes) */
export const PENDING_PAYMENT_HOLD_MINUTES = 30

/** Default slot step when generating availability */
export const SLOT_STEP_MINUTES = 30
