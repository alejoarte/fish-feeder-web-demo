# Fish Feeder Web Demo

Static public web demo for the Fish Feeder firmware.

## What is included

- `index.html` for the landing page
- `pages/specs.html` for LED rules and printable technical specs
- `pages/gallery.html` for the screen gallery
- `pages/simulator.html` for the interactive simulator
- `css/` for shared and print styles
- `js/data/` for screen metadata, specs data, and LED rule logic
- `js/app.js` for the landing, specs, and gallery pages
- `js/simulator.js` for the interactive simulator state machine

## Local preview

This project is framework-free and does not need npm or a build step.

You can try opening `index.html` directly, but using a lightweight local server is recommended for the most reliable browser behavior.

### Option 1: Python

From the `web-demo/` folder:

```bash
python -m http.server
```

Then open:

`http://localhost:8000`

### Option 2: VS Code / Cursor Live Server

Open the `web-demo/` folder and run Live Server on `index.html`.

## GitHub Pages deployment

1. Put the `web-demo/` contents in a GitHub repository, or move the folder into a standalone repo.
2. Keep the files static and preserve the relative paths.
3. In GitHub repository settings, enable GitHub Pages.
4. Set the publishing source to the branch root or to a `/docs` folder if you move the files there.
5. Wait for the Pages deployment to complete.
6. Verify navigation, scripts, styles, and assets from the published URL.

## Notes

- The site uses plain HTML, CSS, and JavaScript only.
- The simulator logic is client-side and data-driven.
- The content is based on the Fish Feeder firmware UI and LED behavior, but it is packaged as an isolated folder so it can be moved later.
