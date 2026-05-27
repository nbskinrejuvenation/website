# SMS reminders (Twilio)

Optional **24-hour consultation reminders** via SMS, sent by the same daily cron as email (`/api/cron/consultation-reminders`).

## Setup

1. Create a [Twilio](https://www.twilio.com) account and buy an Australian SMS-capable number.
2. Add to `.env.local` and **Vercel**:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_FROM_NUMBER=+61412345678
```

3. Run migration `20260603_high_value_features.sql` (adds `sms_reminder_sent_at` on consultations).

## Behaviour

- Sends only when the client has a valid Australian mobile on file.
- Message includes appointment time and the **manage appointment** link when `management_token` exists.
- Email and SMS are tracked separately (`reminder_sent_at` / `sms_reminder_sent_at`).
- If Twilio is not configured, the cron continues with email only.

## Testing

Use Twilio’s trial number restrictions or a verified recipient while testing.
