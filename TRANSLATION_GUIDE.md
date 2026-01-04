# Translation Guide - Simple Instructions

This guide explains how to add English and Polish translations to your website.

## How Translation Works

The website supports two languages: **English (EN)** and **Polish (PL)**. Users can switch languages using the language selector in the navigation bar.

## Adding Translations

### 1. For Static Content (HTML Pages)

Add the `data-translate` attribute to any element you want to translate:

```html
<h1 data-translate="about.title">O naszym projekcie</h1>
<p data-translate="about.missionText">Your text here...</p>
```

Then add translations in `js/translations.js`:

```javascript
const translations = {
    en: {
        about: {
            title: "About the Project",
            missionText: "Your English text here..."
        }
    },
    pl: {
        about: {
            title: "O naszym projekcie",
            missionText: "Twój polski tekst tutaj..."
        }
    }
};
```

### 2. For Blog Posts (blog/manifest.json)

You can add bilingual blog posts in two ways:

#### Option A: Separate fields for each language (Recommended)

```json
{
  "updates": [
    {
      "title": "English Title",
      "title_pl": "Polski tytuł",
      "date": "2024-01-15",
      "content": "<p>English content here...</p>",
      "content_pl": "<p>Polski treść tutaj...</p>",
      "image": "blog/images/photo.jpg"
    }
  ]
}
```

#### Option B: Single field (shows same in both languages)

```json
{
  "updates": [
    {
      "title": "Same Title in Both Languages",
      "date": "2024-01-15",
      "content": "<p>Same content in both languages...</p>",
      "image": "blog/images/photo.jpg"
    }
  ]
}
```

**Fields that support bilingual content:**
- `title` / `title_en` / `title_pl`
- `content` / `content_en` / `content_pl`

### 3. For Team Members (data/team.json)

Add bilingual team information:

```json
{
  "members": [
    {
      "name": "John Doe",
      "name_pl": "Jan Kowalski",
      "role": "Project Lead",
      "role_pl": "Kierownik Projektu",
      "bio": "English bio text here...",
      "bio_pl": "Polski opis tutaj...",
      "image": "images/team/john.jpg"
    }
  ]
}
```

**Fields that support bilingual content:**
- `name` / `name_en` / `name_pl`
- `role` / `role_en` / `role_pl`
- `bio` / `bio_en` / `bio_pl`

Note: The `_en` suffix is optional. If not provided, the base field (e.g., `name`) is used for English.

## Quick Examples

### Example 1: Adding a new section translation

1. In your HTML file:
```html
<h2 data-translate="about.goalsTitle">Our Goals</h2>
```

2. In `js/translations.js`, add to both `en` and `pl` objects:
```javascript
en: {
    about: {
        goalsTitle: "Our Goals"
    }
},
pl: {
    about: {
        goalsTitle: "Nasze cele"
    }
}
```

### Example 2: Adding a bilingual blog post

Edit `blog/manifest.json`:

```json
{
  "updates": [
    {
      "title": "New Update!",
      "title_pl": "Nowa aktualność!",
      "date": "2024-01-20",
      "content": "<p>This is the English version of our update.</p>",
      "content_pl": "<p>To jest polska wersja naszej aktualności.</p>"
    }
  ]
}
```

### Example 3: Adding a bilingual team member

Edit `data/team.json`:

```json
{
  "members": [
    {
      "name": "Jane Smith",
      "name_pl": "Janina Kowalska",
      "role": "Software Developer",
      "role_pl": "Programistka",
      "bio": "Develops software for the project.",
      "bio_pl": "Programuje oprogramowanie dla projektu.",
      "image": "images/team/jane.jpg"
    }
  ]
}
```

## Tips

- **Keep it simple**: If content is the same in both languages, you only need one field (e.g., just `title` instead of `title_en` and `title_pl`).
- **Test both languages**: After adding translations, switch between languages using the selector to verify everything works.
- **HTML in blog content**: You can use HTML tags in blog post `content` fields for formatting.
- **Missing translations**: If a translation is missing, the system will show the key or fallback text.

## File Locations

- **Translation system**: `js/translations.js`
- **Blog posts**: `blog/manifest.json`
- **Team members**: `data/team.json`
- **HTML files**: All `.html` files in the root directory
