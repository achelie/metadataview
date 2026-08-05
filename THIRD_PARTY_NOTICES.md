# Third-party notices

MetadataView includes open-source software that runs locally in the visitor's browser.

## ExifTool WebAssembly

- Package: `@colorhythm/exiftool-wasm` 1.0.4
- Source: https://github.com/colorhythm/exiftool-wasm
- License: Apache License 2.0

This package bundles Phil Harvey's ExifTool and the ZeroPerl WebAssembly runtime. ExifTool is distributed under the same terms as Perl. The package repository contains the applicable source, attribution, and license information. MetadataView uses the package for local metadata inspection and for creating a structurally cleaned copy when the visitor chooses preserve-encoding cleanup. It does not send files to the package author or another service.

## ExifReader

- Package: `exifreader` 4.41.3
- Source: https://github.com/mattiasw/ExifReader
- License: Mozilla Public License 2.0

ExifReader supplies the fast first-pass image report and remains the fallback when the optional ExifTool engine cannot run.

## Product-design references

The cleanup verification flow was informed by the public behavior and documentation of these projects:

- ExifCleaner: https://github.com/szTheory/exifcleaner
- MAT2: https://github.com/tpet/mat2

MetadataView does not copy or bundle code from either project. Their names are included to acknowledge the cleanup-then-verify pattern and the principle that “not detected” is not a safety guarantee.
