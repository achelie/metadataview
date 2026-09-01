---
title: "How to View Photo Metadata on Mac"
seoTitle: "How to View Photo Metadata on Mac: EXIF, GPS & Dates | ViewExif"
description: "Learn how to view photo metadata on Mac using Finder, Preview, and Photos, then inspect complete EXIF and GPS data from the original image file."
excerpt: "Use Finder for a quick file summary, Preview or Photos for camera details, and a full metadata viewer when macOS leaves out EXIF or GPS fields."
category: "EXIF basics"
tags:
  - How to View Photo Metadata on Mac
  - Mac photo metadata
  - EXIF data on Mac
  - view image metadata macOS
publishedAt: 2026-09-01
updatedAt: 2026-09-01
featured: false
author: "ViewExif"
cover: "../../assets/blog/how-to-view-photo-metadata-on-mac.webp"
coverAlt: "A MacBook beside a camera for checking photo metadata on Mac"
practicalTake:
  - "Select a photo in Finder and press Command-I for a quick check. Open it in Preview and choose Tools > Show Inspector when you need camera EXIF or GPS."
  - "Photos may show library information that Finder does not. Inspect the exported original file before deciding that a field was removed."
  - "Created and Modified dates belong to the current file copy. Look for DateTimeOriginal when you want the camera's recorded capture time."
faqs:
  - question: "How do I view photo metadata on a Mac?"
    answer: "Select the image in Finder and press Command-I for basic details. For more EXIF, open the photo in Preview, choose Tools > Show Inspector, then check the Exif and GPS tabs when available."
  - question: "Does Finder show all EXIF data?"
    answer: "No. Finder usually shows a small selection of file and image details. A field can still exist in the photo even when Finder does not display it."
  - question: "How can I see GPS coordinates for a photo on Mac?"
    answer: "Open the original image in Preview and check Tools > Show Inspector for a GPS tab, or inspect it in a full metadata viewer. Photos may show a map without exposing the exact embedded tags."
  - question: "Why is photo metadata missing on my Mac?"
    answer: "The image may be a screenshot, social download, edited export, or copy that had metadata removed. Finder may also hide fields that are still present in the file."
  - question: "Can I remove photo metadata on a Mac before sharing?"
    answer: "Yes. Make a separate cleaned copy with a metadata remover, then inspect that copy again. Keep the original if you still need its capture date, location, or camera settings."
related:
  - how-to-check-metadata-of-an-image
  - how-to-tell-when-a-photo-was-taken
  - how-to-view-exif-data-on-iphone
---

To view photo metadata on a Mac, select the image in Finder and press **Command-I** for a quick summary. For camera EXIF and GPS, open the photo in Preview, choose **Tools > Show Inspector**, and check the available detail tabs. The Photos app also shows dates, camera settings, and a map when it has location information.

Those three views do not always agree because they do not show the same data. If a field matters, inspect the original image file rather than assuming a blank Finder row means the metadata is gone.

## How do you view photo metadata in Finder?

Select the photo, press **Command-I**, and expand **More Info** to see the image details Finder has indexed.

Finder is the fastest place to start. You may see dimensions, color space, profile, resolution, device make and model, focal length, exposure time, aperture, ISO, and content creation date. The exact list changes with the format and macOS version.

You can also switch a folder to Gallery view and show the Preview pane. That is handy when checking several pictures, but it is still a summary. Finder does not expose every EXIF, XMP, IPTC, or maker-note field stored in the file.

This limitation frustrates real users. In an [r/MacOS discussion about viewing media metadata in Finder](https://www.reddit.com/r/MacOS/comments/1e2hkvq/how_can_i_see_metadata_of_photos_and_videos_in/), one person could see a recorded date and GPS in iCloud Photos but not after checking the downloaded original in Finder. A reply noted that Finder's **More Info** section only shows a subset. Another user found the data with ExifTool, confirming that Finder had hidden it rather than the download stripping it.

## How do you inspect EXIF data in Preview?

Open the image in Preview, choose **Tools > Show Inspector**, then use the information tabs to check EXIF and GPS data.

Preview usually gives you more than Finder without installing an app. In the Inspector window, look for the **i** or More Info area. Depending on the photo, separate tabs can appear for general image details, EXIF, GPS, JFIF, TIFF, or other records.

The EXIF tab may show the camera model, lens, focal length, ISO, aperture, shutter speed, flash, software, and capture date. If the file contains coordinates that Preview recognizes, a GPS tab may show latitude, longitude, altitude, and a map link.

Not every tab appears for every file. A PNG screenshot will not suddenly gain camera settings. A JPEG from a camera may have dozens of fields. HEIC support also depends on what the file contains and what the current macOS release chooses to display.

## What photo metadata can you see in Photos?

Select a picture in Photos and press **Command-I** to see its date, filename, camera information, settings, caption, and location when available.

Photos is better than Finder when the image already lives in your library. Its Info window can show the camera and lens, megapixels, dimensions, file type, ISO, focal length, exposure, aperture, and a map. You can also edit the displayed date, time, caption, keywords, and location.

Photos can keep information around the asset as well as tags inside the image bytes. A map in Photos does not automatically prove that the exported JPEG contains GPS. An adjusted library date may not rewrite `DateTimeOriginal` inside an unmodified original either.

If you need to inspect the file itself, export the unmodified original and check that output. Do not use a screenshot of the Photos window or a dragged preview copy as a substitute.

## Which Mac metadata view should you use?

Use Finder for a quick file check, Preview for built-in EXIF, Photos for library context, and a full viewer for the complete readable file record.

| Mac view | Good for | Main limitation |
| --- | --- | --- |
| Finder Get Info | Size, dimensions, basic camera and file details | Shows only indexed fields |
| Finder Preview pane | Comparing a folder of images quickly | Uses another short summary |
| Preview Inspector | Camera EXIF and embedded GPS | Does not expose every native tag |
| Photos Info | Library date, camera settings, captions, and map | Can mix library data with file data |
| ViewExif | Searchable EXIF, GPS, XMP, IPTC, hashes, and native fields | You must choose the exact file you want to inspect |

The built-in apps are fine for everyday questions. A blank row in Finder, though, is not a complete inventory of the file.

## Why can Photos and Finder show different details?

Photos can display library records while Finder reads indexed properties from a file, so the two apps may expose different facts about the same-looking image.

A picture may exist as an original in Photos, an edited version, an iCloud-optimized asset, and a downloaded export. Each copy has its own bytes and file dates. Finder sees the copy you selected. Photos knows about the library item and may retain a location or adjusted date separately.

The Reddit thread above is a useful example: Finder failed to show metadata that another reader found in the file. A separate [Mac user asking for detailed JPEG EXIF](https://www.reddit.com/r/ricohGR/comments/1o1xb7e/see_detailed_metadata_exif_data_in_jpg_files_on/) ran into the same basic wall. macOS offers convenient summaries, but a summary is not an absence test.

When two views disagree, identify the exact file path first. Then compare the original, edited export, and downloaded copy one at a time.

## How do you check the complete original file?

Drop the original image into the [Image Metadata Viewer](/image-metadata-viewer/) and search its report for the field you actually need.

The viewer reads JPEG, PNG, WebP, HEIC, TIFF, and GIF locally in the current browser tab. Search for `DateTimeOriginal`, `GPSLatitude`, `GPSLongitude`, `Make`, `Model`, `LensModel`, `Software`, `Artist`, `XMP`, or `IPTC`. You can inspect the friendly sections first and open the native fields when the Mac panels leave something out.

Choose the right copy. An image exported from Photos with edits may not match the unmodified original. A file saved from Messages may not match what the sender kept. If you are unsure, compare both reports instead of trying to remember what one app showed earlier.

Our broader guide to [checking image metadata](/blog/how-to-check-metadata-of-an-image/) explains how EXIF differs from file-system dates and other photo metadata.

## Which date and GPS fields should you trust?

Start with embedded `DateTimeOriginal` and GPS coordinates, then compare them with the file history because both can be missing, wrong, or edited.

Finder's Created date may be the day you downloaded the image. The Modified date may be the last export. `DateTimeOriginal` usually records what the camera clock said when the shutter fired. A [Reddit discussion about DateTimeOriginal on macOS](https://www.reddit.com/r/MacOS/comments/1t50ycz/date_time_original/) centered on exactly that distinction between the date inside EXIF and the dates attached to a local copy.

The guide to [telling when a photo was taken](/blog/how-to-tell-when-a-photo-was-taken/) shows how to compare those values. For location, exact `GPSLatitude` and `GPSLongitude` tags are stronger evidence that coordinates are embedded than a map shown by a library app. They are still editable, so neither a date nor a pin proves a claim by itself.

## Why can metadata disappear after export or download?

An editor, messenger, website, or export option may rebuild the image and leave some metadata behind.

Photos can export an unmodified original or create a new rendered file. Social platforms often resize uploads. Screenshots are new images. Messaging apps may send a compressed photo through one route and preserve more data when you send the original as a file.

Once a field is removed from a copy, Preview cannot recover it. Check a backup, the Photos original, or the camera card. Installing a different viewer only helps when the field is present but hidden by the current app.

A missing camera row does not make the file anonymous. It may still contain XMP, a creator name, editing software, a thumbnail, or coordinates that Finder never displayed.

## How do you remove private photo metadata on Mac?

Inspect the outgoing copy, remove sensitive fields from a duplicate, and scan that cleaned file again before sharing it.

Run the exact file you plan to send through the [Image Privacy Checker](/image-privacy-checker/). It can flag GPS coordinates, names, device details, timestamps, and editing traces. If something should not travel, use the [Image Metadata Remover](/image-metadata-remover/) to make a separate cleaned copy.

Keep the original if its capture date and location matter to your archive. Then reopen the cleaned output in the viewer. That final check is more reliable than assuming Preview, Finder, or the destination platform removed everything for you.

If you also handle the same library on a phone, the [iPhone EXIF guide](/blog/how-to-view-exif-data-on-iphone/) explains what Apple's mobile Info panel shows and where it stops.
