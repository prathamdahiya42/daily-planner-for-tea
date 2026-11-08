# Sticker Specification & Asset Guide

This folder contains the complete sticker pack for **Our Little Room**.
All original placeholder art features a cute boy-and-girl bear pair and is designed to be easily swappable with custom artwork or animated Lottie JSON files while maintaining the identical file names and IDs.

---

### Technical Specification

| Property | Requirement |
| :--- | :--- |
| **Dimensions** | 512 x 512 pixels (`viewBox="0 0 512 512"`) |
| **Background** | Transparent (`fill="none"` or no background rect) |
| **Format** | Vector SVG (`.svg`) or Lottie JSON (`.json`) |
| **Max Size** | < 50 KB per SVG asset (optimal for rapid client caching & rendering) |
| **Color Palette** | Soft romantic pastel and warm earthy tones (Honey, Cinnamon, Peach, Blush Rose, Gold) |

---

### Mood Categories & File Naming

The pack contains **40 original stickers** split evenly across 5 moods (8 stickers each):

1. **Sweet (`sweet-01.svg` to `sweet-08.svg`)**
   - Hugs, holding paws, sharing honey, flower gifts, eskimo kisses.
2. **Silly (`silly-01.svg` to `silly-08.svg`)**
   - Wiggle dances, honey pot on head, goofy sunglasses, tickles, peek-a-boo.
3. **Sorry (`sorry-01.svg` to `sorry-08.svg`)**
   - Sad puppy eyes, band-aid hearts, single daisy, pinky promise, rain umbrella.
4. **Miss You (`missyou-01.svg` to `missyou-08.svg`)**
   - Paper cup telephone, framed partner photos, hugging pillows, same star gazing.
5. **Goodnight (`goodnight-01.svg` to `goodnight-08.svg`)**
   - Tucked in starry bed, hugging crescent moon, firefly lanterns, pyjama yawn, counting sheep.

---

### Manifest Schema (`public/stickers/manifest.json`)

```json
{
  "id": "sweet-01",
  "name": "Bear Hug",
  "file": "/stickers/sweet-01.svg",
  "mood": "sweet",
  "animated": false,
  "description": "Boy and girl bear hugging with hearts"
}
```

### Swapping In Custom Art or Lottie Animations
1. Ensure your replacement file is exported at 512x512 with a transparent background.
2. For SVG: overwrite `/public/stickers/{id}.svg`.
3. For animated Lottie JSON: place `/public/stickers/{id}.json` and update `manifest.json` with `"animated": true` and `"file": "/stickers/{id}.json"`.
