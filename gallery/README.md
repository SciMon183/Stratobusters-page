# Gallery

To add new photos to the gallery:

1. Add your image files to this `gallery/` folder
2. Open `gallery/manifest.json`
3. Add a new entry to the `images` array:

```json
{
  "src": "gallery/your-image.jpg",
  "caption": "Description of the photo"
}
```

4. Save the file - the image will automatically appear in the gallery!

## Supported Image Formats
- JPG/JPEG
- PNG
- WebP

## Tips
- Use descriptive filenames
- Optimize images for web (recommended max width: 2000px)
- Add meaningful captions to help visitors understand the photos
