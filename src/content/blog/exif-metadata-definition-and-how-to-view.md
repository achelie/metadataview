---
title: "EXIF Metadata Definition and How to View It"
seoTitle: "EXIF Metadata Definition and How to View It | ViewExif"
description: "EXIF metadata is camera-written information inside a photo. Learn what it contains, how to view it, and why some apps or shared copies show less."
excerpt: "EXIF is the part of photo metadata that records camera details, capture settings, dates, orientation, and sometimes GPS. Here is how to read it without confusing it with file dates or app data."
category: "EXIF basics"
tags:
  - exif metadata definition and how to view
  - EXIF metadata
  - view EXIF data
  - photo metadata
publishedAt: 2026-09-03
updatedAt: 2026-09-03
featured: false
author: "ViewExif"
cover: "../../assets/blog/exif-metadata-definition-and-how-to-view.webp"
coverAlt: "A photographer holding a camera while reviewing photos and metadata on a laptop"
practicalTake:
  - "EXIF is one part of photo metadata. XMP, IPTC, file dates, and information saved by a photo library are separate records."
  - "Inspect the original image when possible. A screenshot, edited export, or social download may contain less EXIF than the camera file."
  - "If one app shows only five fields, the file may still contain dozens more. Check the exact same file in a full metadata viewer."
faqs:
  - question: "What is the simple definition of EXIF metadata?"
    answer: "EXIF metadata is information stored inside an image by a camera, phone, scanner, or editing app. It can describe the device, capture settings, date, orientation, software, and GPS location."
  - question: "Is EXIF the same as photo metadata?"
    answer: "No. EXIF is one type of photo metadata. A file may also contain XMP, IPTC, ICC color information, file-system dates, or records kept outside the image by a photo app."
  - question: "How can I view EXIF metadata?"
    answer: "Choose the original image in an EXIF viewer and inspect its camera, capture, date, and GPS sections. Built-in phone and computer panels usually show a shorter summary."
  - question: "Why does my photo show no EXIF data?"
    answer: "It may be a screenshot, scan, edited export, or processed social-media copy. The camera may not have written the field, or your current app may simply hide it."
  - question: "Can EXIF metadata be changed or removed?"
    answer: "Yes. Editing software and metadata tools can rewrite or delete EXIF fields. Keep an original copy if you need the old capture details, and do not treat EXIF as proof by itself."
related:
  - what-is-exif-data
  - how-to-check-metadata-of-an-image
  - how-to-find-camera-settings-from-a-photo
---

EXIF metadata is information stored inside a photo by a camera, phone, scanner, or editing app. It can record the camera model, capture date, shutter speed, aperture, ISO, orientation, software, and sometimes GPS coordinates. To view it, inspect the original image in a metadata viewer or open the photo's Info panel on your device.

That definition covers the useful part. The confusing part is that people use "EXIF" and "metadata" as if they mean every hidden fact attached to a picture. They do not.

## What is the definition of EXIF metadata?

EXIF stands for Exchangeable Image File Format, a standard for storing image and capture information inside compatible files.

Most people meet EXIF in a JPEG or HEIC photo taken by a phone or digital camera. The image pixels form the picture. The EXIF block sits alongside them and describes how or when that file was made. It does not appear on the photo unless an app chooses to show it.

A camera can write dozens or hundreds of fields. Some are familiar, such as the camera model and capture date. Others are camera-specific maker notes that a basic Info panel may ignore.

If you want a broader introduction, [What Is EXIF Data?](/blog/what-is-exif-data/) explains the common fields and privacy questions in more detail. This guide stays focused on the definition and the viewing mistakes that trip people up.

## Is EXIF the same as all photo metadata?

No. EXIF is one family of metadata, while a photo can carry several other kinds of information.

XMP may store editing history, ratings, keywords, or rights information. IPTC fields often describe the creator, caption, credit, and usage terms. An ICC profile tells color-aware software how to display color. Your computer also keeps Created and Modified dates for its local copy.

Those local dates are not EXIF. Neither is a caption saved only in Apple Photos or Google Photos. The distinction matters when an app shows a date or place but an EXIF viewer does not. Both can be correct because they may be reading different records.

Our [EXIF vs Metadata guide](/blog/exif-vs-metadata/) has a fuller comparison, including file-system and library data.

## What information can an EXIF report show?

An EXIF report can show the device, capture settings, original date, orientation, software, and GPS fields that remain in the selected file.

| EXIF field | Plain-English meaning |
| --- | --- |
| `Make` and `Model` | Camera or phone manufacturer and model |
| `LensModel` | Lens name recorded by the device |
| `DateTimeOriginal` | Date and time reported by the camera clock |
| `ExposureTime` | Shutter time, such as 1/250 second |
| `FNumber` | Aperture, such as f/2.8 |
| `ISO` | Sensitivity setting used for the shot |
| `Orientation` | How software should rotate or flip the stored pixels |
| `Software` | App or device software that last wrote the field |
| `GPSLatitude` and `GPSLongitude` | Embedded coordinates, when location recording was enabled |

No single field appears in every photo. A screenshot has dimensions but usually no lens. A camera without location hardware may never write GPS. An edited copy can keep the exposure settings while replacing the Software field.

For a focused explanation of aperture, ISO, focal length, and shutter tags, see [How to Find Camera Settings From a Photo](/blog/how-to-find-camera-settings-from-a-photo/).

## How do you view EXIF metadata in a browser?

Choose the original image in the [Image Metadata Viewer](/image-metadata-viewer/) and read the camera, capture, date, and GPS sections.

The viewer handles JPEG, PNG, WebP, HEIC, TIFF, and GIF in the current browser tab. Start with the readable summary. Search for exact tag names such as `DateTimeOriginal`, `Model`, `LensModel`, `ISO`, `FNumber`, `ExposureTime`, `GPSLatitude`, or `Software` when you need one answer.

Use the exact file you plan to investigate or share. Two thumbnails that look identical can have different metadata. A hash and file size help confirm whether you are comparing the same bytes rather than an original and a compressed copy.

## How do you view EXIF on a phone or computer?

Open the photo's Info or Details panel for a quick summary, then use a full viewer when the built-in panel omits a field you need.

On iPhone, open Photos and swipe up or tap the information button. On many Android phones, open the image in Google Photos or Gallery and choose Details. Windows exposes a subset under Properties and Details. On a Mac, Preview's Show Inspector usually reveals more camera EXIF than Finder.

The menu names can change, and phone makers do not all expose the same list. Use our [iPhone EXIF guide](/blog/how-to-view-exif-data-on-iphone/), [Android EXIF guide](/blog/how-to-view-exif-data-on-android/), or [Mac metadata guide](/blog/how-to-view-photo-metadata-on-mac/) for device-specific steps.

## Why can two apps show different EXIF fields?

Each app chooses which tags to read and display, so a short Details panel does not prove that the hidden fields are absent.

One viewer may show six friendly values. Another may expose native EXIF, XMP, IPTC, maker notes, thumbnails, and color information. Even when both apps read the same tag, one may display `0.004 seconds` while the other shows `1/250`.

This mismatch came up in a [Nextcloud discussion where the web interface showed EXIF but the Android app did not](https://www.reddit.com/r/NextCloud/comments/1qri69p/nextcloud_android_app_exif_data/). The suggested workaround was another gallery app with metadata support. The file may not have changed at all. Check it in a second viewer before deciding the metadata vanished.

## Why can Google Photos data appear in a sidecar file?

Google Photos can keep library changes outside the image, so an exported JSON sidecar may contain information that was never embedded as EXIF.

People often unzip a Takeout archive, see JSON files, and assume Google removed all EXIF from the photos. A [Reddit discussion about fixing Google Photos metadata](https://www.reddit.com/r/googlephotos/comments/1usf6nc/i_built_a_cli_tool_to_fix_google_photos_metadata/) reached a more precise answer. Existing embedded EXIF usually stayed in the media, while some edits to dates, descriptions, or locations lived in sidecars.

Inspect the image and sidecar separately. A JSON date beside a JPEG is not automatically the JPEG's `DateTimeOriginal`. Tools can merge selected sidecar values into files, but that creates a new metadata record. It does not uncover untouched camera evidence.

## Why might an original-looking photo have no EXIF?

Some images start with little camera EXIF because they came from screenshots, scanners, graphics software, or export workflows rather than a digital camera.

Film scans are a good example. In an [AnalogCommunity discussion, a photographer described JPEG lab scans with blank camera fields](https://www.reddit.com/r/AnalogCommunity/comments/1u3libe/i_built_filmtag_an_opensource_tool_to_batchinject/). The scanner created the digital image, so it could not know the film camera, lens, aperture, or shutter speed unless someone entered those details later.

A missing field has several possible explanations. The device never wrote it, an app removed it, the selected copy differs from the original, or the current viewer hides it. EXIF can tell you what is present. It cannot explain an absence with certainty.

## Can EXIF metadata be edited or removed?

Yes. Metadata tools and photo editors can change or delete EXIF without visibly changing the picture.

That is useful when a camera clock was wrong or when GPS should not leave your device. It also means an EXIF date, author name, or camera model is context rather than proof. Compare it with the file history and other evidence when accuracy matters.

Before sharing a personal image, run the outgoing copy through the [Image Privacy Checker](/image-privacy-checker/). If it contains GPS, owner names, device identifiers, or other fields you do not want to send, create a separate copy with the [Image Metadata Remover](/image-metadata-remover/). Inspect the cleaned result afterward and keep the original for your archive.

## What should you trust in an EXIF report?

Trust the report as a reading of the selected file, not as proof that every value is true or that missing data never existed.

Camera clocks can be wrong. Coordinates can be edited. Software can copy old fields into a new image. A social platform can strip a tag from its public version while your original still has it. The report answers one concrete question: what readable metadata is inside this file now?

That answer is enough to tell whether this copy still holds a capture date, camera record, or GPS coordinates. Make sure you are holding the right copy before drawing any wider conclusion.
