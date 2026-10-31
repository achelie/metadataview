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

EXIF `Orientation` tells a compatible viewer how to display a photo's stored pixels. A portrait photo, for example, can have landscape-shaped pixels and a tag that tells the viewer to rotate them. Remove the tag without adjusting the pixels and the photo may appear sideways.

You can make a preview look upright by changing the tag or by transforming the pixels. Those operations produce different files, so check which one your editor performs.

## What do the eight Orientation values mean?

The eight values specify how to rotate or reflect the stored pixels for display. Four include a mirror operation.

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

The labels follow [ExifTool's EXIF reference](https://exiftool.org/TagNames/EXIF.html). With values 5 and 7, mirror first and then rotate: changing the order can produce a different result.

Adobe's [TIFF namespace reference](https://developer.adobe.com/xmp/docs/xmp-namespaces/tiff/) describes the same eight arrangements through row and column positions. Software may show those position names instead of a rotation label. For example, `right-top` corresponds to value 6.

## Why can 4000 × 3000 pixels display as a portrait?

Stored dimensions describe the pixel array, while displayed dimensions also account for the orientation instruction.

Take a file with a stored width of 4000, a height of 3000, and Orientation 6. A compatible viewer displays it rotated clockwise, at 3000 by 4000. The file does not need a second portrait image.

Values 5 through 8 swap the displayed axes. Values 1 through 4 keep the same width and height, even when the picture turns upside down or reflects. A dimensions summary can therefore differ from a raw width field without either being wrong. Label which dimensions you recorded when comparing two tools.

## Why does one app look right and another look wrong?

One app may ignore the orientation instruction, use different metadata, or show a different copy of the image.

For web pages, Mozilla's [image-orientation documentation](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/image-orientation) describes how browsers can use EXIF information when rendering an image. That behavior does not guarantee every editor, thumbnail generator, or document importer will use the same path.

First confirm you opened the same downloaded file. A library preview and an exported JPEG may have different pixels or metadata. Next compare the native Orientation field, any XMP copy, and the actual stored dimensions. If the disagreement appears only in a thumbnail, reopen the full file before rewriting the original.

## Why does the photo look mirrored rather than rotated?

A reflection changes left and right or top and bottom, so correcting it requires more than choosing a rotation angle.

Read the Orientation number before making changes. Values 2, 4, 5, and 7 include reflection. Use an asymmetric feature such as readable text or a known left-side detail when checking the result. A face alone can make a mistaken flip harder to notice.

The pixels may already contain a mirror image independently of the tag. Setting the tag to 1 does not establish what the original scene looked like. Decide which appearance you intend to preserve, and keep the source copy so you can reverse an incorrect adjustment.

## What happens if you simply delete Orientation?

If a viewer relied on the tag, deleting it can leave the photo sideways or mirrored even though the encoded image data has not changed. A cleanup tool can keep the display instruction or create a new pixel arrangement that no longer needs it.

ViewExif's [Image Metadata Remover](/image-metadata-remover/) treats Orientation as structural data in its metadata-preserving cleanup policy. A retained orientation field therefore does not, by itself, mean a private creator name or GPS coordinate survived. Check the separate removed, retained, and residual groups, together with any verification warning. Different cleanup workflows can perform different operations; read the result for the file you actually processed.

## How do you normalize the pixels safely?

Use an image editor's orientation-aware export on a copy. The saved image should look upright with Orientation set to 1, or display correctly without the tag. If the editor rotates the pixels but keeps the old instruction, a compatible viewer may rotate the photo a second time.

ViewExif does not provide a manual rotate-and-save editor. Use an editor you trust, export a trial image, and open the saved file in a second viewer. Compare text direction, edges, crop, dimensions, and file type. Do not judge only the editor's unsaved preview.

## Does fixing orientation reduce image quality?

Changing a metadata tag leaves the encoded pixels alone, while an export that rebuilds a JPEG can introduce another compression step.

Some tools offer lossless JPEG transforms under particular conditions. A generic “save” or browser image export does not establish that such a transform happened. Keep the original when image quality or archival fidelity matters, and record whether you changed metadata, transformed pixels, or re-encoded the file.

A smaller file alone cannot tell you which operation took place: it may have fewer metadata bytes or a newly compressed image. A successful metadata scan does not compare visual quality either.

## What should you check after cleanup or export?

Check the downloaded copy for private fields, then make sure the picture still looks right.

1. Open it in the [Image Metadata Viewer](/image-metadata-viewer/) and search for `Orientation`.
2. Record the native field path and value, plus stored dimensions.
3. Look at the full image for sideways text, reflection, unexpected crop, or color change.
4. Read the cleanup result for residual fields and unfinished checks.
5. Reopen the file in the app or page where you plan to use it.

The [metadata-removal verification guide](/blog/verify-metadata-removal/) covers checks beyond the field summary. Keep the original separate from the copy you share. A working orientation instruction helps display the picture; it does not establish who took it, whether its date is accurate, or whether its contents are authentic.
