# StratoBusters Website Setup Guide

## Quick Start

1. **Upload all files to your web server**
2. **Add your content:**
   - Add images to `gallery/` folder and update `gallery/manifest.json`
   - Add blog posts to `blog/manifest.json`
   - Update team information in `data/team.json`
   - Add your 3D model to `models/satellite.stl` (optional)

3. **That's it!** The website is ready to use.

## File Structure

```
Stratobusters-page/
├── index.html          # Main page with 3D model
├── about.html          # About project page
├── team.html           # Team page
├── updates.html        # Blog/updates page
├── gallery.html        # Gallery page
├── css/
│   └── style.css       # All styles (light/dark theme)
├── js/
│   ├── theme.js        # Theme switching
│   ├── navigation.js   # Mobile menu
│   ├── gallery.js      # Gallery functionality
│   ├── updates.js      # Blog loading
│   ├── team.js         # Team loading
│   └── satellite-3d.js # 3D model rendering
├── gallery/
│   ├── manifest.json   # Gallery image list
│   └── README.md       # How to add images
├── blog/
│   ├── manifest.json   # Blog posts
│   └── README.md       # How to add posts
├── data/
│   └── team.json       # Team member data
└── models/
    └── satellite.stl    # 3D model (optional)
```

## Adding Content

### Adding Gallery Images

1. Add image files to the `gallery/` folder
2. Open `gallery/manifest.json`
3. Add entries like this:

```json
{
  "src": "gallery/your-image.jpg",
  "caption": "Description"
}
```

### Adding Blog Posts

1. Open `blog/manifest.json`
2. Add a new entry:

```json
{
  "title": "Post Title",
  "date": "2024-01-15",
  "content": "<p>Your HTML content here</p>"
}
```

### Updating Team

1. Open `data/team.json`
2. Update the members array with your team information

### Adding 3D Model

1. Export your satellite model as STL format
2. Place it in `models/satellite.stl`
3. The website will automatically load it (or show a placeholder)

## Features

- ✅ **Light/Dark Theme** - Toggle in the navigation bar
- ✅ **Responsive Design** - Works on all devices
- ✅ **Auto-loading Gallery** - Just add images to folder
- ✅ **File-based Blog** - Easy to update
- ✅ **3D Model Viewer** - STL support with Three.js
- ✅ **Modern Design** - Minimalistic and tech-focused

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Customization

### Colors

Edit CSS variables in `css/style.css`:

```css
:root {
    --accent-primary: #0066ff;  /* Main accent color */
    --accent-secondary: #0052cc; /* Secondary accent */
    /* ... more variables */
}
```

### Content

All content is stored in JSON files for easy editing:
- `gallery/manifest.json` - Gallery images
- `blog/manifest.json` - Blog posts
- `data/team.json` - Team members

## Server Requirements

- Any web server (Apache, Nginx, etc.)
- No server-side processing needed (static files)
- For local testing, use a simple HTTP server (not file://)

### Local Testing

```bash
# Python
python -m http.server 8000

# Node.js
npx http-server

# PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## Troubleshooting

**3D Model not showing?**
- Check that `models/satellite.stl` exists
- The placeholder model will show if STL is not found
- Check browser console for errors

**Images not loading?**
- Verify image paths in `gallery/manifest.json`
- Check file permissions on server
- Ensure images are in the `gallery/` folder

**Theme not saving?**
- Check browser localStorage is enabled
- Clear browser cache if needed

## Need Help?

Check the README files in:
- `gallery/README.md` - Gallery instructions
- `blog/README.md` - Blog instructions
