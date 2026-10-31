# STARz Print Studio

A browser-based workspace with two local-first print tools:

- **Photo Pro** creates photo sheets and exports print-ready PDFs. Photo borders can be turned on or off, set to thin, medium, or thick, colored, and styled as solid, dashed, or double.
- **A5 Booklet Maker** imports PDFs, lets you select pages, and exports booklet-imposed PDFs.

## Run locally

```sh
npm install
npm run dev
```

Create a production build with:

```sh
npm run build
```

## Deploy to Render

Create a Render Static Site using the included `render.yaml`. It builds the app with `npm install && npm run build` and publishes `dist/`. Client-side routes are rewritten to `index.html`.
