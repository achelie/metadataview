# Third-party notices

ViewExif includes open-source software that runs locally in the visitor's browser.

## C2PA WebAssembly verifier

- Package: `@contentauth/c2pa-web` 0.13.1
- Source: https://github.com/contentauth/c2pa-js
- JavaScript wrapper license: MIT
- Bundled TagLib WebAssembly license: LGPL-2.1-or-later

The package provides the official browser SDK and WebAssembly bindings used to read and validate C2PA Content Credentials. ViewExif loads it only after the visitor selects a file, terminates the SDK Worker after each run, and exports only a bounded safe report rather than file or resource bytes.

## ExifTool WebAssembly

- Package: `@colorhythm/exiftool-wasm` 1.0.4
- Source: https://github.com/colorhythm/exiftool-wasm
- License: Apache License 2.0

This package bundles Phil Harvey's ExifTool and the ZeroPerl WebAssembly runtime. ExifTool is distributed under the same terms as Perl. The package repository contains the applicable source, attribution, and license information. ViewExif uses the package for local metadata inspection and for creating a structurally cleaned copy when the visitor chooses preserve-encoding cleanup. It does not send files to the package author or another service.

## ExifReader

- Package: `exifreader` 4.41.3
- Source: https://github.com/mattiasw/ExifReader
- License: Mozilla Public License 2.0

ExifReader supplies the fast first-pass image report and remains the fallback when the optional ExifTool engine cannot run.

## zip.js

- Package: `@zip.js/zip.js` 2.8.34
- Source: https://github.com/gildas-lormeau/zip.js
- License: BSD 3-Clause

zip.js opens OOXML packages from the selected browser `Blob`. ViewExif extracts only a small allowlist of document-property XML entries and does not read document body, worksheet, slide, note, attachment, or embedded-media content.

## fast-xml-parser

- Package: `fast-xml-parser` 5.10.1
- Source: https://github.com/NaturalIntelligence/fast-xml-parser
- License: MIT

fast-xml-parser reads bounded OOXML property documents after ViewExif rejects DTD and entity declarations. Entity expansion is disabled.

## TagLib-Wasm

- Package: `taglib-wasm` 1.8.3
- Source: https://github.com/CharlesWiltgen/TagLib-Wasm
- License: MIT

TagLib-Wasm supplies the browser WebAssembly interface used to remove writable audio tags and Matroska/WebM tags without transcoding media. The package repository includes the TagLib source and documented relinking instructions required by its LGPL terms. ViewExif snapshots and restores supported cover art and chapters according to its metadata-only policy, then rescans the generated file.

## qpdf WebAssembly

- Package: `@neslinesli93/qpdf-wasm` 0.3.0
- Package source: https://github.com/neslinesli93/qpdf-wasm
- Upstream qpdf source: https://github.com/qpdf/qpdf
- Wrapper license: ISC

The qpdf WebAssembly build omits top-level Info and XMP dictionaries while rewriting the complete PDF. This prevents old incremental PDF revisions from retaining recoverable top-level metadata. Page content, forms, annotations, attachments, and metadata inside embedded files are intentionally outside this cleanup policy.

## Product-design references

The cleanup verification flow was informed by the public behavior and documentation of these projects:

- ExifCleaner: https://github.com/szTheory/exifcleaner
- MAT2: https://github.com/tpet/mat2

ViewExif does not copy or bundle code from either project. Their names are included to acknowledge the cleanup-then-verify pattern and the principle that “not detected” is not a safety guarantee.
