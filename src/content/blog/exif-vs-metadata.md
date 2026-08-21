---
title: "EXIF vs Metadata: What Is the Difference?"
seoTitle: "EXIF vs Metadata: What Is the Difference? | ViewExif"
description: "EXIF is one type of photo metadata, not a name for every hidden field. Learn how EXIF, XMP, IPTC, file dates, and photo library data differ."
excerpt: "All EXIF is metadata, but not all metadata is EXIF. This plain-English guide separates camera data from file properties and app-only information."
category: "EXIF basics"
tags:
  - EXIF vs Metadata
  - EXIF metadata
  - photo metadata
  - file metadata
publishedAt: 2026-08-21
updatedAt: 2026-08-21
featured: false
author: "ViewExif Editorial Team"
reviewedBy: "ViewExif Product Engineering"
cover: "../../assets/blog/exif-vs-metadata.webp"
coverAlt: "A digital camera beside a laptop in a photographer's workspace, representing EXIF and other photo metadata"
practicalTake:
  - "Metadata is the broad category. EXIF is one embedded metadata format commonly used for camera settings, capture time, orientation, and GPS."
  - "A file date, a photo app's location label, and DateTimeOriginal can describe different events and may be stored in different places."
  - "Check the whole file before sharing. Private details can sit in XMP, IPTC, comments, or file paths even when the EXIF section is empty."
faqs:
  - question: "Is EXIF the same as metadata?"
    answer: "No. EXIF is one type of metadata. Metadata can also include XMP, IPTC, color profiles, PNG text, file system dates, and information stored only by a photo app."
  - question: "Does every image have EXIF data?"
    answer: "No. Camera JPEGs often contain EXIF, but screenshots, edited exports, web downloads, and some PNG, GIF, or WebP files may contain no EXIF at all."
  - question: "Can a photo have metadata without EXIF?"
    answer: "Yes. It may still have dimensions, an ICC color profile, XMP, IPTC, comments, software tags, or file system properties even when no EXIF block exists."
  - question: "Is a file creation date part of EXIF?"
    answer: "Usually not. A computer's Created or Modified date belongs to the local file copy. EXIF DateTimeOriginal is an embedded field that usually describes capture time."
  - question: "Does removing EXIF remove all metadata?"
    answer: "Not always. XMP, IPTC, comments, color profiles, and container fields may remain. Scan the cleaned copy instead of checking only whether its EXIF block disappeared."
related:
  - what-is-exif-data
  - do-screenshots-have-metadata
  - how-to-find-where-a-photo-was-taken
---

EXIF is one type of metadata, while metadata is the wider name for information about a file. EXIF usually holds camera details such as the model, lens, exposure settings, capture time, orientation, and sometimes GPS. Other metadata can include captions, copyright, editing history, color profiles, file dates, and details stored by a photo app rather than inside the image.

The short version is simple: all EXIF is metadata, but not all metadata is EXIF.

## What is the difference between EXIF and metadata?

Metadata is the umbrella term. EXIF is one standard under that umbrella, built mainly for camera and image information.

Suppose a JPEG shows a birthday cake. Its EXIF might say the photo came from an iPhone 15, used ISO 200, and was captured at 7:42 p.m. Its other metadata might include a photographer credit in IPTC, an edit record in XMP, and a Display P3 color profile. Windows may then show a Created date for the copy you downloaded yesterday.

Those details all describe the file or its history, but they do not all belong to EXIF.

| Metadata type | What it often stores | Is it EXIF? |
| --- | --- | --- |
| EXIF | Camera, lens, ISO, aperture, shutter speed, capture time, orientation, GPS | Yes |
| XMP | Editing history, ratings, labels, creator details, app-specific fields | No |
| IPTC | Caption, credit, copyright, contact information, keywords | No |
| ICC profile | Instructions for displaying color | No |
| File system properties | Local filename, Created date, Modified date, file size | No |
| Photo library or sidecar data | Albums, faces, favorite status, added location, catalog edits | No, and it may not be inside the image |

If you want a closer look at camera fields, read [what EXIF data contains](/blog/what-is-exif-data/). This guide stays focused on where one type ends and another begins.

## What counts as metadata outside EXIF?

XMP, IPTC, ICC profiles, comments, file properties, and app database records can all be metadata without being EXIF.

XMP is common in editing workflows. It can store ratings, adjustments, creator names, or an app's history. IPTC is widely used for news and stock photography because it can hold captions, credits, contact details, and usage information. An ICC profile tells a browser or editor how the colors should look.

Then there are values that are not embedded in the image at all. A photo library may remember that you placed a picture in an album or assigned it a location. A sidecar file can hold edits next to a RAW photo. Your computer tracks local dates and permissions for its copy.

That is why two apps can show different reports without either one being broken. They may be reading different layers.

## Is a file date the same as an EXIF date?

No. File Created and Modified dates describe a local copy, while EXIF DateTimeOriginal usually describes when the camera says the photo was taken.

Download a five-year-old image today and your computer may give the new copy today's Created date. The embedded DateTimeOriginal can still show the older capture date. Copying, syncing, unzipping, or emailing a file can change local timestamps without touching the EXIF block.

This exact mix-up appeared in an [r/digitalforensics discussion about an emailed JPEG](https://www.reddit.com/r/digitalforensics/comments/17w0a8w/metadata_from_emailed_image/). The downloaded file looked new in the operating system, while the user wanted the original photo date. Replies separated the recipient computer's file dates from the attachment's embedded EXIF.

Neither date is guaranteed to be correct. A camera clock can be wrong, and both kinds of dates can be changed. They answer different questions.

## Can a screenshot have metadata without EXIF?

Yes. A screenshot usually drops the source photo's camera EXIF but can still have dimensions, color information, software tags, comments, or file dates of its own.

A screenshot is a newly created image. It does not reach into the original photo and copy its lens model or GPS coordinates. That does not make the result metadata-free. The operating system still saves an image with a format, size, dimensions, and local timestamps. Depending on the device and app, it may also include an ICC profile or text fields.

An [r/privacy question about macOS screenshots](https://www.reddit.com/r/privacy/comments/1amghzo/does_screenshot_on_macos_scrub_exifmetadata/) captures the confusion well. The practical answer was not simply "yes, metadata is gone." The screenshot does not inherit the original EXIF, but the new file can carry metadata about itself.

Our [screenshot metadata guide](/blog/do-screenshots-have-metadata/) covers the platform differences and the bigger risk: usernames, notifications, maps, and addresses can be visible in the pixels even when hidden camera data is absent.

## Can an app show metadata that is not inside the file?

Yes. Photo apps can display database or sidecar information that disappears when you move the bare image to another app.

A library may know a face name, album, favorite status, corrected date, or manually added place. Some editors keep adjustments in a catalog. RAW workflows often store instructions in a separate XMP sidecar rather than rewriting the original image.

This matters when someone says, "My phone shows a location, so it must be in the EXIF." Maybe it is. Maybe the library added the place later. Export the exact file and inspect it before drawing a conclusion.

The reverse can happen too. A simple gallery screen may hide fields that are still embedded. A short Info panel is convenient, not a complete metadata audit.

## Which metadata can expose private details?

GPS, names, contact details, device identifiers, file paths, dates, and old previews can be private, whether they sit in EXIF or somewhere else.

Checking only the GPS section is easy but incomplete. An author email may live in IPTC. A full local path can appear in XMP. A device serial number may be buried in maker notes. An older thumbnail can survive an edit. Even an innocent capture time can reveal when someone was home or away when combined with other information.

Use the [Image Privacy Checker](/image-privacy-checker/) on the exact copy you plan to send. It checks several metadata families and labels the evidence it finds. It does not inspect faces, signs, reflections, or other visible content, so review the picture itself as well.

## How do you view EXIF and other metadata?

Open the original image in a viewer that separates readable EXIF from the full native field list.

Drop the file into the [Image Metadata Viewer](/image-metadata-viewer/). The readable report groups familiar camera, date, GPS, color, and authorship details. The native view shows the original field paths and sources, which helps when a value exists outside EXIF.

Use the original or exported file you actually care about. A thumbnail, screenshot, chat preview, and downloaded copy can each have different metadata. Search the report for terms such as GPS, author, creator, software, comment, path, serial, and date rather than stopping at one section title.

## How do you remove metadata safely?

Create a cleaned copy, rescan that copy, and check the remaining fields instead of assuming that deleting EXIF deleted everything.

The [Image Metadata Remover](/image-metadata-remover/) removes writable descriptive and private metadata while preserving the image structure needed to display it. Keep the original if you still want camera settings or capture dates for your archive.

After cleaning, open the output in the viewer or privacy checker. A color profile or orientation field may remain because it helps render the image correctly. The important question is not whether the report is completely empty. It is whether the cleaned copy still contains a location, identity, device, history, or comment you did not mean to share.

That final scan also catches a common mistake: cleaning one file, then attaching a different copy from the photo library.
