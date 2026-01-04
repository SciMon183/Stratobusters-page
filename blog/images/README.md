# Blog Images

Place photos for your blog posts here.

## How to Use

1. **Add your images** to this `blog/images/` folder
2. **Reference them** in `blog/manifest.json`:

### Single Image:
```json
{
  "title": "My Update",
  "date": "2024-01-15",
  "image": "blog/images/my-photo.jpg",
  "content": "<p>Update text here</p>"
}
```

### Multiple Images:
```json
{
  "title": "My Update",
  "date": "2024-01-15",
  "images": [
    {
      "src": "blog/images/photo1.jpg",
      "alt": "Description",
      "caption": "Optional caption"
    },
    {
      "src": "blog/images/photo2.jpg",
      "alt": "Description 2"
    }
  ],
  "content": "<p>Update text here</p>"
}
```

## Image Tips

- **Format**: JPG, PNG, or WebP
- **Recommended size**: Max width 1200px
- **File size**: Keep under 1MB for fast loading
- **Naming**: Use descriptive names (e.g., `assembly-step1.jpg`)
- **Alt text**: Always provide alt text for accessibility

## Example Files

- `welcome.jpg` - Welcome post image
- `kickoff1.jpg` - Kickoff meeting photo
- `kickoff2.jpg` - Design sketch

Images will automatically display in your blog posts!
