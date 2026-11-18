# Nathan Lúcio Rocha — Portfolio

Static engineering portfolio and interactive local-model evaluation explorer at [nathanlcr.github.io](https://nathanlcr.github.io).

Plain HTML, CSS, and vanilla JS with zero build step and zero runtime CDN dependencies.

## Structure

- `index.html`, `style.css`, `main.js` — portfolio, case studies, and interactive `local-model-eval` explorer
- `cv.html` — printable engineering CV (`window.print()` / `@media print`)
- `assets/data/eval-results.json` — graded pass rates, 95% item-cluster bootstrap CIs, tok/s, and peak RAM exported from [`local-model-eval`](https://github.com/NathanLCR/local-model-eval)
- `assets/projects/` — application screenshots from the six featured systems

## Local preview

```bash
python3 -m http.server 8080
```

Open `http://127.0.0.1:8080`.
