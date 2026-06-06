# Homeworks Website

Single-page website for Homeworks Property Improvements — sash window restoration and period property care, Leicestershire.

## Project structure

```
├── index.html          # Main page
├── styles.css          # All styles
├── homeworks.js        # Interactions (scroll reveals, mobile menu, form)
├── assets/
│   ├── homeworks-title.png     # Header/footer wordmark
│   ├── square-logo.png         # Favicon
│   └── JohnstonITC-Medium.otf # Brand font
└── wrangler.toml       # Cloudflare Pages config
```

## Adding photos

Image placeholders appear in the hero, sash windows, and projects sections. To swap one in, replace the `<div class="ph">...</div>` inside a `.reveal-img` with an `<img>`:

```html
<img src="assets/your-photo.jpg" alt="Description">
```

## Contact form

Form submissions are sent via [Web3Forms](https://web3forms.com). To activate:

1. Go to [web3forms.com](https://web3forms.com) and enter `info@homeworksleicester.co.uk`
2. Copy the access key from the confirmation email
3. In `index.html`, replace `YOUR_WEB3FORMS_KEY` with your key:
   ```html
   <input type="hidden" name="access_key" value="YOUR_WEB3FORMS_KEY">
   ```

## Deploying to Cloudflare Pages

```bash
npx wrangler pages deploy . --project-name homeworks-website
```

Or connect this repo in the [Cloudflare Pages dashboard](https://pages.cloudflare.com) — no build command, output directory `.`.
