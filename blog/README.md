# Blog Updates

To add a new update to the website:

1. Open `blog/manifest.json`
2. Add a new entry to the `updates` array

## Basic Update (Text Only)

```json
{
  "title": "Your Update Title",
  "date": "YYYY-MM-DD",
  "content": "<p>Your HTML content here. You can use HTML tags like <h3>, <p>, <ul>, <li>, etc.</p>"
}
```

## Update with Single Image

```json
{
  "title": "Successful Test Launch",
  "date": "2024-02-01",
  "image": "blog/images/test-launch.jpg",
  "content": "<p>We successfully completed our first test launch today!</p><h3>Results</h3><ul><li>All systems operational</li><li>Data collection successful</li></ul>"
}
```

## Update with Multiple Images

```json
{
  "title": "Assembly Progress",
  "date": "2024-02-05",
  "images": [
    {
      "src": "blog/images/assembly1.jpg",
      "alt": "Assembly step 1",
      "caption": "Main body assembly"
    },
    {
      "src": "blog/images/assembly2.jpg",
      "alt": "Assembly step 2",
      "caption": "Sensor integration"
    }
  ],
  "content": "<p>Great progress on the assembly!</p>"
}
```

## Adding Images

1. Place your images in the `blog/images/` folder
2. Reference them in the manifest:
   - Single image: `"image": "blog/images/your-photo.jpg"`
   - Multiple images: Use the `images` array format above
3. Images will automatically display in the blog post

**Note:** 
- Updates are automatically sorted by date (newest first)
- Images are lazy-loaded for better performance
- Use descriptive alt text for accessibility
