# 🔧 Code Integration Guide: Add Tilemap Support

## Overview

This guide shows how to add professional tilemap loading to your existing `MainScene.ts` while keeping procedural graphics as a fallback.

---

## Option 1: Automatic Tilemap Detection (Recommended)

Add tilemap loading to your existing MainScene with minimal code changes.

### Step 1: Update `preload()` Method

**File:** `client/src/game/scenes/MainScene.ts`

**Find:**
```typescript
preload() {
  // NOTE: Avatar sprites are generated programmatically in create()
  // Generate enhanced graphics (furniture, tiles, decorations)
  const graphicsGen = new GraphicsGenerator(this, GAME_CONFIG.TILE_SIZE);
  graphicsGen.generateAll();
  console.log('✅ Enhanced graphics loaded');
}
```

**Replace with:**
```typescript
preload() {
  console.log('🎮 Preloading assets...');

  // Try to load professional tilemap assets (optional)
  this.load.on('loaderror', (file: any) => {
    console.warn(`⚠️ Asset not found: ${file.key} - using procedural graphics`);
  });

  // Attempt to load tilemap (professional mode)
  this.load.tilemapTiledJSON('office-map', '/assets/maps/office.json');
  this.load.image('office-tiles', '/assets/tilesets/office-tileset.png');

  // Always generate procedural graphics as fallback
  const graphicsGen = new GraphicsGenerator(this, GAME_CONFIG.TILE_SIZE);
  graphicsGen.generateAll();
  console.log('✅ Assets preloaded');
}
```

### Step 2: Add Tilemap Properties

**File:** `client/src/game/scenes/MainScene.ts`

**Find the class properties section** (around line 18-48):

**Add these new properties:**
```typescript
// Tilemap mode (add after existing properties)
private useTilemap: boolean = false;
private tilemap?: Phaser.Tilemaps.Tilemap;
```

### Step 3: Update `create()` Method

**Find:**
```typescript
create() {
  // Create pixel art avatars programmatically
  for (let i = 1; i <= 6; i++) {
    const key = `avatar${i}`;
    if (!this.textures.exists(key)) {
      this.createPixelArtAvatar(key);
    }
  }

  // Create world bounds
  this.physics.world.setBounds(
    0,
    0,
    GAME_CONFIG.MAP_WIDTH * GAME_CONFIG.TILE_SIZE,
    GAME_CONFIG.MAP_HEIGHT * GAME_CONFIG.TILE_SIZE
  );

  // Create ground
  this.createGround();

  // Create walls
  this.createWalls();

  // Create room zones
  this.createRoomZones();

  // Create furniture
  this.createFurniture();

  // Create doors
  this.createDoors();
```

**Replace with:**
```typescript
create() {
  // Create pixel art avatars programmatically
  for (let i = 1; i <= 6; i++) {
    const key = `avatar${i}`;
    if (!this.textures.exists(key)) {
      this.createPixelArtAvatar(key);
    }
  }

  // Create world bounds
  this.physics.world.setBounds(
    0,
    0,
    GAME_CONFIG.MAP_WIDTH * GAME_CONFIG.TILE_SIZE,
    GAME_CONFIG.MAP_HEIGHT * GAME_CONFIG.TILE_SIZE
  );

  // Check if tilemap loaded successfully
  this.useTilemap = this.cache.tilemap.exists('office-map') &&
                    this.textures.exists('office-tiles');

  if (this.useTilemap) {
    console.log('✨ Using professional tilemap mode');
    this.createWorldFromTilemap();
  } else {
    console.log('🎨 Using procedural graphics (download tilesets for better quality - see UPGRADE_TO_TILEMAP.md)');
    // Create ground
    this.createGround();
    // Create walls
    this.createWalls();
    // Create room zones
    this.createRoomZones();
    // Create furniture
    this.createFurniture();
    // Create doors
    this.createDoors();
  }
```

### Step 4: Add Tilemap Loading Method

**Add this new method** anywhere after your `createDoors()` method (around line 700):

```typescript
/**
 * Create world from professional Tiled tilemap
 */
private createWorldFromTilemap() {
  const tile = GAME_CONFIG.TILE_SIZE;

  // Create tilemap
  this.tilemap = this.make.tilemap({ key: 'office-map' });
  const tileset = this.tilemap.addTilesetImage('office-tileset', 'office-tiles');

  if (!tileset) {
    console.error('❌ Failed to load tileset, falling back to procedural');
    this.useTilemap = false;
    this.createGround();
    this.createWalls();
    this.createRoomZones();
    this.createFurniture();
    this.createDoors();
    return;
  }

  // Create layers (order matters for rendering)
  const groundLayer = this.tilemap.createLayer('Ground', tileset, 0, 0);
  const wallsLayer = this.tilemap.createLayer('Walls', tileset, 0, 0);
  const furnitureLayer = this.tilemap.createLayer('Furniture', tileset, 0, 0);
  const decorationsLayer = this.tilemap.createLayer('Decorations', tileset, 0, 0);

  // Setup collision for walls and furniture
  if (wallsLayer) {
    wallsLayer.setCollisionByProperty({ collides: true });
    console.log('✅ Wall collisions enabled from tilemap');
  }

  if (furnitureLayer) {
    furnitureLayer.setCollisionByProperty({ collides: true });
    console.log('✅ Furniture collisions enabled from tilemap');
  }

  // Add player collision with tilemap layers (will be setup when player is created)
  // This is handled in createLocalPlayer() method

  // Create room zones from object layer (optional)
  const zonesLayer = this.tilemap.getObjectLayer('Zones');
  if (zonesLayer && zonesLayer.objects) {
    zonesLayer.objects.forEach((obj: any) => {
      if (obj.type === 'zone' && obj.x !== undefined && obj.y !== undefined) {
        const colorProp = obj.properties?.find((p: any) => p.name === 'color');
        const color = colorProp ? parseInt(colorProp.value.replace('#', '0x')) : 0x3498db;

        const zone = this.add.rectangle(
          obj.x + obj.width / 2,
          obj.y + obj.height / 2,
          obj.width,
          obj.height,
          color,
          0.1
        );
        zone.setStrokeStyle(2, color);
        zone.setDepth(1);
        this.roomZones.push(zone);

        // Add zone label
        const label = this.add.text(
          obj.x + obj.width / 2,
          obj.y + 20,
          obj.name || 'Room',
          {
            fontSize: '16px',
            color: '#ffffff',
            backgroundColor: '#00000080',
            padding: { x: 8, y: 4 }
          }
        );
        label.setOrigin(0.5);
        label.setDepth(2);
      }
    });
    console.log(`✅ Created ${this.roomZones.length} room zones from tilemap`);
  }

  // Create doors from object layer (optional)
  const doorsLayer = this.tilemap.getObjectLayer('Doors');
  if (doorsLayer && doorsLayer.objects) {
    doorsLayer.objects.forEach((obj: any) => {
      if (obj.type === 'door' && obj.x !== undefined && obj.y !== undefined) {
        const roomIdProp = obj.properties?.find((p: any) => p.name === 'roomId');
        const autoCloseProp = obj.properties?.find((p: any) => p.name === 'autoClose');

        const doorData: DoorData = {
          id: obj.name || `door-${obj.id}`,
          x: obj.x + obj.width / 2,
          y: obj.y + obj.height / 2,
          width: obj.width || 32,
          height: obj.height || 64,
          state: 'closed',
          roomId: roomIdProp?.value || '',
          autoClose: autoCloseProp?.value ?? true,
          autoCloseDelay: GAME_CONFIG.DOOR_AUTO_CLOSE_DELAY
        };

        const door = new Door(this, doorData);
        this.doors.push(door);
      }
    });
    console.log(`✅ Created ${this.doors.length} doors from tilemap`);
  }

  console.log('✨ Professional tilemap world created successfully!');
}
```

### Step 5: Update Player Collision

**Find the `createLocalPlayer()` method** (around line 800+):

**Find this line:**
```typescript
if (this.body) {
  const body = this.body as Phaser.Physics.Arcade.Body;
  body.setCollideWorldBounds(true);
```

**After player creation, add tilemap collision**:

**Find where collisions are set up in `createLocalPlayer()`, add:**

```typescript
// Add collision with tilemap layers (if using tilemap mode)
if (this.useTilemap && this.tilemap) {
  const wallsLayer = this.tilemap.getLayer('Walls');
  const furnitureLayer = this.tilemap.getLayer('Furniture');

  if (wallsLayer && wallsLayer.tilemapLayer) {
    this.physics.add.collider(this.localPlayer!, wallsLayer.tilemapLayer);
    console.log('✅ Player collision with tilemap walls enabled');
  }

  if (furnitureLayer && furnitureLayer.tilemapLayer) {
    this.physics.add.collider(this.localPlayer!, furnitureLayer.tilemapLayer);
    console.log('✅ Player collision with tilemap furniture enabled');
  }
}
```

---

## Step 6: Test It!

### Without Tilemap (Current State)
```bash
npm run dev
```

**Console output:**
```
🎨 Using procedural graphics (download tilesets for better quality)
```

### With Tilemap (After Creating Map)
1. Download tileset to `client/public/assets/tilesets/office-tileset.png`
2. Create map in Tiled
3. Export to `client/public/assets/maps/office.json`
4. Refresh browser

**Console output:**
```
✨ Using professional tilemap mode
✅ Wall collisions enabled from tilemap
✅ Furniture collisions enabled from tilemap
✅ Created X room zones from tilemap
✅ Created X doors from tilemap
✨ Professional tilemap world created successfully!
```

---

## Option 2: Keep Current Code (No Changes)

If you prefer to keep your current procedural graphics for now:

1. **No code changes needed**
2. When ready to upgrade, follow `UPGRADE_TO_TILEMAP.md`
3. Tilemap files are prepared and waiting in `/assets/` directories

---

## Verification Checklist

After integration:

- [ ] Code compiles without errors (`npm run build`)
- [ ] Game runs with procedural graphics (tilemap files not present)
- [ ] Console shows "Using procedural graphics" message
- [ ] After adding tilemap assets, console shows "Using professional tilemap mode"
- [ ] Player collision works with tilemap walls
- [ ] Room zones render correctly
- [ ] Doors function properly

---

## Troubleshooting

### Build Errors After Changes

**Problem**: TypeScript compilation errors

**Solution**:
- Verify all imports at top of file
- Check that `DoorData` type is imported from `@mini-gather/shared`
- Ensure no typos in method names

### Tilemap Not Loading

**Problem**: Still shows "Using procedural graphics" despite having tilemap files

**Solution**:
1. Check browser console for specific errors
2. Verify file paths:
   - `client/public/assets/maps/office.json` exists
   - `client/public/assets/tilesets/office-tileset.png` exists
3. Verify tileset is embedded in JSON (open JSON file, should contain tileset data)
4. Hard refresh browser (Ctrl+F5)

### Collision Not Working

**Problem**: Player walks through walls in tilemap mode

**Solution**:
1. Verify layers have `collides: true` custom property in Tiled
2. Check `setCollisionByProperty()` is called in code
3. Verify player collision is added after player creation

---

## Summary

**What We Did**:
- ✅ Added tilemap loading to `preload()`
- ✅ Added automatic tilemap detection
- ✅ Created `createWorldFromTilemap()` method
- ✅ Updated player collision for tilemap layers
- ✅ Kept all existing procedural code as fallback

**Result**:
- Zero breaking changes
- Automatic switching between modes
- Professional quality when tilemap assets present
- Graceful fallback to procedural graphics

**Next Steps**:
1. Test that build succeeds
2. Follow `QUICK_START_TILEMAP.md` to create your tilemap
3. Enjoy 10x better visual quality!

---

Need more details? See `UPGRADE_TO_TILEMAP.md` for the complete transformation guide.
