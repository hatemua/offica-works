# 🗺️ Professional Tilemap Setup Guide

## Overview
This guide will help you create a beautiful, professional virtual workspace using **Tiled Map Editor** and **pixel art tilesets** instead of procedural graphics.

## 📥 Step 1: Download & Install Tiled

1. **Download Tiled Map Editor**
   - Visit: https://www.mapeditor.org/
   - Download version 1.10+ for your OS
   - Install and launch Tiled

## 🎨 Step 2: Get Professional Tilesets

### Option A: Free OpenGameArt Tileset (Recommended for Quick Start)
1. Download: https://opengameart.org/sites/default/files/bgtiles_2.png
2. Save as: `client/public/assets/tilesets/office-tileset.png`
3. License: CC-BY 3.0 (requires attribution)
4. Tile size: 32x32 pixels

### Option B: Premium LimeZu Modern Office (Best Quality)
1. Visit: https://limezu.itch.io/modernoffice
2. Purchase ($10-15) and download
3. Extract PNG tileset to: `client/public/assets/tilesets/modern-office.png`
4. Tile size: 16x16 pixels (can be scaled to 32x32)

### Option C: Create Custom Tileset
- Use Piskel: https://www.piskelapp.com/
- Or Aseprite: https://www.aseprite.org/
- Design 32x32 tiles in a grid layout

## 🛠️ Step 3: Create Map in Tiled

### 3.1 New Map Settings
```
File → New → New Map
┌─────────────────────────────┐
│ Orientation: Orthogonal     │
│ Tile layer format: CSV      │
│ Tile render order: Right-down│
│ Map size: 50 × 40 tiles     │
│ Tile size: 32 × 32 pixels   │
└─────────────────────────────┘
```

### 3.2 Import Tileset
```
Map → New Tileset
┌─────────────────────────────┐
│ Name: office-tileset        │
│ Type: Based on Tileset Image│
│ Source: office-tileset.png  │
│ Tile width: 32px            │
│ Tile height: 32px           │
│ Margin: 0                   │
│ Spacing: 0                  │
│ ☑ Embed in map              │  ← IMPORTANT!
└─────────────────────────────┘
```

### 3.3 Create Layers (Bottom to Top)
1. **Ground Layer** (Tile Layer)
   - Floor tiles (wood, carpet, tile, grass)
   - Fill entire map

2. **Walls Layer** (Tile Layer)
   - Wall tiles
   - Set custom property: `collides = true`

3. **Furniture Layer** (Tile Layer)
   - Desks, chairs, tables, plants
   - Set custom property: `collides = true`

4. **Decorations Layer** (Tile Layer)
   - Non-collidable decorations
   - Paintings, floor plants, rugs

5. **Doors Layer** (Object Layer)
   - Add Rectangle objects for doors
   - Set object properties:
     ```
     id: "door-meeting-1"
     type: "door"
     roomId: "meeting-room-1"
     autoClose: true
     ```

6. **Zones Layer** (Object Layer)
   - Add Rectangle objects for room zones
   - Set object properties:
     ```
     name: "Meeting Room 1"
     type: "room"
     color: "#3498db"
     ```

### 3.4 Design Your Office Layout

#### Recommended Zones:
```
┌─────────────────────────────────────────────────┐
│  🌳 Outdoor (grass)                         🌳  │
│                                                 │
│   ┌──────────┐         ┌──────────┐            │
│   │ Meeting  │         │ Meeting  │            │
│   │ Room 1   │ [door]  │ Room 2   │            │
│   │ (glass)  │         │ (glass)  │            │
│   └──────────┘         └──────────┘            │
│                                                 │
│   ┌──────────┐  ┌───────────┐  ┌──────────┐   │
│   │ Lounge   │  │  Silent   │  │ Kitchen  │   │
│   │ (carpet) │  │  Zone     │  │ (tiles)  │   │
│   │          │  │  (quiet)  │  │          │   │
│   └──────────┘  └───────────┘  └──────────┘   │
│                                                 │
│        ┌─────┐  ┌─────┐  ┌─────┐               │
│        │Bur.1│  │Bur.2│  │Bur.3│               │
│        └─────┘  └─────┘  └─────┘               │
│                                                 │
│   💼 Workspace Area (open office)              │
│   🪴                                       🪴   │
│  🌳                                         🌳  │
└─────────────────────────────────────────────────┘
```

### 3.5 Export Map
```
File → Export As...
┌─────────────────────────────┐
│ Format: JSON map files      │
│ Filename: office.json       │
│ Location: client/public/    │
│          assets/maps/       │
│ ☑ Embed tilesets            │
│ ☑ Resolve object types      │
└─────────────────────────────┘
```

## 🎮 Step 4: Integrate with Phaser 3

The tilemap will be loaded automatically by the updated `MainScene.ts`:

```typescript
preload() {
  // Load tileset image
  this.load.image('office-tiles', '/assets/tilesets/office-tileset.png');

  // Load tilemap JSON
  this.load.tilemapTiledJSON('office-map', '/assets/maps/office.json');
}

create() {
  // Create tilemap
  const map = this.make.tilemap({ key: 'office-map' });
  const tileset = map.addTilesetImage('office-tileset', 'office-tiles');

  // Create layers
  const groundLayer = map.createLayer('Ground', tileset, 0, 0);
  const wallsLayer = map.createLayer('Walls', tileset, 0, 0);
  const furnitureLayer = map.createLayer('Furniture', tileset, 0, 0);

  // Setup collision
  wallsLayer.setCollisionByProperty({ collides: true });
  furnitureLayer.setCollisionByProperty({ collides: true });
}
```

## 📊 Tileset Design Tips

### Floor Tiles (Row 1-3)
- Wood planks (light, medium, dark)
- Carpet (various colors)
- Tile floor (white, gray)
- Grass (outdoor)
- Water/pond

### Wall Tiles (Row 4-6)
- Solid walls (gray, blue)
- Glass walls (transparent)
- Doors (open, closed)
- Windows

### Furniture Tiles (Row 7-12)
- Desks (32x32, 64x32, 32x64)
- Chairs (facing 4 directions)
- Tables (various sizes)
- Plants (small, large)
- Sofas, bean bags
- Kitchen appliances

### Decorations (Row 13-15)
- Paintings, posters
- Floor lamps
- Rugs, mats
- Electronics (monitors, laptops)

## 🎨 Advanced Techniques

### Multi-tile Objects
For large furniture (2×2 or 3×2 tiles):
1. Design tiles in tileset to connect seamlessly
2. Place manually in Tiled editor
3. Mark collision on relevant tiles

### Animated Tiles
1. In Tiled: Right-click tile → Tile Animation Editor
2. Add frames with duration
3. Phaser will automatically animate

### Layers with Depth
Use layer ordering for visual depth:
```
└─ Ground (depth 0)
└─ Floor decorations (depth 1)
└─ Furniture lower (depth 2)
└─ Players (depth 10)
└─ Furniture upper (depth 11)
└─ Ceiling/overlays (depth 20)
```

## ✅ Quality Checklist

- [ ] Map size matches game config (50×40 tiles)
- [ ] All tilesets embedded in JSON
- [ ] Collision properties set on Walls & Furniture layers
- [ ] Door objects have all required properties
- [ ] Zone objects define all rooms
- [ ] No gaps in floor layer
- [ ] Outdoor areas use grass tiles
- [ ] Glass walls for meeting rooms
- [ ] Attribution for tileset in credits
- [ ] JSON file size < 200 KB

## 🐛 Common Issues

**Problem**: Tileset doesn't load in game
- ✅ Check tileset is in `/public/assets/tilesets/`
- ✅ Verify tileset name matches in Phaser code
- ✅ Ensure tileset is embedded in JSON

**Problem**: Collisions don't work
- ✅ Set `collides: true` property on layer
- ✅ Call `setCollisionByProperty({ collides: true })`
- ✅ Add collider in Phaser: `this.physics.add.collider(player, wallsLayer)`

**Problem**: Tiles appear blurry
- ✅ Add to Phaser config: `pixelArt: true`
- ✅ Set texture filter: `NEAREST` mode

**Problem**: Map too large file size
- ✅ Use CSV encoding (not Base64)
- ✅ Optimize tileset PNG with TinyPNG
- ✅ Remove unused tiles from tileset

## 📚 Resources

- **Tiled Documentation**: https://doc.mapeditor.org/
- **Phaser Tilemap Tutorial**: https://phaser.io/tutorials/making-your-first-phaser-3-game
- **Free Tilesets**: https://opengameart.org/
- **Paid Tilesets**: https://itch.io/game-assets
- **Tileset Creator**: https://www.piskelapp.com/

## 🎯 Next Steps

1. Follow Step 1-3 to create your map in Tiled
2. Export JSON to `client/public/assets/maps/office.json`
3. The code will automatically load and render your beautiful tilemap!
4. Iterate and refine your design

---

**Need Help?** The Tiled editor has extensive documentation and an active community forum for support.
