# 📥 Download Professional Assets

## 🎨 Required: Office Tileset

You need to download a professional pixel art tileset to make your virtual workspace beautiful.

### **Option 1: Free Tileset (OpenGameArt)** ⭐ Recommended

**Quick Download Link**: https://opengameart.org/sites/default/files/bgtiles_2.png

**Steps**:
1. Right-click the link above → "Save link as..."
2. Save to: `client/public/assets/tilesets/office-tileset.png`
3. **License**: CC-BY 3.0 - Add credit in your app:
   ```
   Office tiles by dude143 - opengameart.org
   ```

**What's included**:
- 32x32 pixel tiles
- Floor tiles (wood, carpet, tile)
- Wall tiles (various colors)
- Furniture (desks, chairs, tables, plants)
- Perfect for top-down office virtual workspace

---

### **Option 2: Premium Modern Office (LimeZu)** 🏆 Best Quality

**Link**: https://limezu.itch.io/modernoffice

**Price**: ~$10-15 USD

**Steps**:
1. Visit the link and purchase
2. Download the ZIP file
3. Extract `Modern_Office_32x32.png` (or 16x16 version)
4. Save to: `client/public/assets/tilesets/modern-office.png`
5. Update `MainScene.ts` to reference `modern-office.png`

**What's included**:
- Crisp, professional 16x16/32x32 tiles
- Extensive furniture variations
- Multiple floor types with beautiful patterns
- Shadows and highlights built-in
- Glass walls, modern appliances
- 500+ tiles

---

### **Option 3: Kenney Assets** 🎁 Large Collection

**Link**: https://kenney.nl/assets

**Price**: Free (CC0 license - no attribution required!)

**Recommended Packs**:
1. **RPG Urban Pack**: https://kenney.nl/assets/rpg-urban-pack
   - 480 assets
   - Modern buildings and interiors
   - Download → Extract → Copy tiles to `tilesets/kenney-urban.png`

2. **Modular Buildings**: https://kenney.nl/assets/modular-buildings
   - 100 assets
   - Building interiors
   - Download → Extract → Copy to `tilesets/kenney-buildings.png`

---

## 👤 Required: Character Sprites

Download animated character sprite sheets for professional avatars.

### **Option 1: Free Characters (OpenGameArt)**

**Link**: https://opengameart.org/content/12-characters-4-directions

**Steps**:
1. Download the sprite sheet PNG
2. Save to: `client/public/assets/sprites/characters.png`
3. **License**: Check the page for specific license

**Specifications**:
- 4-directional walk animations
- 32x32 or 48x48 pixel characters
- Multiple character designs

---

### **Option 2: Modern Pixel Characters (itch.io)**

**Search**: https://itch.io/game-assets/tag-character

**Recommended Free Packs**:
- **Pixel Adventure** by Pixel Frog (Free)
- **Top-down Character Pack** by kenny.nl
- **Office Workers Sprites** (search on itch.io)

**Steps**:
1. Download sprite sheet ZIP
2. Extract PNG files
3. Place in: `client/public/assets/sprites/avatar1.png`, `avatar2.png`, etc.
4. Ensure format: 4 rows (down, left, right, up) × 3 columns (walk frames)

---

## ⚡ Quick Setup Script

After downloading assets, verify they're in the correct location:

```bash
# Windows (PowerShell)
dir client\public\assets\tilesets\*.png
dir client\public\assets\sprites\*.png

# macOS/Linux
ls client/public/assets/tilesets/*.png
ls client/public/assets/sprites/*.png
```

**Expected output**:
```
tilesets/
  └─ office-tileset.png ✅

sprites/
  └─ characters.png ✅ (or avatar1.png, avatar2.png, etc.)
```

---

## 🗺️ Create Your Map

**After downloading the tileset**:

1. **Install Tiled Map Editor**
   - Download: https://www.mapeditor.org/
   - Version: 1.10+

2. **Follow the guide**
   - Open: `TILEMAP_GUIDE.md` in this project
   - Create your office map in Tiled
   - Export as JSON to `client/public/assets/maps/office.json`

3. **Test in game**
   ```bash
   npm run dev
   ```

---

## 🎨 Alternative: Create Your Own Tileset

### Tools:
1. **Piskel** (Free, Web-based)
   - URL: https://www.piskelapp.com/
   - Create 32×32 pixel tiles
   - Export as sprite sheet

2. **Aseprite** (Paid, Desktop)
   - URL: https://www.aseprite.org/
   - $20 - Professional pixel art tool
   - Export tileset as PNG grid

3. **GIMP** (Free, Desktop)
   - URL: https://www.gimp.org/
   - Free image editor
   - Create tiles on a grid

### Tileset Layout:
```
┌────┬────┬────┬────┬────┬────┬────┬────┐
│ Floor tiles (wood, carpet, tile, grass)  │
├────┼────┼────┼────┼────┼────┼────┼────┤
│ Wall tiles (solid, glass, doors, windows)│
├────┼────┼────┼────┼────┼────┼────┼────┤
│ Furniture (desks, chairs, tables, plants)│
├────┼────┼────┼────┼────┼────┼────┼────┤
│ Decorations (paintings, lamps, electronics)│
└────┴────┴────┴────┴────┴────┴────┴────┘
```

**Guidelines**:
- Tile size: 32×32 pixels
- Grid layout: 8 columns minimum
- No spacing between tiles
- PNG format with transparency
- Total size: < 2 MB

---

## 📊 File Size Recommendations

| Asset Type | Size | Notes |
|------------|------|-------|
| Tileset PNG | < 1 MB | Optimize with TinyPNG if needed |
| Character Sprites | < 500 KB | One file per character |
| Map JSON | < 200 KB | Export as CSV format, not Base64 |

---

## ✅ Verification Checklist

Before running the game:

- [ ] Tileset PNG file exists in `assets/tilesets/`
- [ ] File name matches code reference (e.g., `office-tileset.png`)
- [ ] Tileset is 32×32 pixel tiles
- [ ] Character sprites exist in `assets/sprites/`
- [ ] Map JSON file exported from Tiled (after creating map)
- [ ] All files < recommended size limits

---

## 🆘 Need Help?

**Can't find free assets?**
- Use OpenGameArt.org search: https://opengameart.org/art-search-advanced
- Filter by: "Top-down", "32x32", "Office" or "Modern"

**Unsure about licenses?**
- CC0: Use freely, no attribution needed
- CC-BY: Use freely, give credit to creator
- CC-BY-SA: Use freely, share modifications under same license

**Don't want to download?**
- The game currently uses procedural graphics (generated by code)
- It works but looks dated
- Download professional tilesets for 10x better visual quality!

---

## 🚀 Next Steps

1. ✅ Download tileset (Option 1 recommended for quick start)
2. ✅ Download character sprites (optional - we have procedural avatars)
3. 📖 Read `TILEMAP_GUIDE.md`
4. 🗺️ Create map in Tiled Editor
5. 🎮 Run `npm run dev` and enjoy your professional virtual workspace!
