# Homepage hero media

The hero currently plays stock footage (`public/videos/hero.mp4`) that was not
filmed at the clinic. This is a brief for replacing it with the clinic's own
material.

## How the hero picks what to show

`components/sections/HeroSection.tsx`, in order of preference:

1. **`heroImageUrls`** — two or more photos, cross-faded with a slow zoom
2. **`heroVideoUrl`** — the muted looping background video
3. **`heroImageUrl`** — a single still

All three are set in `lib/site/hero.ts`. Populating `HERO_IMAGE_URLS` with two
or more paths switches the hero to clinic photography with **no code change**,
because a slideshow outranks the video.

Anyone who has asked their browser to reduce motion always gets the single
still, never the video or the slideshow.

## Constraints the hero imposes

The headline, subheading and CTAs sit over the **left third**, under a cream
gradient running left to right. So:

| Requirement | Why |
|---|---|
| **Landscape**, min 1920px wide | It renders full-bleed at `min-h-[88vh]` |
| **Subject right of centre** | The left is covered by the gradient and text |
| **No text in the image** | It would collide with the headline |
| **Nothing important near edges** | `object-cover` crops differently per viewport |
| Calm, slow, well-lit | It loops silently behind text |

This is why the clinic's Instagram reels cannot be used directly: they are
**720x1280 portrait** with captions burned in, so they would need upscaling and
the text would clash.

## If shooting video

3 or 4 clips, 8-12 seconds each, filmed **horizontally**, phone resting on a
surface or moving very slowly. No captions, no speaking to camera (it autoplays
muted, so moving lips look broken).

Worth capturing:

1. A slow pan across the treatment room or reception
2. Hands preparing a device, or laying products out on a tray
3. A client relaxing mid-treatment, device glow visible; framing the face out of
   shot avoids needing a likeness release
4. Detail: folded towels, product bottles, the plants

Export at 1080p, then compress. Keep the final file **under about 3 MB** — the
current one is 2.1 MB, which is a reasonable ceiling for autoplaying background
video.

## If supplying photos instead

4 to 6 landscape photographs meeting the table above, dropped into
`public/images/hero/` and listed in `HERO_IMAGE_URLS`. These go through
`next/image`, so large sources are fine: they get resized and converted
automatically. Each photo holds 6.5 seconds before cross-fading.

## Poster note

`HERO_VIDEO_POSTER_URL` exists because the `<video poster>` attribute is a plain
URL and never passes through `next/image`. It previously pointed at the 2.0 MB
`hero-home.png`, so every first visit downloaded all of it before the video
painted. The JPEG beside it is the same dimensions at 263 KB. If the video is
replaced, regenerate the poster from a frame of the new clip and keep it
compressed.
