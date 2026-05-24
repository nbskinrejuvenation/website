# Google Calendar setup (consultation bookings)

Each booking on `/book` creates an event in your Google Calendar and stores the client in Supabase.

## 1. Google Cloud project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project (e.g. `nbskin-booking`)
3. **APIs & Services → Enable APIs** → enable **Google Calendar API**

## 2. OAuth consent screen

1. **OAuth consent screen** → External (or Internal if Workspace)
2. Add your email as test user (while in Testing mode)
3. Scopes: add `https://www.googleapis.com/auth/calendar.events`

## 3. OAuth credentials

1. **Credentials → Create credentials → OAuth client ID**
2. Type: **Web application**
3. Authorized redirect URI (for token generation):  
   `https://developers.google.com/oauthplayground`
4. Copy **Client ID** and **Client secret**

## 4. Refresh token (one-time)

1. Open [OAuth 2.0 Playground](https://developers.google.com/oauthplayground)
2. Gear icon → tick **Use your own OAuth credentials** → paste Client ID & secret
3. Step 1: select **Calendar API v3** → `https://www.googleapis.com/auth/calendar.events`
4. **Authorize APIs** → sign in with the Google account that owns the clinic calendar
5. Step 2: **Exchange authorization code for tokens**
6. Copy the **Refresh token** (store securely — treat like a password)

## 5. Environment variables

Add to `.env.local` and **Vercel**:

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REFRESH_TOKEN=...
GOOGLE_CALENDAR_ID=primary
```

`GOOGLE_CALENDAR_ID` can be:

- `primary` — default calendar of that Google account, or  
- your full email address

## 6. Redeploy and test

Book a slot on `/book` and confirm the event appears in Google Calendar with client name and contact details in the description.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Event not created | Check Vercel logs for `[google-calendar]`; verify refresh token not expired |
| Wrong timezone | Events use `Australia/Sydney` |
| Slot still shown after book | Unique index on `starts_at` prevents duplicates; refresh `/book` |
