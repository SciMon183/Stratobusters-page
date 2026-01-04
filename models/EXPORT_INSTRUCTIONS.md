# How to Export Colored Models from SolidWorks

Your PRT file is a SolidWorks format that browsers can't read directly. You need to export it to a web-friendly format that preserves colors.

## Best Option: Export to PLY with Colors

### Method 1: Using SolidWorks (if available)
1. Open your PRT file in SolidWorks
2. Go to **File > Save As**
3. Select **PLY (*.ply)** as the file type
4. In the export options:
   - ✅ Enable **"Export Colors"** or **"Vertex Colors"**
   - ✅ Enable **"ASCII"** format (easier for web)
   - ✅ Include **"Normals"**
5. Save as `satellite.prt` (or rename to `satellite.ply`)
6. Place in the `models/` folder

### Method 2: Using Blender (Free - Recommended)
1. Download [Blender](https://www.blender.org/) (free)
2. Open Blender
3. **File > Import > STEP** (if you have STP file)
   - OR if you only have PRT: Import using a SolidWorks plugin or convert PRT to STP first
4. Your model should appear with colors
5. **File > Export > Stanford (.ply)**
6. In export settings:
   - ✅ Check **"Vertex Colors"**
   - ✅ Format: **ASCII**
   - ✅ Include **Normals**
7. Save as `satellite.ply` or `satellite.prt`
8. Place in the `models/` folder

### Method 3: Using FreeCAD (Free)
1. Download [FreeCAD](https://www.freecad.org/) (free)
2. Open FreeCAD
3. Import your STP file (File > Import)
4. Export as PLY:
   - Select the model
   - **File > Export**
   - Choose **PLY Mesh (*.ply)**
   - Enable color export if available
5. Save as `satellite.ply`

## Alternative: GLTF/GLB Format (Best for Web)

GLTF/GLB is the best format for web - it preserves colors, materials, and is optimized.

### Using Blender:
1. Import your model (STEP or convert PRT to STEP first)
2. **File > Export > glTF 2.0 (.glb/.gltf)**
3. Enable **"Export Materials"** and **"Export Colors"**
4. Save as `satellite.glb`
5. We can add GLTF support to the website if needed

## Quick Check

After exporting, open the PLY file in a text editor. It should start with:
```
ply
format ascii 1.0
element vertex [number]
property float x
property float y
property float z
property uchar red
property uchar green
property uchar blue
...
```

If you see `property uchar red/green/blue`, the colors are included! ✅

## Current Status

- ✅ **STL**: Works (but no colors)
- ⚠️ **PRT (SolidWorks)**: Needs conversion to PLY
- ✅ **PLY with colors**: Will work perfectly once exported correctly

## Need Help?

If you're having trouble exporting:
1. Try Blender - it's the most reliable for color preservation
2. Make sure to enable "Vertex Colors" or "Export Colors" in export settings
3. Use ASCII format (not binary) for easier debugging
