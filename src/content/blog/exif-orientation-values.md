---
title: "EXIF Orientation Values: Why a Photo Turns Sideways"
seoTitle: "EXIF Orientation Values 1–8: Rotation, Mirroring, and Safe Cleanup | ViewExif"
description: "Understand EXIF Orientation values 1–8, stored versus displayed dimensions, mirrored photos, and the checks to make before removing image metadata."
excerpt: "A sideways photo can have perfectly good pixels and a missing display instruction. Read all eight Orientation values before changing the image."
category: "Metadata basics"
tags:
  - EXIF Orientation
  - photo rotation
  - mirrored image metadata
publishedAt: 2026-10-23
updatedAt: 2026-10-23
featured: false
author: "ViewExif"
# Cover: Pexels #12468236, Oleg Nagovski, downloaded 2026-10-31; center-cropped to 1600 × 900 WebP.
cover: "../../assets/blog/exif-orientation-values.webp"
coverAlt: "Hands holding a camera with a person reflected in its screen"
practicalTake:
  - "Orientation is a display instruction. Removing it without transforming the pixels can leave a photo sideways or mirrored."
  - "Values 5–8 exchange the displayed width and height. Values 2, 4, 5, and 7 include a reflection rather than rotation alone."
  - "ViewExif's metadata-removal policy preserves Orientation as structural data. Check the downloaded copy's appearance and field report before sharing."
faqs:
  - question: "What does EXIF Orientation 6 mean?"
    answer: "It tells a compatible viewer to display the stored pixels rotated 90 degrees clockwise. A stored landscape pixel array can therefore appear as an upright portrait."
  - question: "Is Orientation 1 proof that a photo was never edited?"
    answer: "No. It describes normal display orientation for the current pixel arrangement. An editor can rotate the pixels and set Orientation to 1 during export."
  - question: "Can deleting EXIF make a photo turn sideways?"
    answer: "Yes, if the photo depended on its Orientation tag and cleanup removed the tag without normalizing the pixels. Reopen the downloaded result to check."
  - question: "Does changing Orientation reduce JPEG quality?"
    answer: "Changing only the tag does not recompress the image. Exporting transformed pixels can recompress them, depending on the editor and operation used."
related:
  - how-to-remove-metadata-from-a-photo
  - verify-metadata-removal
  - exif-timezone-offsettimeoriginal
---

EXIF `Orientation` tells a compatible viewer how to arrange a photo's stored pixels on screen. A portrait can contain a landscape-shaped pixel array plus an instruction to rotate it. Remove that instruction carelessly, and the same pixels suddenly appear sideways.

The important distinction is between changing the display instruction and transforming the image itself. Both can make a preview look upright, but they leave different files behind. This guide explains the eight values and a check you can repeat on your own copy.

## What do the eight Orientation values mean?

The values describe rotation and reflection needed for display; four of them include a mirror operation.

| Value | Display instruction for the stored pixels |
| --- | --- |
| 1 | Keep the normal arrangement |
| 2 | Mirror horizontally |
| 3 | Rotate 180 degrees |
| 4 | Mirror vertically |
| 5 | Mirror horizontally, then rotate 90 degrees counterclockwise |
| 6 | Rotate 90 degrees clockwise |
| 7 | Mirror horizontally, then rotate 90 degrees clockwise |
| 8 | Rotate 90 degrees counterclockwise |

This table follows the labels in [ExifTool's EXIF reference](https://exiftool.org/TagNames/EXIF.html). The order of the two operations matters for values 5 and 7. “Rotate and mirror” without specifying the order leaves room for a different result.

Adobe's [TIFF namespace reference](https://developer.adobe.com/xmp/docs/xmp-namespaces/tiff/) describes the same eight arrangements through row and column positions. Software may show those position names instead of a rotation label. For example, `right-top` corresponds to value 6.

## Why can 4000 × 3000 pixels display as a portrait?

Stored dimensions describe the pixel array, while displayed dimensions also account for the orientation instruction.

Consider an illustrative file with stored width 4000, stored height 3000, and Orientation 6. The viewer rotates its presentation clockwise. Its displayed shape is therefore 3000 wide by 4000 high. The file does not need to contain a second portrait image to do this.

Values 5 through 8 swap the displayed axes. Values 1 through 4 keep the same width and height, even when the picture turns upside down or reflects. A dimensions summary can therefore differ from a raw width field without either being wrong. Label which dimensions you recorded when comparing two tools.

## Why does one app look right and another look wrong?

The apps may use different metadata, ignore an instruction, or display a different copy of the image.

For web pages, Mozilla's [image-orientation documentation](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/image-orientation) describes how browsers can use EXIF information when rendering an image. That behavior does not guarantee every editor, thumbnail generator, or document importer will use the same path.

First confirm you opened the same downloaded file. A library preview and an exported JPEG may have different pixels or metadata. Next compare the native Orientation field, any XMP copy, and the actual stored dimensions. If the disagreement appears only in a thumbnail, reopen the full file before rewriting the original.

## Why does the photo look mirrored rather than rotated?

A reflection changes left and right or top and bottom, so correcting it requires more than choosing a rotation angle.

Read the Orientation number before making changes. Values 2, 4, 5, and 7 include reflection. Use an asymmetric feature such as readable text or a known left-side detail when checking the result. A face alone can make a mistaken flip harder to notice.

The pixels may already contain a mirror image independently of the tag. Setting the tag to 1 does not establish what the original scene looked like. Decide which appearance you intend to preserve, and keep the source copy so you can reverse an incorrect adjustment.

## What happens if you simply delete Orientation?

A viewer that previously relied on the tag may show the stored pixel array without its rotation or reflection instruction.

That can make a privacy-cleaned copy look broken despite unchanged encoded image data. A cleanup tool has to choose between retaining structural display information and producing a new pixel arrangement that no longer needs it.

ViewExif's [Image Metadata Remover](/image-metadata-remover/) treats Orientation as structural data in its metadata-preserving cleanup policy. A retained orientation field therefore does not, by itself, mean a private creator name or GPS coordinate survived. Check the separate removed, retained, and residual groups, together with any verification warning. Different cleanup workflows can perform different operations; read the result for the file you actually processed.

## How do you normalize the pixels safely?

Use an image editor's orientation-aware export on a copy, then verify both the new pixel arrangement and the remaining instruction.

The intended end state is an upright image whose Orientation is 1 or whose pixels display correctly without that tag. A common failure is applying a rotation to the pixels while keeping the old rotation instruction, causing a compatible viewer to rotate them again.

ViewExif does not provide a manual rotate-and-save editor. Use an editor you trust, export a trial image, and open the saved file in a second viewer. Compare text direction, edges, crop, dimensions, and file type. Do not judge only the editor's unsaved preview.

## Does fixing orientation reduce image quality?

Changing a metadata tag leaves the encoded pixels alone, while an export that rebuilds a JPEG can introduce another compression step.

Some tools offer lossless JPEG transforms under particular conditions. A generic “save” or browser image export does not establish that such a transform happened. Keep the original when image quality or archival fidelity matters, and record whether you changed metadata, transformed pixels, or re-encoded the file.

File size is a poor substitute for that record. A smaller copy may simply have fewer metadata bytes, or it may contain a newly compressed image. A successful metadata scan also does not compare visual quality.

## What should you check after cleanup or export?

Inspect the exact downloaded copy for both private fields and correct appearance, because these are separate questions.

1. Open it in the [Image Metadata Viewer](/image-metadata-viewer/) and search for `Orientation`.
2. Record the native field path and value, plus stored dimensions.
3. Look at the full image for sideways text, reflection, unexpected crop, or color change.
4. Read the cleanup result for residual fields and unfinished checks.
5. Reopen the file in the app or page where you plan to use it.

Our [metadata-removal verification guide](/blog/verify-metadata-removal/) explains why a clean-looking field summary alone cannot certify every byte. Keep the original separate from the copy you share. A working orientation instruction helps the picture display correctly; it says nothing about who took it, whether its date is accurate, or whether its contents are authentic.
