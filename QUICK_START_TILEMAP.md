# ⚡ Quick Start: Professional Tilemap (30 min setup)

## 🎯 Goal
Transform your virtual workspace from basic procedural graphics to professional pixel art in under 30 minutes.

---

## Step 1: Download Tileset (5 min)

### Free Option (Recommended for Quick Start)

**Click to download**: https://opengameart.org/sites/default/files/bgtiles_2.png

**Save as**: `client\public\assets\tilesets\office-tileset.png`

**Windows Path**:
```
C:\Users\hatem\mini-gather\client\public\assets\tilesets\office-tileset.png
```

✅ **Verify**: File size should be ~50-200 KB

---

## Step 2: Install Tiled (5 min)

1. Visit: https://www.mapeditor.org/
2. Click "Download" → Choose your OS (Windows/Mac/Linux)
3. Install and launch Tiled

✅ **Verify**: Tiled opens successfully

---

## Step 3: Create Map (15 min)

### 3.1 New Map

In Tiled:
- **File** → **New** → **New Map**

Settings:
```
Orientation: Orthogonal
Tile layer format: CSV
Map size: 50 × 40 tiles
Tile size: 32 × 32 pixels
```

Click **OK**

### 3.2 Save Map

- **File** → **Save As**
- Navigate to: `C:\Users\hatem\mini-gather\client\public\assets\maps\`
- Filename: `office.json`
- Click **Save**

### 3.3 Import Tileset

- **Map** → **New Tileset**

Settings:
```
Name: office-tileset
Type: Based on Tileset Image
Source: Browse → Select office-tileset.png
Tile width: 32
Tile height: 32
☑ Embed in map  ← CRITICAL! Must check this!
```

Click **OK**

### 3.4 Create Layers

**Right-click** in Layers panel → **Add Layer**

Create these layers **in order**:

1. **New Tile Layer** → Name: `Ground`
2. **New Tile Layer** → Name: `Walls`
   - Right-click `Walls` → **Layer Properties**
   - Click **+** (Add Property)
   - Name: `collides`, Type: `bool`, Value: `true`
3. **New Tile Layer** → Name: `Furniture`
   - Right-click `Furniture` → **Layer Properties**
   - Click **+** (Add Property)
   - Name: `collides`, Type: `bool`, Value: `true`
4. **New Object Layer** → Name: `Zones`
5. **New Object Layer** → Name: `Doors`

### 3.5 Quick Design

#### Paint Ground Layer
- Select `Ground` layer
- Click a floor tile from tileset
- Click "Fill" tool (paint bucket icon)
- Fill entire map

#### Paint Walls
- Select `Walls` layer
- Click a wall tile from tileset
- Click "Draw" tool (pencil icon)
- Draw walls around perimeter and rooms

#### Paint Furniture
- Select `Furniture` layer
- Click furniture tiles (desks, chairs, tables)
- Click "Draw" tool
- Place furniture around map

#### Add a Room Zone (optional)
- Select `Zones` layer
- Click "Insert Rectangle" tool
- Draw rectangle for a meeting room
- Click rectangle → Properties panel at bottom
- **Name**: "Meeting Room"
- **Type**: `zone`
- Add custom property:
  - Name: `color`, Type: `string`, Value: `#3498db`

#### Add a Door (optional)
- Select `Doors` layer
- Click "Insert Rectangle" tool
- Draw small rectangle (32×64) for door
- Click rectangle → Properties panel
- **Name**: "door-1"
- **Type**: `door`
- Add custom properties:
  - Name: `roomId`, Type: `string`, Value: `meeting-room-1`
  - Name: `autoClose`, Type: `bool`, Value: `true`

### 3.6 Export Map

- **File** → **Export As**
- Format: **JSON map files (.json)**
- Filename: `office.json`
- Location: `C:\Users\hatem\mini-gather\client\public\assets\maps\office.json`
- ☑ **Embed tilesets** ← Must check!
- Click **Export**

✅ **Verify**: JSON file created, size ~50-500 KB

---

## Step 4: Test in Game (5 min)

### 4.1 Start Dev Server

```bash
cd C:\Users\hatem\mini-gather
npm run dev
```

### 4.2 Open Browser

Open: http://localhost:5173

### 4.3 Check Console (F12)

**Success looks like**:
```
🎮 Preloading assets...
✅ Assets preloaded (tilemap + procedural fallback)
🏗️ Creating game world...
✨ Using professional tilemap mode
✅ Wall collisions enabled
✅ Furniture collisions enabled
```

**Fallback looks like**:
```
⚠️ Failed to load: office-map - falling back to procedural graphics
🎨 Using procedural graphics mode
```

If you see fallback:
1. Check file exists: `client\public\assets\maps\office.json`
2. Check file exists: `client\public\assets\tilesets\office-tileset.png`
3. Verify tileset embedded in JSON (re-export with "Embed" checked)

---

## ✅ Success Checklist

- [ ] Tileset PNG downloaded and saved to `/assets/tilesets/`
- [ ] Tiled Map Editor installed
- [ ] Map created with 50×40 tiles, 32×32 size
- [ ] Tileset imported with "Embed in map" checked
- [ ] Layers created (Ground, Walls, Furniture)
- [ ] Collision properties set on Walls and Furniture
- [ ] Map exported to `/assets/maps/office.json`
- [ ] Game shows "✨ Using professional tilemap mode"
- [ ] Map renders with your tileset graphics

---

## 🎨 Visual Result

**Before**:
```
████████████████████████
█                      █
█   ┌──────┐          █
█   │      │          █
█   └──────┘          █
█                      █
████████████████████████
```

**After**:
```
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
🧱🪵🪵🪵🪵🪵🪵🪵🪵🪵🪵🧱
🧱🪵  ╔═══╗  🪵🪵🪵🪵🧱
🧱🪵  ║🪑💻║  🪵🪵🪵🪵🧱
🧱🪵  ╚═══╝  🪵🪵🪵🪵🧱
🧱🪵🌱        🪵🪵🪵🪵🧱
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
```

**Quality improvement**: ~10x better!

---

## 🆘 Quick Troubleshooting

### Problem: Can't find downloaded tileset
**Solution**: Check Windows Downloads folder, move to:
```
C:\Users\hatem\mini-gather\client\public\assets\tilesets\
```

### Problem: Tiled shows "tileset not found"
**Solution**: When importing, browse to exact location, then check "Embed in map"

### Problem: Map loads but looks wrong
**Solution**:
1. Verify tile size is 32×32 in both Tiled and tileset
2. Check Ground layer has tiles painted
3. Verify layer order (Ground at bottom)

### Problem: Collisions don't work
**Solution**:
1. Select Walls layer → Properties → Add `collides: true`
2. Select Furniture layer → Properties → Add `collides: true`
3. Re-export map

---

## 📚 Next Steps

### Immediate
- ✅ Completed quick setup!
- Explore map in game
- Move player around
- Verify collisions work

### This Week
- Read full guide: `TILEMAP_GUIDE.md`
- Design more detailed rooms
- Add zones and doors
- Download better tilesets

### This Month
- Download character sprites
- Add lighting effects
- Create multiple maps
- Share with team!

---

## 📖 Full Documentation

For detailed information:

- **Step-by-step**: `UPGRADE_TO_TILEMAP.md`
- **Technical guide**: `TILEMAP_GUIDE.md`
- **Asset downloads**: `client/public/assets/DOWNLOAD_ASSETS.md`
- **Overview**: `TRANSFORMATION_SUMMARY.md`

---

**Congratulations!** 🎉

You've transformed your virtual workspace to professional quality in under 30 minutes!

**Total time**: ~30 minutes
**Result**: 10x better visual quality
**Maintenance**: 5x easier customization

Need help? Check the troubleshooting section or full documentation files.
