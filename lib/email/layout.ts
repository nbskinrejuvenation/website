import { getEmailLogoUrl } from '@/lib/brand/logo'
import { CLINIC_ADDRESS_FULL } from '@/lib/site/address'
import { CLINIC_TIMEZONE } from '@/lib/booking/constants'
import { escapeHtml, getSiteUrl } from '@/lib/email/resend'

export function formatConsultationWhen(date: Date): string {
  return date.toLocaleString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: CLINIC_TIMEZONE,
  })
}

export function emailLayout(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f5f0ed;font-family:Georgia,'Times New Roman',serif;color:#2c2420;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0ed;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:560px;background:#faf7f4;border:1px solid #e8ddd6;border-radius:2px;">
        <tr><td style="padding:28px 32px 12px;text-align:center;">
          <a href="${getSiteUrl()}" style="text-decoration:none;display:inline-block;">
            <img src="${getEmailLogoUrl()}" width="112" height="112" alt="Naturally Beautiful Skin Rejuvenation" style="display:block;margin:0 auto;border:0;outline:none;text-decoration:none;max-width:112px;height:auto;" />
          </a>
        </td></tr>
        <tr><td style="padding:8px 32px 32px;font-size:15px;line-height:1.65;">
          ${body}
        </td></tr>
        <tr><td style="padding:20px 32px;border-top:1px solid #e8ddd6;font-size:12px;line-height:1.5;color:#6b5f58;text-align:center;">
          ${escapeHtml(CLINIC_ADDRESS_FULL)}<br>
          <a href="${getSiteUrl()}" style="color:#9a6b73;">nbskinrejuvenation.com.au</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}
