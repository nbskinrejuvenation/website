# Google Calendar setup (bookings)

Every free consultation (`/book`) and paid treatment booking creates an event in the clinic's Google
Calendar (`nbskinrejuvenation@gmail.com`), and busy times in that calendar are hidden from the
booking pages. Check it is working at `/api/health` (`"google_calendar": "ok"`).

## 1. Google Cloud project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project (e.g. `nbskin-booking`)
3. **APIs & Services → Enable APIs** → enable **Google Calendar API**

## 2. OAuth consent screen

1. **OAuth consent screen** → **External** (or Internal only if you use Google Workspace for `@nbskinrejuvenation.com.au`)
2. Fill app name (e.g. NB Skin Rejuvenation), support email, developer contact
3. **Scopes** → Add scopes:
   - `https://www.googleapis.com/auth/calendar.events` (create, move and delete booking events)
   - `https://www.googleapis.com/auth/calendar.readonly` (read busy times so they are not offered as slots;
     `calendar.events` alone is not accepted by the free/busy API, and the narrower `calendar.freebusy`
     is rejected by the OAuth Playground in step 4)
4. **Test users** (required while Publishing status is **Testing**):
   - Click **+ Add users**
   - Add every Google account you will sign in with, e.g. `nbskinrejuvenation@gmail.com`
   - The account used in OAuth Playground **must** be on this list
5. **Save**

### Publish the app (important)

While **Publishing status** is **Testing**, Google expires refresh tokens after **7 days**, and calendar
sync silently stops a week after setup. Click **Publish app** so the status is **In production**.

You do **not** need Google's verification for the clinic's own account: when you authorise in step 4,
Google shows a "Google hasn't verified this app" screen; click **Advanced → Go to (app name)**.

## 3. OAuth credentials

1. **Credentials → Create credentials → OAuth client ID**
2. Type: **Web application**
3. Authorized redirect URI (for token generation):  
   `https://developers.google.com/oauthplayground`
4. Copy **Client ID** and **Client secret**

## 4. Refresh token (one-time)

1. Open [OAuth 2.0 Playground](https://developers.google.com/oauthplayground)
2. Gear icon → tick **Use your own OAuth credentials** → paste Client ID & secret
3. Step 1: in the scope box, paste both scopes, separated by a space:
   `https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly`
4. **Authorize APIs** → sign in as **nbskinrejuvenation@gmail.com**
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
| **403 access_denied** / “has not completed the Google verification process” | OAuth consent screen → **Test users** → add `nbskinrejuvenation@gmail.com` (exact account you use to sign in). Wait 1–2 minutes, try again in incognito. |
| Event not created / `/api/health` shows `"google_calendar": "error"` | Refresh token expired or revoked (`invalid_grant`). Make sure the app is **In production** (see step 2), then repeat step 4 and update `GOOGLE_REFRESH_TOKEN` in Vercel |
| Busy times in Google Calendar still offered as slots | The token lacks the `calendar.readonly` scope; repeat step 4 with both scopes |
| Playground: "scope name is invalid… outside the domain of this legacy API" | Use `calendar.readonly`, not `calendar.freebusy` (the Playground only knows the older scope names) |
| Bookings made while sync was broken | They are not re-sent automatically (`google_calendar_synced = false`); add them by hand |
| Wrong timezone | Events use `Australia/Sydney` |
| Slot still shown after book | Unique index on `starts_at` prevents duplicates; refresh `/book` |
