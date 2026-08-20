# ViewExif

Inspect, understand, and remove file metadata without sending the file to an analysis server.

## Try it online

**[Open ViewExif at www.viewexif.com](https://www.viewexif.com/)**

ViewExif is a static, browser-based toolkit for images, video, audio, and documents. It checks the real file signature, reads available metadata in a local Worker, and builds a searchable report in the current tab. There is no account, upload endpoint, cloud file history, or server-side parser.

## Main features

### View metadata

The universal [Metadata Viewer](https://www.viewexif.com/) supports 28 common file formats. It shows a readable summary and the complete native field list without hiding unfamiliar tags.

- Search and filter readable and native metadata fields
- Review EXIF, GPS, XMP, IPTC, ICC, media tags, document properties, and container data
- See SHA-256, MD5 compatibility hashes, format evidence, warnings, and a 256-byte header view
- Copy individual fields or export safe JSON and PDF reports
- Load ExifTool WebAssembly only after a file is selected

Format-specific viewers are available for [images](https://www.viewexif.com/image-metadata-viewer/), [video](https://www.viewexif.com/video-metadata-viewer/), [audio](https://www.viewexif.com/audio-metadata-viewer/), and [documents](https://www.viewexif.com/document-metadata-viewer/).

### Check image privacy

The [Image Privacy Checker](https://www.viewexif.com/image-privacy-checker/) turns hidden JPEG, PNG, and WebP fields into an explainable 0 to 100 risk score.

- Checks GPS, names, contact details, device identifiers, edit history, persistent IDs, thumbnails, and previews
- Separates file metadata from operating-system and ExifTool runtime fields
- Shows every scored field and explains why it matters
- Creates a cleaned copy, scans it again, and compares the result with the original
- Never treats a zero score as proof that the visible pixels are private

### Remove metadata

The [Metadata Remover](https://www.viewexif.com/metadata-remover/) supports the same image, video, audio, and document families as the universal viewer.

- Chooses a cleanup engine from the verified file signature, not just the extension
- Removes writable identity, location, software, date, and custom fields without deliberately transcoding the content
- Reopens and rescans the generated copy before enabling a verified download
- Reports removed, preserved, and residual metadata separately
- Produces a safe JSON cleanup receipt and keeps the original file unchanged

Dedicated removers are available for [images](https://www.viewexif.com/image-metadata-remover/), [video](https://www.viewexif.com/video-metadata-remover/), [audio](https://www.viewexif.com/audio-metadata-remover/), and [documents](https://www.viewexif.com/document-metadata-remover/).

### Verify C2PA Content Credentials

The [C2PA Viewer](https://www.viewexif.com/c2pa-viewer/) uses the official `@contentauth/c2pa-web` verifier in a local Worker.

- Validates the manifest structure, signature, and file binding
- Keeps `Valid` separate from publisher trust instead of collapsing both into one badge
- Shows validation checks, actions, ingredients, assertions, provenance, signer details, and declared watermarks
- Returns clear `Trusted`, `Valid`, `Invalid`, `No Content Credentials`, and `Unsupported` outcomes
- Exports a safe receipt without source bytes, binary resources, Blob URLs, or thumbnails

A valid C2PA signature proves that the signed credential still matches the current file. It does not prove that every visual, audio, or written claim is true.

### Read practical guides

The [ViewExif Blog](https://www.viewexif.com/blog/) answers common file privacy questions in plain English and links each problem to the relevant local tool.

## Supported formats

| Category | Metadata Viewer and Remover |
| --- | --- |
| Images | PNG, JPG/JPEG, WebP, HEIC/HEIF, TIFF, GIF |
| Video | MP4/M4V, MOV, MKV, WebM, AVI, FLV, 3GP, 3G2 |
| Audio | MP3, FLAC, OGG, OPUS, OGA, M4A, AAC, WAV, WMA |
| Documents | PDF, DOCX, PPTX, XLSX |

The Image Privacy Checker accepts JPEG, PNG, and WebP. The C2PA Viewer accepts 20 common assets across JPEG, PNG, WebP, GIF, TIFF, HEIC, HEIF, AVIF, JXL, DNG, ARW, NEF, SVG, MP4, MOV, AVI, MP3, M4A, WAV, and PDF.

## Privacy by design

- File bytes and parsed metadata stay in browser memory.
- No selected file is sent to a parsing or cleanup API.
- Clearing, replacing, or refreshing ends the task and releases temporary previews.
- Workers terminate after success, failure, timeout, cancellation, or page unmount.
- Reports exclude file bytes, Blob URLs, binary payloads, and unsafe raw values.
- Metadata values render as text rather than unsanitized HTML.
- Document readers inspect properties and package structure without extracting body text, cells, slides, attachments, or embedded scripts.
- Initial pages do not load the large ExifTool, TagLib, qpdf, or C2PA WebAssembly engines before they are needed.

The site may load normal static assets and analytics, but file names, file bytes, hashes, and parsed metadata are not added to those requests.

## How it works

1. The browser checks the file signature, container markers, size, and MIME hints.
2. A bounded local parser builds the first report without waiting for a large engine.
3. Lazy WebAssembly tools add deeper fields or perform format-specific cleanup when needed.
4. The interface normalizes, groups, searches, and safely serializes the result.
5. Cleanup flows inspect the output again and block downloads when structural checks fail.

The project uses defensive limits for archive entries, XML properties, metadata strings, decompression, field counts, image dimensions, scan budgets, and Worker timeouts.

## Technology

- [Astro](https://astro.build/) with static output
- React and TypeScript for interactive workbenches
- Web Workers for parsing, hashing, cleanup, cancellation, and stale-result isolation
- ExifReader plus bounded image and media container readers
- ExifTool WebAssembly for deep local metadata inspection
- `pdfjs-dist`, `zip.js`, and `fast-xml-parser` for PDF and OOXML properties
- TagLib-Wasm and qpdf-wasm for supported metadata cleanup paths
- MP4Box.js and `music-metadata` for media container and tag inspection
- `@contentauth/c2pa-web` for C2PA verification
- Vitest and Playwright for unit and browser testing

See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for bundled dependency notices.

## Project structure

```text
src/
  components/          Astro and React interface components
  content/             Tool copy, format configuration, and blog content
  layouts/             Shared page layouts and SEO metadata
  lib/
    c2pa/              C2PA file detection, report adapter, and verifier
    metadata/          Signature detection and format parsers
    metadata-removal/  Cleanup engines and output verification
    metadata-report/   Shared report model, exports, and field adapters
    privacy/           Evidence rules, scoring, masking, and cleanup diffs
  pages/               Statically generated routes
  styles/              Responsive editorial design system
  workers/             Worker protocols and task handlers

tests/
  unit/                Parser, report, privacy, cleanup, and export tests
  e2e/                 Real Chromium upload, download, and responsive flows
```

## Local development

Requirements:

- Node.js 22 or newer
- pnpm 11

```bash
pnpm install
pnpm dev
```

Open `http://localhost:4321`. No `.env` file or external parsing service is required.

## Test and build

```bash
pnpm test
pnpm exec playwright install chromium
pnpm exec playwright test
pnpm build
```

`pnpm build` runs Astro diagnostics, generates the static site, rebuilds the sitemap, checks canonical and structured-data output, verifies that WebAssembly stays external, and rejects files above the Cloudflare Pages 25 MiB limit.

## Deploy

The production site runs on Cloudflare Pages at **[www.viewexif.com](https://www.viewexif.com/)**.

```text
Build command: pnpm build
Build output directory: dist
Node version: 22
```

The checked-in `wrangler.jsonc` also supports Direct Upload after a clean build:

```bash
pnpm build
pnpm deploy:pages
```

For a production release, push the intentional commit to GitHub first, then run `pnpm release` from that checkout. The release command rebuilds the static site, rechecks sitemap and indexability, and uploads `dist/` to the production Pages branch.

No server runtime or application secrets are required.

## Important limits

- Metadata can be edited, forged, removed, or left stale. Treat it as context, not proof.
- The privacy score checks supported hidden fields, not faces, text, addresses, plates, reflections, or landmarks visible in pixels.
- Browser image preview support varies, especially for HEIC and TIFF. Metadata inspection can still work without a preview.
- Metadata-only cleanup preserves fields required for rendering or structure, so the verified result may report residual metadata.
- Removing metadata can invalidate C2PA credentials and document signatures.
- C2PA validation checks a signed file binding. It does not certify that the content is true.
- The toolkit processes one file at a time and keeps no cross-page history.

## Website

Use the complete hosted toolkit at **[https://www.viewexif.com/](https://www.viewexif.com/)**.
