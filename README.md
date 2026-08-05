# Metadata Privacy Toolkit

MetadataView is a static, English-language toolkit for inspecting and removing hidden file metadata in the browser. Files stay in the active tab: there is no server parser, upload endpoint, account, database, cloud storage, or file history.

The MVP is built with Astro, React, TypeScript, Tailwind CSS, Web Workers, Vitest, and Playwright. It can be deployed as static files to Cloudflare Pages or Vercel without environment variables.

## The five tools

1. **Metadata Viewer** — detects a file from its signature and reads normalized plus raw metadata.
2. **Image Privacy Checker** — shows a Quick report, adds a lazy ExifTool Standard/Embedded scan, scores explainable evidence, creates either a privacy-first or preserve-encoding clean copy, and verifies the result in the same tab.
3. **Metadata Remover** — builds Quick and ExifTool baselines, offers privacy-first or preserve-encoding cleanup, validates the output, rescans it to the same depth, and reports the exact score change before download.
4. **AI Image Prompt Reader** — reads AUTOMATIC1111, ComfyUI, Fooocus, InvokeAI, NovelAI, and generic Stable Diffusion fields already stored in image metadata.
5. **C2PA Viewer** — dynamically loads the official `@contentauth/c2pa-web` WebAssembly verifier and displays manifest and validation data.

## Supported formats

| Tool | MVP formats |
| --- | --- |
| Universal metadata viewer | JPEG, PNG, WebP, PDF, MP4, MP3 |
| Image metadata viewer | JPEG, PNG, WebP |
| Image privacy checker | JPEG, PNG, WebP |
| Metadata remover | JPEG, PNG, WebP |
| AI prompt / ComfyUI reader | PNG, JPEG, WebP |
| C2PA viewer | Formats supported by the installed official C2PA WASM library; the UI currently accepts JPEG, PNG, WebP, MP4, and PDF |

Specialized pages reuse the same parser adapters:

- `/metadata-viewer`
- `/image-metadata-viewer`
- `/pdf-metadata-viewer`
- `/video-metadata-viewer`
- `/audio-metadata-viewer`
- `/image-privacy-checker`
- `/metadata-remover`
- `/ai-prompt-reader`
- `/comfyui-workflow-reader`
- `/c2pa-viewer`
- `/privacy`
- `/about`

## Technology

- **Astro 7** with static output and per-page SEO metadata
- **React 19** islands for the interactive workbench
- **TypeScript** in strict mode
- **Tailwind CSS 4** through the Vite plugin, plus a project-specific design system
- **Web Worker** task protocols for parsing, AI metadata extraction, ExifTool privacy scoring, cancellation, and preserve-encoding cleanup
- **ExifReader** for EXIF, XMP, IPTC, ICC, and other image records
- **ExifTool WebAssembly** for the lazy, exhaustive local field report and embedded-document scan
- **pdfjs-dist** for PDF information dictionaries and readable XMP
- **MP4Box.js** for MP4 container and track data
- **music-metadata** for MP3/ID3 data
- **Pako** for PNG `zTXt` and compressed `iTXt`
- **Zod** for guarded ComfyUI graph structures
- **@contentauth/c2pa-web** for browser C2PA verification
- **Iconify / Lucide** for interface icons
- **Vitest** and **Playwright** for unit and browser coverage

## Architecture

```text
src/
├── components/             React and Astro interface components
├── content/tools.ts        Unique SEO copy and configuration per tool
├── layouts/                Shared base and tool-page layouts
├── lib/
│   ├── c2pa/               Lazy C2PA verifier
│   ├── generators/         A1111 and ComfyUI adapters plus generic detection
│   ├── image/              Canvas image re-encoding
│   ├── metadata/           Signature detection, image engine, safety limits, and format adapters
│   ├── privacy/            Rules, combinations, recommendations, scoring
│   ├── image-worker-client.ts  Restartable image Worker with stale-result and timeout handling
│   └── worker-client.ts    Cancellable shared-tool Worker tasks
├── pages/                  Fourteen statically generated routes
├── styles/                 Responsive project design system
└── workers/                Worker protocol and metadata worker

tests/
├── unit/                   Signature, chunk, parser, graph, score, export tests
└── e2e/                    Real Chromium upload and download flows
```

`src/lib/metadata/parse-file.ts` selects a format adapter after `detect-file-type.ts` checks magic bytes. Extension and MIME mismatches produce warnings rather than overriding the signature. Unknown readable metadata is retained in the raw result.

The image engine follows one path for every consumer: signature detection → JPEG/PNG/WebP container parsing → EXIF-family extraction → normalization → bounded serialization. The custom PNG parser validates structural boundaries, caps compressed output, reads `tEXt`, `iTXt`, `zTXt`, `eXIf`, and `iCCP`, and skips an individual damaged text block with a warning when the rest of the image remains readable.

ComfyUI parsing begins at `KSampler` or `KSamplerAdvanced`, follows positive and negative connections, guards cycles with a visited set, and rejects graphs above 5,000 nodes. Nodes are treated as inert JSON and are never executed.

## Local development

Requirements:

- Node.js 22 or newer
- pnpm 11

```bash
pnpm install
pnpm dev
```

Open `http://localhost:4321`.

No `.env` file or external service is required.

## Tests and build

```bash
pnpm test
pnpm exec playwright install chromium
pnpm exec playwright test
pnpm build
```

`pnpm build` runs `astro check` before generating the static site in `dist/`.

Current local verification:

- 157 Vitest unit tests
- 71 Playwright Chromium flows, including progressive privacy scanning, both cleanup modes, cross-page rescanning, APNG protection, desktop/mobile visual checkpoints, and 390 px overflow passes
- 14 generated static pages

## Browser privacy design

- File bytes and parsed metadata stay in browser memory.
- Nothing is written to `localStorage`, IndexedDB, the URL, or an analytics event.
- Refreshing or closing the page discards the selected file and result.
- Workers terminate after success, error, timeout, cancellation, or page unmount.
- Download Object URLs are revoked after use.
- Privacy-report exports contain masked display evidence, never `rawValue`, file bytes, Blob URLs, or binary payloads.
- Unknown text fields share a two-million-character scan budget; binary fields use only ExifTool's type/length summary.
- C2PA readers are freed and the SDK is disposed after each verification.
- Metadata values are rendered as React text, never unsanitized HTML.
- The PDF metadata path does not render documents or execute embedded JavaScript.
- ComfyUI workflows are parsed as data and never execute nodes or load remote references.

The MVP does not ship analytics or ads. A future ad provider could set its own cookie, but browser isolation does not give it access to the selected file or the React result state.

## Safety limits

- General file size: 100 MB
- Image size: 50 MB
- Single PNG metadata chunk: 10 MB
- Inflated PNG text: 20 MB
- One metadata string: 2 MB
- Privacy text scan budget per report: 2,000,000 characters
- Privacy-first Canvas limit: 40 megapixels and 16,384 pixels per side
- Search preview per field: 100 KB
- ComfyUI graph: 5,000 nodes
- Production image Worker timeout: 15 seconds
- Shared-tool Worker timeout: 25 seconds
- ExifTool standard scan timeout: 120 seconds
- User-triggered embedded-content scan timeout: 180 seconds
- MP4 adapter timeout: 15 seconds
- Image JSON normalization: 50 levels and 20,000 keys
- One file per task; no retained history or batch queue

## Metadata removal

The dedicated remover and Image Privacy Checker share one cleanup-and-verification workflow. The source and clean copy always use the same completed scan depth before the UI says verification is complete.

- **Privacy-first** decodes the static image, applies Orientation to pixels, and writes a new PNG losslessly or JPEG/WebP at 92% quality. It copies no original metadata or ICC profile.
- **Preserve encoding** uses local ExifTool WASM to keep the compressed image stream, animation, Orientation, ICC profile, and required color-space tags while removing writable privacy metadata.
- APNG and animated WebP automatically use preserve-encoding cleanup; pixel re-encoding is disabled so frames cannot be silently flattened.
- Signature, displayed dimensions, Orientation, and animation are checked before download. Structural failures block the file; a scan timeout allows download only as `Verification incomplete`.
- Retained ICC copyright or rights text remains visible in the residual score. A verified zero means only that no supported embedded metadata risk was found.
- Removing metadata does not hide visible faces, text, plates, reflections, locations, or a revealing output filename.

## C2PA behavior

The C2PA bundle is code-split and loaded only from `/c2pa-viewer`. Results use five states: Verified, Invalid, Not Found, Unsupported, and Error.

`Verified` means the credential is cryptographically associated with the current file. It does not prove that every visible claim is true. `Not Found` does not mean that a file is fake.

The production host must serve `.wasm` files with `Content-Type: application/wasm`. `public/_headers` supplies this for Cloudflare Pages; Vercel sets the MIME type for generated WASM assets automatically.

## Deploy to Cloudflare Pages

Create a Pages project from this repository with:

```text
Build command: pnpm build
Build output directory: dist
Node version: 22
```

No environment variables are required. Keep the generated `_headers` file in the deployed output so the C2PA WASM response has the correct content type.

The checked-in `wrangler.jsonc` targets the Direct Upload project `achelie-metadataview`. After a successful build, deploy the exact `dist/` output with:

```bash
pnpm deploy:pages
```

The canonical production origin is `https://achelie-metadataview.pages.dev`.

ExifTool is emitted as a lazy, same-origin WASM asset. `pnpm build` fails if any generated file exceeds Cloudflare Pages' 25 MiB per-file limit or if the WASM is accidentally inlined into JavaScript.

## Deploy to Vercel

Import the repository, select the Astro framework preset, and use:

```text
Build command: pnpm build
Output directory: dist
Node version: 22
```

The project uses static output, so no Function or server runtime is needed.

## Known limitations

- Metadata is editable and should not be treated as proof by itself.
- Browser format support can differ, especially for WebP re-encoding and C2PA media types.
- Preserve-encoding cleanup intentionally retains Orientation, ICC, and required color-space information; ICC rights text may therefore remain in the verified residual report.
- C2PA trust and supported formats follow the installed official SDK.
- Complex custom ComfyUI nodes may appear only in raw JSON.
- PDF, MP4, and MP3 metadata removal is not included.
- GIF, HEIC, FLAC, WAV, MKV, MOV, batch processing, OCR, face recognition, prompt reconstruction, malicious-file scanning, accounts, APIs, and cloud history are outside this MVP.

## Roadmap

- CRC verification for PNG chunks
- More generator-specific normalization and ComfyUI custom-node mappings
- Optional additional browser-safe media adapters
- Performance profiling against larger local fixtures
- Accessibility audits with additional screen readers
- Trust-list configuration guidance for advanced C2PA deployments
