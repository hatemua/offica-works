# 🎨 Beautiful Office Tilemap - Quick Start Guide

This guide will help you create a beautiful pixel-art office in 30-60 minutes using free assets and Tiled.

## 📦 Step 1: Get Free Assets (5 minutes)

### Option A: Kenney Office Pack (Recommended - Easiest)
1. Visit: https://kenney.nl/assets/office-pack
2. Click "Download" (completely free, no signup)
3. Extract the ZIP file
4. Use the files from `PNG/Default (64x64)/` folder

### Option B: Modern Interiors (More Detailed)
1. Visit: https://limezu.itch.io/moderninteriors
2. Download the free version
3. Extract and find the tileset image

### Option C: Use Placeholder (Start Immediately)
If you want to start NOW without downloading:
- Use simple colored rectangles in Tiled
- Replace with real assets later
- Skip to Step 2

## 🛠️ Step 2: Install Tiled (5 minutes)

1. **Download Tiled Map Editor**:
   - Visit: https://www.mapeditor.org/
   - Click "Download" for your OS (Windows/Mac/Linux)
   - Install the application

2. **Launch Tiled** and get familiar:
   - File → New → New Map
   - Click around to see the interface

## 🗺️ Step 3: Create Your Office Map (20-30 minutes)

### Create New Map

1. **File → New → New Map**
2. **Settings**:
   ```
   Orientation: Orthogonal
   Tile layer format: CSV
   Tile render order: Right Down
   Map size:
     - Width: 50 tiles
     - Height: 40 tiles
   Tile size:
     - Width: 32 px
     - Height: 32 px
   ```
3. Click "Save As" → `C:\Users\hatem\mini-gather\client\public\assets\maps\office-map.json`

### Add Your Tileset

1. **Map → New Tileset**
2. **Settings**:
   ```
   Name: office-tileset
   Type: Based on Tileset Image
   Source: [Browse to your downloaded tileset PNG]
   Tile width: 32 px (or 64 if using Kenney)
   Tile height: 32 px (or 64 if using Kenney)
   ```
3. Click "OK"

**Note**: If using 64x64 Kenney tiles, set both Map tile size and Tileset tile size to 64px.

### Create Layers (Bottom to Top)

Create these layers in order (Layer → New → Tile Layer):

1. **ground** - Floor tiles (carpet, wood, tile)
2. **walls** - Walls, barriers (will have collision)
3. **furniture** - Desks, chairs, tables (will have collision)
4. **decorations** - Plants, paintings, monitors (no collision)
5. **doors** - Door tiles (special collision)

Also create:
- **objects** (Layer → New → Object Layer) - For door positions and room bounds

### Draw Your Office

#### Ground Layer (Active)
- Select ground layer
- Click floor tiles from tileset
- Fill entire map with floor tiles
- Use different colors for different areas:
  - Gray carpet for corridors
  - Blue carpet for meeting rooms
  - Wood floor for offices

#### Walls Layer
- Select walls layer
- Draw outer boundary walls
- Draw room dividers
- Leave gaps for doors (2 tiles wide)
- **Important**: Right-click wall tiles → Tile Properties → Add Custom Property:
  - Name: `collides`
  - Type: `bool`
  - Value: `true` ✓

#### Furniture Layer
- Add desks (conference tables in meeting rooms)
- Add chairs around tables
- Add filing cabinets
- Add reception desk
- **Set collision same as walls**: Property `collides = true`

#### Decorations Layer
- Add plants (corners, hallways)
- Add computer monitors on desks
- Add paintings on walls
- Add windows (if tileset has them)
- **No collision** - don't add collides property

#### Doors Layer
- Place door tiles where you left gaps in walls
- Doors will be interactive, collision controlled by code

### Simple Office Layout Example

```
+================================================+
|                 RECEPTION                      |
|    [Desk]                [Plant]      [Plant]  |
+--------+----------+---------------------------+
| Meeting|          |                            |
| Room A |          |        MAIN CORRIDOR       |
|        |          |                            |
| [Table]|   Door   |   [Sofa]    [Coffee]      |
|[Chairs]|          |                            |
+--------+----------+-------+--------------------+
|                           |  Small Office 1    |
| Meeting Room B            |  [Desk] [Chair]    |
| [Conference Table]   Door |  [Cabinet]         |
| [Chairs x8]               |                    |
|                           +--------------------+
+---------------------------+  Small Office 2    |
| Bureau                    |  [Desk] [Chair]    |
| [Executive Desk]     Door |                    |
| [Bookshelf] [Plant]       |                    |
+===========================+====================+
```

### Add Door Objects

1. **Select "objects" layer**
2. **Insert Rectangle** (toolbar or press R)
3. **Draw rectangle where each door is**
4. **For each door rectangle**, right-click → Object Properties:
   ```
   Name: door-meeting-1 (unique ID)
   Type: door
   Custom Properties:
     - roomId: meeting-room-1 (string)
     - state: closed (string)
     - autoClose: true (bool)
   ```
5. Repeat for all doors (you'll need 5-8 doors typically)

### Add Room Boundary Objects (Optional but Helpful)

1. Still in "objects" layer
2. **Insert Rectangle** for each room
3. Draw around the entire room area
4. **Properties**:
   ```
   Name: meeting-room-1
   Type: room
   Custom Properties:
     - roomType: meeting (string)
     - capacity: 20 (int)
     - videoMode: all (string)
   ```

## 💾 Step 4: Export Map (2 minutes)

1. **File → Save** (save the .tmx file for later editing)
2. **File → Export As** → Choose "JSON map files (*.tmj *.json)"
3. Save to: `C:\Users\hatem\mini-gather\client\public\assets\maps\office-map.json`

**Important**: Every time you make changes, re-export to JSON!

## 📁 Step 5: Copy Assets to Project (2 minutes)

```bash
# Create directories if they don't exist
mkdir -p client/public/assets/tilesets
mkdir -p client/public/assets/maps

# Copy your tileset image
# From your downloads to: client/public/assets/tilesets/office-tileset.png

# Your exported JSON should already be in:
# client/public/assets/maps/office-map.json
```

## ✅ Verification Checklist

Before moving to code:
- [ ] `office-map.json` exists in `client/public/assets/maps/`
- [ ] `office-tileset.png` exists in `client/public/assets/tilesets/`
- [ ] Map has these layers: ground, walls, furniture, decorations, doors
- [ ] Walls have `collides: true` property
- [ ] Furniture has `collides: true` property
- [ ] At least 2-3 doors created as objects
- [ ] Doors have proper properties (roomId, state, autoClose)

## 🎮 Step 6: Load in Phaser (Code Integration)

Now that your map is ready, you need to load it in the game.

**File to edit**: `client/src/game/scenes/MainScene.ts`

### Add to `preload()` method:

```typescript
preload() {
  // Load tileset image
  this.load.image('office-tiles', '/assets/tilesets/office-tileset.png');

  // Load tilemap JSON
  this.load.tilemapTiledJSON('office-map', '/assets/maps/office-map.json');

  // ... keep existing avatar loading code ...
}
```

### Replace `create()` ground/wall creation:

Find this code block in `create()`:
```typescript
// Create ground
this.createGround();

// Create walls
this.createWalls();
```

Replace with:
```typescript
// Load and create tilemap
this.createTilemap();
```

### Add new `createTilemap()` method:

```typescript
private createTilemap(): void {
  // Create the tilemap
  const map = this.make.tilemap({ key: 'office-map' });

  // Add tileset (name in Tiled must match 'office-tileset')
  const tileset = map.addTilesetImage('office-tileset', 'office-tiles');

  if (!tileset) {
    console.error('Failed to load tileset. Check that:');
    console.error('1. Tileset name in Tiled matches "office-tileset"');
    console.error('2. Image file exists at /assets/tilesets/office-tileset.png');
    return;
  }

  // Create layers in order (bottom to top)
  const groundLayer = map.createLayer('ground', tileset, 0, 0);
  const wallsLayer = map.createLayer('walls', tileset, 0, 0);
  const furnitureLayer = map.createLayer('furniture', tileset, 0, 0);
  const decorationsLayer = map.createLayer('decorations', tileset, 0, 0);
  const doorsLayer = map.createLayer('doors', tileset, 0, 0);

  // Set collision for walls and furniture
  if (wallsLayer) {
    wallsLayer.setCollisionByProperty({ collides: true });
  }

  if (furnitureLayer) {
    furnitureLayer.setCollisionByProperty({ collides: true });
  }

  // Doors will be handled separately (interactive)
  if (doorsLayer) {
    doorsLayer.setCollisionByProperty({ collides: true });
  }

  // Store layers for later use
  this.wallsLayer = wallsLayer;
  this.furnitureLayer = furnitureLayer;
  this.doorsLayer = doorsLayer;

  console.log('✅ Tilemap loaded successfully');
  console.log(`Map size: ${map.width}x${map.height} tiles`);
  console.log(`Tile size: ${map.tileWidth}x${map.tileHeight}px`);
}
```

### Add collision with player (in `create()` after player creation):

```typescript
// After: this.localPlayer = new Player(...)

// Add collision between player and environment
if (this.wallsLayer) {
  this.physics.add.collider(this.localPlayer, this.wallsLayer);
}

if (this.furnitureLayer) {
  this.physics.add.collider(this.localPlayer, this.furnitureLayer);
}

// Doors collision will be handled by Door entities (later)
```

### Add class properties at the top:

```typescript
export class MainScene extends Phaser.Scene {
  // Add these new properties
  private wallsLayer?: Phaser.Tilemaps.TilemapLayer;
  private furnitureLayer?: Phaser.Tilemaps.TilemapLayer;
  private doorsLayer?: Phaser.Tilemaps.TilemapLayer;

  // ... existing properties ...
}
```

## 🧪 Test Your Map

1. **Build the project**:
   ```bash
   cd client
   npm run build
   ```

2. **Start dev server**:
   ```bash
   npm run dev
   ```

3. **Open browser**: http://localhost:5173

4. **What you should see**:
   - ✅ Beautiful office layout with your tiles
   - ✅ Player spawns in the map
   - ✅ Player can move with WASD/Arrows
   - ✅ Player collides with walls (can't walk through)
   - ✅ Player collides with furniture (desks/tables block movement)
   - ✅ Console shows "Tilemap loaded successfully"

## 🐛 Troubleshooting

### Problem: Black screen / Map doesn't show
**Solution**:
- Check browser console for errors
- Verify files exist:
  - `client/public/assets/tilesets/office-tileset.png`
  - `client/public/assets/maps/office-map.json`
- Check tileset name in Tiled matches `office-tileset`

### Problem: "Failed to load tileset"
**Solution**:
- In Tiled, check Map → Tileset Properties → Name
- Must be exactly `office-tileset`
- Re-export JSON after fixing

### Problem: Player walks through walls
**Solution**:
- In Tiled, select walls layer
- Select wall tiles → Right-click → Tile Properties
- Add property: `collides = true` (boolean)
- Re-export JSON

### Problem: Map too small/large
**Solution**:
- Adjust `GAME_CONFIG.MAP_WIDTH` and `MAP_HEIGHT` in:
  `shared/src/constants/game.constants.ts`
- Or adjust map size in Tiled: Map → Resize Map

### Problem: Tiles look blurry
**Solution**:
Add to `create()`:
```typescript
this.cameras.main.setRoundPixels(true); // Crisp pixels
```

## 🎉 Success!

You now have a beautiful office environment!

**Next steps**:
1. Continue with Phase 2: Implement doors (see `GAME_TRANSFORMATION_GUIDE.md`)
2. Add more decorations in Tiled
3. Refine room layouts
4. Add more furniture

## 📚 Additional Resources

- **Tiled Documentation**: https://doc.mapeditor.org/en/stable/
- **Phaser Tilemap Tutorial**: https://phaser.io/tutorials/making-your-first-phaser-3-game
- **Free Assets**:
  - Kenney: https://kenney.nl/assets
  - OpenGameArt: https://opengameart.org/
  - Itch.io: https://itch.io/game-assets/free

## 💡 Pro Tips

1. **Use layers wisely**: Keep collision objects on separate layers
2. **Tile properties**: Use custom properties for special behaviors
3. **Test frequently**: Export and test in game often
4. **Keep backups**: Save .tmx file before major changes
5. **Iterate**: Start simple, add detail gradually

---

**Time spent so far**: ~45 minutes
**Result**: Beautiful, collision-working office environment! 🎨✨

Continue to `GAME_TRANSFORMATION_GUIDE.md` Step 3 for doors and video!
