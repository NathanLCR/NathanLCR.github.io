# Nathan Lúcio — Portfolio

Personal portfolio site for Nathan Lúcio, a backend software engineer based in Dublin, Ireland. Live at [nathanlcr.github.io](https://nathanlcr.github.io).

## Stack

- Static **HTML / CSS / vanilla JavaScript** — no build step, no framework.
- [AOS](https://github.com/michalsnik/aos) for scroll-reveal animations (loaded via CDN).
- Custom `TextScramble` effect for the hero role text.
- [Netlify Forms](https://docs.netlify.com/forms/setup/) for the contact form.
- Hosted on **GitHub Pages**.

## Structure

| File | Purpose |
|------|---------|
| `index.html` | Single-page layout: hero, about, experience, skills, projects, resume, contact. |
| `style.css` | Theme variables, layout and component styles. |
| `main.js` | Mobile nav, scroll shadow, timeline/skill reveal observers, footer year. |
| `textscramble.js` | `TextScramble` class used for the animated "ENGINEER" hero text. |
| `assets/` | Resume PDF and image assets. |
| `site.webmanifest`, `favicon*`, `apple-touch-icon.png` | PWA manifest and icons. |

## Local development

It's a static site, so any static server works. With the VS Code **Live Server** extension it serves on port `5501` (see `.vscode/settings.json`). Alternatively:

```bash
python3 -m http.server 5501
```

Then open <http://localhost:5501>.

## Deployment

Pushing to the default branch publishes automatically via GitHub Pages. The contact form is processed by Netlify (requires the site to be deployed through Netlify for form submissions to be captured).
