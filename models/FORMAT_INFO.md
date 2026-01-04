# 3D Model Format Information

## Supported Formats

### STL (Stereolithography)
- **File**: `satellite.stl`
- **Features**: Geometry only, no colors
- **Best for**: Simple geometry display
- **Usage**: Works out of the box

### PRT/PLY (Polygon File Format)
- **File**: `satellite.prt` or `satellite.ply`
- **Features**: Supports vertex colors! 🎨
- **Best for**: Colored models
- **Usage**: The website will automatically use colors from the PLY file
- **⚠️ Important**: SolidWorks PRT files need to be exported to PLY format first!
- **See**: `EXPORT_INSTRUCTIONS.md` for how to export from SolidWorks with colors

### STP (STEP)
- **File**: `satellite.stp`
- **Status**: ⚠️ Not directly supported
- **Reason**: STP files require server-side conversion
- **Solution**: Convert STP to STL or PTR using:
  - Blender (free)
  - FreeCAD (free)
  - Online converters
  - Your CAD software's export function

## How to Use

1. **Place your file** in the `models/` folder
2. **Name it correctly**:
   - `satellite.stl` for STL format
   - `satellite.ptr` for PTR format (with colors)
   - `satellite.ply` for PLY format (with colors)
3. **Select format** from the dropdown on the webpage
4. **The model will load automatically**

## Color Support

- **STL**: No color support (single color material)
- **PTR/PLY**: ✅ Full color support from file
- **STP**: Requires conversion first

## Tips

- PTR files preserve colors from your CAD software
- STL files are simpler but lose color information
- For best results with colors, use PTR/PLY format
- Make sure files are not corrupted
- Large files may take time to load
