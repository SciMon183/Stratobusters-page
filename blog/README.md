# Blog Updates

To add a new update to the website:

1. Open `blog/manifest.json`
2. Add a new entry to the `updates` array with the following format:

```json
{
  "title": "Your Update Title",
  "date": "YYYY-MM-DD",
  "content": "<p>Your HTML content here. You can use HTML tags like <h3>, <p>, <ul>, <li>, etc.</p>"
}
```

3. Save the file - the update will automatically appear on the Updates page!

## Example Update

```json
{
  "title": "Successful Test Launch",
  "date": "2024-02-01",
  "content": "<p>We successfully completed our first test launch today!</p><h3>Results</h3><ul><li>All systems operational</li><li>Data collection successful</li><li>Recovery successful</li></ul>"
}
```

**Note:** Updates are automatically sorted by date (newest first).
