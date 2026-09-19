# ViewExif demo image sources

These files power the site's optional sample-image actions. Each file has a
versioned filename so a future replacement can use a new cache key.

## `metadata-demo-v1.jpg`

An original AI-generated image of the Seine river and the Eiffel Tower in Paris.
It is a demonstration image, not a record of a camera capture. All camera,
exposure, author, capture-date, and GPS values were deliberately added as sample
data. The GPS coordinates identify the public Eiffel Tower landmark; they do not
claim the image was captured from that location.

- Generator: OpenAI's built-in `image_gen.imagegen` tool, through the `imagegen`
  skill; no source photograph or reference image was supplied.
- Generated source: 1536 × 1024 PNG.
- Generated PNG SHA-256:
  `2b165047e942a5770ccbde20209829e5af37efcc7e67c506e9b2375dc71563e5`.
- Final asset: 1200 × 800 JPEG, 253,983 bytes.
- JPEG SHA-256:
  `4932b44f686a7f8a245377de4766c81e039e6e27f9aeba49993dab5898c12889`.

### Generation prompt

```text
Use case: photorealistic-natural
Asset type: original demo landscape image for a photo metadata viewer
Primary request: an original photographic-style view along the Seine river in Paris, with a natural riverside foreground and the Eiffel Tower visible in the distance.
Scene/backdrop: quiet river water, restrained winter greenery, pale January daylight, Paris riverbank and distant architecture.
Style/medium: realistic editorial landscape photography with natural texture and soft daylight; credible colors and no heavy filters.
Composition/framing: horizontal 3:2 landscape, intended for a 1200 x 800 JPEG; the river leads the eye toward the distant Eiffel Tower, with an informal off-center composition.
Constraints: no people, no text, no watermarks, no logos, no border. The image is AI-generated and will be labeled as a demonstration image by the consuming website.
```

### Encoding and demonstration EXIF

Pillow 12.2.0 converted the generated PNG to RGB, resized it to 1200 × 800 with
Lanczos resampling, and saved a progressive JPEG with quality 86, optimization
enabled, and 4:2:0 chroma subsampling (`subsampling=2`). A fresh EXIF block was
written with the fields below. This image is for the ordinary metadata example;
the separate official image below is for the C2PA example. Do not use the demo
camera fields as evidence of photographic origin.

| Field | Demonstration value |
| --- | --- |
| Make | `ViewExif` |
| Model | `Demo Camera` |
| LensModel | `Demo 35mm f/1.8` |
| ExposureTime | `1/125` second |
| FNumber | `2.8` |
| ISOSpeedRatings | `200` |
| FocalLength | `35` mm |
| DateTime | `2026:01:15 10:30:00` |
| DateTimeOriginal | `2026:01:15 10:30:00` |
| DateTimeDigitized | `2026:01:15 10:30:00` |
| Artist | `ViewExif Demo` |
| ImageDescription | `AI-generated sample image; metadata values are for demonstration only.` |
| Orientation | `1` (normal) |
| Software | `ViewExif demo asset generator; Pillow 12.2.0` |
| ExifVersion | `0232` |
| ColorSpace | `1` (sRGB) |
| PixelXDimension / PixelYDimension | `1200` / `800` |
| GPSVersionID | `2.3.0.0` |
| GPSLatitudeRef / GPSLatitude | `N` / `48° 51′ 30.24″` (`48.8584`) |
| GPSLongitudeRef / GPSLongitude | `E` / `2° 17′ 40.2″` (`2.2945`) |
| GPSMapDatum | `WGS-84` |
| GPSProcessingMethod | `PUBLIC LANDMARK DEMO` |

The final JPEG was reopened after encoding to verify its dimensions,
size limit, exposure values, camera and lens fields, orientation, author, and GPS.
The original PNG remains in the generating operator's Codex image output folder;
the website only needs this final JPEG. Running the prompt again will produce a
new image rather than the same bytes.

## `c2pa-signed-v1.jpg`

Official C2PA public test image, attributed to Adobe. This is the original
`adobe-20220124-C.jpg` from the C2PA organization's public test-file repository.
It was downloaded and renamed locally without modifying its bytes, image
encoding, metadata, or embedded Content Credentials.

- Original author / attribution: Adobe.
- Upstream repository: [c2pa-org/public-testfiles](https://github.com/c2pa-org/public-testfiles).
- Fixed commit: `22beccc075707475b038d8789d0136c009e43143`.
- Source path: `legacy/1.4/image/jpeg/adobe-20220124-C.jpg`.
- [Pinned source file](https://github.com/c2pa-org/public-testfiles/blob/22beccc075707475b038d8789d0136c009e43143/legacy/1.4/image/jpeg/adobe-20220124-C.jpg).
- [Original download](https://raw.githubusercontent.com/c2pa-org/public-testfiles/22beccc075707475b038d8789d0136c009e43143/legacy/1.4/image/jpeg/adobe-20220124-C.jpg).
- Original bytes: 140,297.
- Git blob SHA-1: `4b8df5e273c9694f4f9287e2064b66c2d3d33574`.
- SHA-256: `75a8da33f6eaf1e16bf3b42cd78913b22b2e6a671fda217a508b1ba4230ce864`.
- License: Creative Commons Attribution-ShareAlike 4.0 International
  ([CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)).
- [Pinned upstream license](https://github.com/c2pa-org/public-testfiles/blob/22beccc075707475b038d8789d0136c009e43143/LICENSE),
  also preserved in this directory as [LICENSE.c2pa.txt](./LICENSE.c2pa.txt).
- Changes: none to the file bytes; only the local filename differs.

Keep this file byte-for-byte intact. Resizing, transcoding, optimizing, or
rewriting metadata can invalidate the C2PA content binding. The presence of a
signature and the reader's assessment of signer trust are separate results;
display the real reader result rather than assuming a trusted signer.
