# ViewExif editorial examples — 2026-10-05

All six PNG illustrations are screenshots of ViewExif processing controlled
synthetic files in a local production preview. They show the real tool output;
no result fields were drawn or substituted. The three English guide covers are
byte-for-byte copies of the corresponding screenshots. No customer file was used.

## Inputs and reading limits

| Screenshot | Input | What the example demonstrates |
| --- | --- | --- |
| `image-sample.png` | `synthetic-photo.jpg` | AI-generated demo with deliberately written camera, author, date and GPS teaching values. These values are not evidence of a real camera capture. |
| `document-sample.png` | `synthetic-document.docx` | Generated OOXML with title “Synthetic review copy”, author “Ada Example”, company “Example Studio” and custom “Review status: Draft”. Saved word/page counts are fixture properties, not a live body count. |
| `audio-sample.png` | `synthetic-audio.wav` | One second of silent PCM: 8,000 Hz, mono, 16 bits. RIFF INFO title “Synthetic silence”, artist “Ada Example”. The quick reader returned `AUDIO_PARSER_WARNING`; the deeper scan completed. A warning must not be described as an empty record. |
| `video-sample.png` | `synthetic-container.mp4` | Minimal MP4 container with timescale/duration values and no media tracks. It is not a playable movie and does not demonstrate preservation of frames or sound. |
| `c2pa-sample.png` | `synthetic-photo.jpg` | No embedded Content Credentials found. No signature exists to validate; this result does not establish authenticity, forgery or an unedited history. |
| `cleanup-sample.png` | `synthetic-cleanup.png` | Generated orange 320 × 180 PNG with synthetic Author/Comment. Real result: 691 → 608 bytes; 15 removed, 27 preserved, 29 residual; “Verified with residual metadata”. This is not a claim of anonymity or complete removal. |

The JPEG is an unchanged copy of `public/samples/metadata-demo-v1.jpg`.
Its generation prompt, encoding and deliberate EXIF are documented in
[the sample sources](../samples/SOURCES.md). The screenshot of the C2PA viewer
also includes its existing attributed Adobe sample link; that separate signed
sample was not the selected input in this example.

## Reproducing the examples

Use the repository's existing Node 22 runtime and installed dependencies:

```powershell
node --experimental-strip-types scripts/create-editorial-fixtures.mjs output/playwright/new-editorial-capture
pnpm build
pnpm preview --host 127.0.0.1 --port 4330
```

Choose each synthetic file in its corresponding tool, wait for the result and
capture the visible result at 1200 × 800. The cleanup example requires an explicit
“Create and verify clean copy” action. Do not automatically clean or download
files while navigating between tools. Each new capture should use a fresh output
directory; the generator refuses to replace existing fixture files.

The generator reproduces the teaching values. OOXML ZIP timestamps may differ
between runs, so regenerated DOCX bytes need not have the original hash. Actual
results can also change with engine versions; preserve warnings and residue in
new examples instead of copying the old counts into the interface.

The original input hashes, image hashes, tool routes and captured result evidence
are retained in `docs/adsense-editorial-evidence-2026-10-05.json`. The guide cover
mapping is `verify-metadata-removal → cleanup`, `why-metadata-is-missing → document`,
and `how-to-read-c2pa-results → c2pa`.
