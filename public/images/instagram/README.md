# Instagram section preview images (fallback)

The site can show **live posts** from Instagram when `INSTAGRAM_ACCESS_TOKEN` and `INSTAGRAM_USER_ID` are set — see **`docs/INSTAGRAM_FEED_SETUP.md`**.

If those are not configured, add static preview photos here:

| File | Used for |
|------|----------|
| `1.png` (or `.jpg` / `.webp`) | Top-left tile |
| `2.png` | Top-centre |
| `3.png` | Top-right |
| `4.png` | Bottom-left |
| `5.png` | Bottom-centre |
| `6.png` | Bottom-right |

Export 6 square images from your Instagram (or clinic photos) and name them `1.png` … `6.png`. Missing slots show a soft rose placeholder until you add files.

After adding images, restart `npm run dev` so Next.js picks them up.
