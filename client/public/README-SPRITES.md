# Avatar Sprites Guide

## Current Implementation
The avatar sprites are currently generated programmatically in code using Phaser's graphics API.

## To Add Real Pixel Art Sprites:

### Option 1: Download Free Sprites (Recommended)
1. Visit: https://pipoya.itch.io/pipoya-free-rpg-character-sprites-32x32
2. Download the free sprite pack (64 characters, 32x32, 4-way animation)
3. Extract 6 character sprite sheets
4. Rename them to: `avatar1.png`, `avatar2.png`, ... `avatar6.png`
5. Place them in `client/public/assets/sprites/`

### Option 2: Other Free Resources
- **itch.io**: https://itch.io/game-assets/tag-32x32/tag-top-down
- **OpenGameArt**: https://opengameart.org/content/32x32-rpg-character-sprites
- **CraftPix**: https://craftpix.net/freebies/

## Sprite Sheet Format Required:
- **Size**: 32x32 pixels per frame
- **Layout**: 4 rows (down, left, right, up) × 3 columns (walk cycle)
- **Format**: PNG with transparency
- **Frames**:
  - Row 0: Walking down (3 frames)
  - Row 1: Walking left (3 frames)
  - Row 2: Walking right (3 frames)
  - Row 3: Walking up (3 frames)

## After Adding Sprites:
The code will automatically detect PNG files in this folder and use them instead of the programmatically generated sprites.
