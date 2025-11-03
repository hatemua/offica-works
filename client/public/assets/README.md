# 🎨 Assets Directory

This directory contains all game assets (images, maps, sounds).

## 📁 Directory Structure

```
assets/
├── maps/              # Tiled map JSON files
│   └── office-map.json
├── tilesets/          # Tileset images used by maps
│   └── office-tileset.png
└── sprites/           # Individual sprites (avatars, effects)
    └── (avatar sprites)
```

## 🗺️ Maps

Place your Tiled JSON exports here:
- `office-map.json` - Main office layout

### How to Create:
1. Follow `TILEMAP_QUICK_START.md`
2. Design in Tiled Map Editor
3. Export as JSON to this folder

## 🎨 Tilesets

Place tileset PNG images here:
- `office-tileset.png` - Main office tileset (32x32 or 64x64 tiles)

### Where to Get:
- **Free**: https://kenney.nl/assets/office-pack
- **Free**: https://opengameart.org/
- **Paid**: https://itch.io/game-assets

## 👤 Sprites

Individual sprite sheets:
- Avatar sprites (optional - currently generated programmatically)
- Door sprites
- Particle effects
- UI icons

## 📝 Asset Requirements

### Tileset Image (`office-tileset.png`)
- **Format**: PNG with transparency
- **Tile Size**: 32x32 or 64x64 pixels
- **Layout**: Grid of tiles
- **Contains**:
  - Floor tiles (carpet, wood, tile)
  - Wall tiles (various styles)
  - Furniture tiles (desks, chairs, tables)
  - Door tiles (open/closed states)
  - Decoration tiles (plants, paintings, windows)

### Map File (`office-map.json`)
- **Format**: Tiled JSON export
- **Tile Size**: Must match tileset
- **Required Layers**:
  - `ground` - Floor layer
  - `walls` - Collision walls
  - `furniture` - Collision furniture
  - `decorations` - Non-collision decorations
  - `doors` - Door tiles
  - `objects` - Door objects with properties

## 🚀 Quick Start

**Don't have assets yet?**

1. **Download free office pack**:
   ```bash
   # Visit: https://kenney.nl/assets/office-pack
   # Download and extract
   # Copy tileset PNG to: assets/tilesets/office-tileset.png
   ```

2. **Create map in Tiled**:
   ```bash
   # Follow: TILEMAP_QUICK_START.md
   # Export JSON to: assets/maps/office-map.json
   ```

3. **Test in game**:
   ```bash
   cd ../../..  # Back to project root
   npm run dev
   ```

## ✅ Verification

Check that files exist:
```bash
ls -la assets/tilesets/
# Should show: office-tileset.png

ls -la assets/maps/
# Should show: office-map.json
```

## 🎮 Usage in Code

Assets are loaded in `client/src/game/scenes/MainScene.ts`:

```typescript
preload() {
  // Load tileset
  this.load.image('office-tiles', '/assets/tilesets/office-tileset.png');

  // Load map
  this.load.tilemapTiledJSON('office-map', '/assets/maps/office-map.json');
}
```

## 📊 File Size Guidelines

- **Tileset PNG**: < 1 MB (optimize with TinyPNG if needed)
- **Map JSON**: < 100 KB typically
- Keep assets optimized for web delivery

## 🎨 Asset Creation Tools

**Free Tools**:
- **Tiled**: https://www.mapeditor.org/ (Map editor)
- **Aseprite**: https://www.aseprite.org/ (Pixel art - paid but worth it)
- **Piskel**: https://www.piskelapp.com/ (Pixel art - free online)
- **GIMP**: https://www.gimp.org/ (Image editing - free)

**Online Tools**:
- **TinyPNG**: https://tinypng.com/ (Optimize PNG files)
- **Sprite Sheet Packer**: https://www.codeandweb.com/free-sprite-sheet-packer

---

**Need help?** See `TILEMAP_QUICK_START.md` for detailed guide!
