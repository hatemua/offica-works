# 🚀 Upgrade to Professional Tilemap System

## Current State
Your Mini-Gather currently uses **procedural graphics** (shapes drawn with code) which creates a basic, dated appearance.

## Target State
Upgrade to **professional pixel art tilesets** like WorkAdventure, creating a modern, beautiful virtual workspace.

---

## 📋 Complete Upgrade Checklist

### Phase 1: Download Assets (15 minutes)

#### Step 1.1: Download Tileset

**Option A - Quick Free Start** ⭐

```bash
# Download this tileset manually:
# URL: https://opengameart.org/sites/default/files/bgtiles_2.png
# Save to: client/public/assets/tilesets/office-tileset.png
```

**Option B - Premium Quality** 🏆

```bash
# Visit: https://limezu.itch.io/modernoffice
# Purchase (~$15)
# Download and extract
# Save to: client/public/assets/tilesets/modern-office.png
```

#### Step 1.2: Verify Asset Structure

```bash
# Check directories exist
ls client/public/assets/tilesets/
ls client/public/assets/maps/
ls client/public/assets/sprites/

# Expected output:
# tilesets/ (empty or with your downloaded tileset)
# maps/ (contains starter-office.json template)
# sprites/ (empty - optional character sprites)
```

---

### Phase 2: Install & Create Map in Tiled (45 minutes)

#### Step 2.1: Install Tiled Map Editor

1. Download from: https://www.mapeditor.org/
2. Install version 1.10+
3. Launch Tiled

#### Step 2.2: Create New Map

**File → New → New Map**

```
Settings:
┌────────────────────────────────┐
│ Orientation: Orthogonal        │
│ Tile layer format: CSV         │
│ Tile render order: Right-down  │
│ Map size: 50 tiles × 40 tiles  │
│ Tile size: 32px × 32px         │
└────────────────────────────────┘
```

Click **Save As** → `client/public/assets/maps/office.json`

#### Step 2.3: Import Your Tileset

**Map → New Tileset**

```
Settings:
┌────────────────────────────────┐
│ Name: office-tileset           │
│ Type: Based on Tileset Image   │
│ Source: Browse to your PNG     │
│        (office-tileset.png)    │
│ Tile width: 32                 │
│ Tile height: 32                │
│ Margin: 0                      │
│ Spacing: 0                     │
│ ☑ Embed in map                 │  ← CRITICAL!
└────────────────────────────────┘
```

#### Step 2.4: Create Layers

**Create these layers in order** (bottom to top):

1. **Tile Layer: "Ground"**
   - Paint floor tiles across entire map
   - Use different tiles for: office areas, meeting rooms, lounge, kitchen, outdoor grass

2. **Tile Layer: "Walls"**
   - Paint wall tiles for room boundaries
   - Right-click layer → **Layer Properties** → **Custom Properties**
   - Add: `collides` (bool) = `true`

3. **Tile Layer: "Furniture"**
   - Paint furniture tiles (desks, chairs, tables, plants)
   - Right-click layer → **Layer Properties** → **Custom Properties**
   - Add: `collides` (bool) = `true`

4. **Tile Layer: "Decorations"** (optional)
   - Paint non-collidable decorations (rugs, paintings, floor lamps)
   - No collision property needed

5. **Object Layer: "Zones"**
   - Click "Insert Rectangle" tool
   - Draw rectangles for each room zone
   - For each rectangle:
     - Name: "Meeting Room 1", "Lounge", etc.
     - Type: `zone`
     - Custom Properties:
       - `color` (string) = `#3498db`
       - `type` (string) = `room`

6. **Object Layer: "Doors"**
   - Click "Insert Rectangle" tool
   - Draw small rectangles (32×64) for door locations
   - For each door:
     - Name: "door-meeting-1", "door-bureau-1", etc.
     - Type: `door`
     - Custom Properties:
       - `roomId` (string) = "meeting-room-1"
       - `autoClose` (bool) = `true`

#### Step 2.5: Design Your Layout

**Recommended office layout:**

```
🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲
🌲  ╔════════╗         ╔════════╗        🌲
🌲  ║ Meeting║ 🚪      ║ Meeting║        🌲
🌲  ║ Room 1 ║         ║ Room 2 ║        🌲
🌲  ╚════════╝         ╚════════╝        🌲
🌲                                       🌲
🌲  ┌────────┐  ┌──────────┐  ┌───────┐ 🌲
🌲  │ Lounge │  │  Silent  │  │Kitchen│ 🌲
🌲  │        │  │   Zone   │  │       │ 🌲
🌲  └────────┘  └──────────┘  └───────┘ 🌲
🌲                                       🌲
🌲     ┌───┐    ┌───┐    ┌───┐          🌲
🌲     │B1 │    │B2 │    │B3 │  Bureaux 🌲
🌲     └───┘    └───┘    └───┘          🌲
🌲                                       🌲
🌲      💼 Workspace Area 💼             🌲
🌲  🪴                            🪴     🌲
🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲
```

#### Step 2.6: Export Map

**File → Export As**

```
Settings:
┌────────────────────────────────┐
│ Format: JSON map files (.json) │
│ File name: office.json         │
│ Location: client/public/assets/│
│           maps/office.json     │
│ ☑ Embed tilesets               │
│ ☑ Resolve object types and     │
│   properties                   │
└────────────────────────────────┘
```

Click **Export**

---

### Phase 3: Update Game Code (30 minutes)

#### Step 3.1: Update Phaser Config for Pixel Art

**Edit:** `client/src/game/config.ts` (or wherever your Phaser config is)

```typescript
export const gameConfig: Phaser.Types.Core.GameConfig = {
  // ... existing config
  render: {
    pixelArt: true,  // ← Add this for crisp pixel art
    antialias: false,
    roundPixels: true
  }
};
```

#### Step 3.2: Test Tilemap Loading

The updated `MainScene.ts` already supports tilemap loading with automatic fallback.

**Just run:**

```bash
npm run dev
```

**Expected Console Output:**

```
🎮 Preloading assets...
✅ Assets preloaded (tilemap + procedural fallback)
🏗️ Creating game world...
✨ Using professional tilemap mode
✅ Wall collisions enabled
✅ Furniture collisions enabled
✅ Created 5 room zones from tilemap
✅ Created 3 doors from tilemap
✅ Game world created successfully
```

#### Step 3.3: Verify It Works

1. Open browser: http://localhost:5173
2. Login/Register
3. Check that:
   - ✅ Map renders with your tileset graphics
   - ✅ Walls have collision
   - ✅ Furniture has collision
   - ✅ Room zones are visible with labels
   - ✅ Doors work with E key
   - ✅ Players can move around

---

### Phase 4: Optional Enhancements (1-2 hours)

#### 4.1: Add Professional Character Sprites

**Download character sprite sheets:**

1. Visit: https://opengameart.org/ or https://itch.io/game-assets/tag-character
2. Download 32×32 character sprites with 4-directional walk animations
3. Save to: `client/public/assets/sprites/avatar1.png`, `avatar2.png`, etc.
4. Format required: 4 rows (down, left, right, up) × 3 columns (walk frames)

**Update preload in MainScene.ts:**

```typescript
preload() {
  // ... existing tilemap loading

  // Load character sprites
  this.load.spritesheet('avatar1', '/assets/sprites/avatar1.png', {
    frameWidth: 32,
    frameHeight: 32
  });
  // Repeat for avatar2, avatar3, etc.
}
```

#### 4.2: Add Animated Tiles

In Tiled Editor:

1. Select a tile (e.g., water or plant)
2. Right-click → **Tile Animation Editor**
3. Add frames with duration (e.g., 500ms each)
4. Phaser will automatically animate these tiles!

#### 4.3: Add Lighting Effects

```typescript
// In MainScene create() method
this.lights.enable();
this.lights.setAmbientColor(0xCCCCCC);

// Add point light that follows player
const playerLight = this.lights.addLight(
  player.x,
  player.y,
  200 // radius
);

// Update in update() method
if (this.localPlayer) {
  playerLight.setPosition(this.localPlayer.x, this.localPlayer.y);
}
```

#### 4.4: Add Minimap

```typescript
// In create() method
const minimap = this.cameras.add(
  10,  // x
  10,  // y
  200, // width
  150  // height
);
minimap.setZoom(0.2);
minimap.setBounds(0, 0, mapWidth, mapHeight);
minimap.setBackgroundColor(0x000000);
minimap.setAlpha(0.7);
```

---

## 🎯 Success Criteria

Your upgrade is complete when:

- ✅ Tiled Editor installed and working
- ✅ Tileset downloaded and saved to `/assets/tilesets/`
- ✅ Map created in Tiled with all layers
- ✅ Map exported as JSON to `/assets/maps/office.json`
- ✅ Game loads tilemap successfully (console shows "Using professional tilemap mode")
- ✅ Visual quality dramatically improved (pixel art vs. procedural shapes)
- ✅ All collisions working (walls, furniture)
- ✅ Room zones and doors functional
- ✅ Players can move and interact

---

## 🆘 Troubleshooting

### Problem: "Using procedural graphics mode" (tilemap not loading)

**Solutions:**
1. Check file exists: `client/public/assets/maps/office.json`
2. Check file exists: `client/public/assets/tilesets/office-tileset.png`
3. Verify tileset is **embedded** in JSON (open JSON, should contain embedded tileset data)
4. Check browser console for specific error messages
5. Verify tileset image path in JSON matches actual file location

### Problem: Tiles render but are blurry

**Solution:**
```typescript
// Add to Phaser config
render: {
  pixelArt: true,
  antialias: false,
  roundPixels: true
}
```

### Problem: Collisions don't work

**Solutions:**
1. In Tiled: Verify layer has `collides: true` custom property
2. In code: Verify `setCollisionByProperty({ collides: true })` is called
3. Verify player has collision enabled: `this.physics.add.collider(player, layer)`

### Problem: Map looks wrong/broken

**Solutions:**
1. Re-export from Tiled with "Embed tilesets" checked
2. Verify tile size is 32×32 in both Tiled and Phaser
3. Check layer order (Ground → Walls → Furniture → Decorations)
4. Verify CSV format (not Base64) in export settings

### Problem: Doors/Zones don't appear

**Solutions:**
1. Verify object layers are named exactly "Doors" and "Zones"
2. Check objects have correct type: "door" or "zone"
3. Verify objects have required custom properties
4. Check browser console for object loading errors

---

## 📊 Before & After Comparison

### Before (Procedural Graphics)
- ❌ Basic colored rectangles
- ❌ Simple gradient floors
- ❌ No texture variation
- ❌ Dated "5 years ago" appearance
- ❌ Hard to customize (requires code changes)

### After (Professional Tilesets)
- ✅ Beautiful pixel art graphics
- ✅ Rich texture variation
- ✅ Professional, modern appearance
- ✅ Matches WorkAdventure quality
- ✅ Easy to customize (edit map in Tiled GUI)
- ✅ Industry-standard workflow

---

## 🎓 Learning Resources

- **Tiled Documentation**: https://doc.mapeditor.org/en/stable/
- **Phaser Tilemap Guide**: https://phaser.io/tutorials/making-your-first-phaser-3-game
- **Free Tilesets**: https://opengameart.org/
- **Paid Tilesets**: https://itch.io/game-assets
- **Pixel Art Tutorial**: https://www.piskelapp.com/

---

## 📝 Next Steps After Upgrade

1. **Customize your map** - Add more rooms, decorations, outdoor areas
2. **Add more tilesets** - Download multiple tileset packs for variety
3. **Create themed areas** - Conference rooms, cafeteria, game room, etc.
4. **Add character variety** - Download multiple character sprite packs
5. **Implement map switching** - Allow users to teleport between different maps
6. **Share your workspace** - Deploy and invite team members!

---

## ⏱️ Time Estimate

- **Phase 1** (Download assets): 15 minutes
- **Phase 2** (Create map in Tiled): 45 minutes
- **Phase 3** (Test integration): 30 minutes
- **Phase 4** (Optional enhancements): 1-2 hours

**Total**: ~1.5 - 3 hours depending on complexity

---

**Ready to get started?** Follow Phase 1 to download your first tileset! 🚀
