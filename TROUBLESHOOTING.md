# Troubleshooting STL Model Loading

If your STL file isn't showing up on the webpage, follow these steps:

## Common Issues and Solutions

### 1. **Using a Web Server (IMPORTANT!)**

**Problem**: Browsers block loading local files due to security restrictions.

**Solution**: Always use a web server, never open HTML files directly (file://).

**How to run a local server:**

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (if you have http-server installed)
npx http-server

# PHP
php -S localhost:8000
```

Then open: `http://localhost:8000`

### 2. **Check File Path**

**Problem**: The file path might be incorrect.

**Solution**: 
- Make sure `models/satellite.stl` exists
- Check the path is relative to your HTML file
- The path in code is: `'models/satellite.stl'`

### 3. **Check Browser Console**

**Problem**: Errors might be hidden.

**Solution**: 
1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Look for error messages
4. The code now logs detailed information:
   - "STLLoader found, loading STL model..." = Good!
   - "✓ STL model loaded successfully!" = Success!
   - Any error messages will help identify the problem

### 4. **STL File Issues**

**Problem**: The STL file might be corrupted or invalid.

**Solution**:
- Try opening the STL file in another program (Blender, MeshLab, etc.)
- Verify the file is a valid STL format
- Check file size (very large files might take time to load)

### 5. **CORS Errors**

**Problem**: Cross-Origin Resource Sharing errors.

**Solution**:
- Make sure you're using a web server (see #1)
- If on a remote server, check server CORS settings
- Local files should work fine with a local server

### 6. **Script Loading Order**

**Problem**: Scripts might load in wrong order.

**Solution**: The scripts should load in this order:
1. Three.js
2. STLLoader.js
3. satellite-3d.js

This is already set up correctly in `index.html`.

## Debugging Steps

1. **Open browser console** (F12 → Console tab)
2. **Check for these messages:**
   - "STLLoader found, loading STL model..." = Loader is working
   - "✓ STL model loaded successfully!" = File loaded
   - Any red error messages = Problem identified

3. **Verify file exists:**
   - Check `models/satellite.stl` exists
   - Check file size (should be > 0 bytes)

4. **Test with placeholder:**
   - If STL doesn't load, you should see a placeholder 3D model
   - This confirms Three.js is working

5. **Check network tab:**
   - F12 → Network tab
   - Refresh page
   - Look for `satellite.stl` request
   - Check if it returns 200 (success) or 404 (not found)

## Still Not Working?

1. **Check the console logs** - they now provide detailed information
2. **Verify you're using a web server** (not file://)
3. **Try a different browser** (Chrome, Firefox, Edge)
4. **Check file permissions** on the server
5. **Verify STL file format** - try opening in another program

## Expected Behavior

When working correctly:
1. Page loads
2. Shows "Loading 3D Model..." spinner
3. Console shows: "STLLoader found, loading STL model..."
4. Console shows: "✓ STL model loaded successfully!"
5. 3D model appears and rotates
6. Spinner disappears

If you see the placeholder model instead, check the console for error messages.
