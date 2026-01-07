# Character Sprite Sheets

This directory is for character sprite sheets in **32x32 pixel format**.

## Current Implementation

The game currently uses **procedurally generated avatars** (created in code). They now have:
- ✅ Professional color schemes (skin, hair, shirt, pants, shoes)
- ✅ Proper anatomy (head, eyes, arms, legs, shoes)
- ✅ Walking animation (3 frames per direction)
- ✅ 4 directions (down, left, right, up)
- ✅ Black outlines for crisp pixel art look

## Optional: Use Real Sprite Sheets

To use **professional pre-made sprites** instead, download free sprite sheets and place them here:

### Recommended Free Resources:

1. **PIPOYA FREE RPG Character Sprites** (Best Option)
   - URL: https://pipoya.itch.io/pipoya-free-rpg-character-sprites-32x32
   - Format: 32x32 pixels, 4-way animation
   - License: Free for commercial/personal use
   - Download and rename 6 characters as: `avatar1.png`, `avatar2.png`, etc.

2. **OpenGameArt - Top Down 2D JRPG Characters**
   - URL: https://opengameart.org/content/top-down-2d-jrpg-32x32-characters-art-collection
   - Format: 32x32 pixels
   - License: CC-BY or GPL (check individual assets)

3. **Serial's RPG Top Down Character Pack**
   - URL: https://pixelserial.itch.io/rpg-top-down-character-asset-pack
   - Format: 32x32 pixels with idle and walking animations
   - Includes 29 characters

### Required Format:

Each sprite sheet MUST be:
- **Size**: 96×128 pixels (3 columns × 4 rows)
- **Frame size**: 32×32 pixels per frame
- **Layout**:
  ```
  Row 0 (frames 0-2):  Walk DOWN animation (3 frames)
  Row 1 (frames 3-5):  Walk LEFT animation (3 frames)
  Row 2 (frames 6-8):  Walk RIGHT animation (3 frames)
  Row 3 (frames 9-11): Walk UP animation (3 frames)
  ```

### How to Use Downloaded Sprites:

1. Download sprite sheets from any resource above
2. Ensure they match the format (96×128px, 3×4 grid, 32×32 frames)
3. Save them as: `avatar1.png`, `avatar2.png`, `avatar3.png`, `avatar4.png`, `avatar5.png`, `avatar6.png`
4. Place them in this directory (`client/public/assets/characters/`)
5. Update `MainScene.ts` preload method to use `this.load.spritesheet()` instead of `createPixelArtAvatar()`

### Example Code Change (if using PNG files):

In `MainScene.ts`, replace procedural generation with:

```typescript
preload() {
  // Load character sprite sheets (if using real PNGs)
  for (let i = 1; i <= 6; i++) {
    this.load.spritesheet(`avatar${i}`, `/assets/characters/avatar${i}.png`, {
      frameWidth: 32,
      frameHeight: 32
    });
  }
}

create() {
  // Remove the createPixelArtAvatar() calls
  // Sprites will load automatically from PNG files
}
```

## Current State

✅ Avatars are working with **improved procedural generation**
🎨 Beautiful color schemes matching WorkAdventure style
🚶 Smooth walking animations with proper character anatomy

You can continue using the procedural avatars (they look good now!) or optionally download real sprite sheets for even better quality.
