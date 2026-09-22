---
title: "How to Check EXIF Data in a Photo"
seoTitle: "How to Check EXIF Data: Camera Settings, Dates & GPS | ViewExif"
description: "Learn how to check EXIF data, read camera settings, dates and GPS, and work out whether missing details were removed or simply hidden by your photo app."
excerpt: "Check a photo's embedded camera settings, capture time and GPS. Then find out why another app or a shared copy might give you a different answer."
category: "EXIF basics"
tags:
  - how to check exif data
  - check photo EXIF
  - EXIF viewer
  - photo metadata
publishedAt: 2026-09-22
updatedAt: 2026-09-22
featured: false
author: "ViewExif"
# Cover: Athena Sandrini, Pexels photo 2962087. Downloaded September 22, 2026.
# https://www.pexels.com/photo/turned-on-laptop-computer-2962087/
# Pexels License: https://www.pexels.com/license/ (local 1600 x 900 WebP crop).
cover: "../../assets/blog/how-to-check-exif-data.webp"
coverAlt: "A laptop, camera and phone on a waterfront table after a photography session"
practicalTake:
  - "Open the saved photo itself, not a screenshot of it. Search its report for the specific detail you need."
  - "A blank Info panel and a completed scan with no EXIF are different results. Check the same file in a fuller viewer before assuming the data is gone."
  - "Compare the original, exported and received copies separately when you need to find where capture information disappeared."
faqs:
  - question: "Does checking EXIF data change the photo?"
    answer: "Reading EXIF does not change the image pixels or its embedded tags. ViewExif's viewer reads the selected file; creating a cleaned copy is a separate action in the remover."
  - question: "Can I check EXIF in a RAW photo?"
    answer: "Use a viewer that supports your camera's RAW format, such as the desktop version of ExifTool. ViewExif's Image Metadata Viewer supports JPEG, PNG, WebP, HEIC, TIFF and GIF, not general camera RAW input."
  - question: "Will an EXIF report always show the camera's shutter count?"
    answer: "No. Some cameras store a count in manufacturer-specific fields, while others omit it or use a different counter. An absent field does not mean the camera has taken zero photos."
  - question: "Can I check a photo's EXIF without an internet connection?"
    answer: "Yes. A locally installed metadata reader can inspect supported files offline. Do not assume a browser tool will work offline before its page and parsing files have loaded."
related:
  - what-is-exif-data
  - how-to-find-camera-settings-from-a-photo
  - how-to-remove-metadata-from-a-photo
---

To check EXIF data, open the saved photo in a metadata viewer and look for its camera settings, capture date and GPS fields. You can also use your phone's photo Info panel or your computer's file details for a shorter summary. Start with the original when possible: a screenshot or downloaded preview may no longer contain the camera's records.

EXIF is information stored inside an image, separate from the visible picture. It might tell you that a shot used ISO 800 and a 1/250-second exposure, or that a phone recorded coordinates outside your house. You don't need to understand every tag to find something useful.

## How do you check EXIF data in a browser?

Open the photo in the [Image Metadata Viewer](/image-metadata-viewer/), wait for the scan to finish, then search for the information you need.

1. Save the actual image to your device. Avoid taking a screenshot of the photo.
2. Choose the file in ViewExif or drop it into the upload area. The image viewer accepts JPEG, PNG, WebP, HEIC, TIFF and GIF.
3. Read the preview and camera summary. Expand the file details or native fields when you need the original tag names.
4. Search for a term such as `ISO`, `DateTimeOriginal`, `GPS` or `Software`.

ViewExif reads the selected file locally in your browser tab. It does not send the photo to a processing server. The page does load the software it needs to parse the file, so that is different from saying the website makes no network requests.

Check the scan status before interpreting an empty section. If parsing failed or you canceled the scan, the report cannot tell you that a field is absent. Let it finish or try again.

## Can you check EXIF with the apps you already have?

Yes. Built-in photo apps usually show enough to check a camera model, exposure setting or date, though they don't show every embedded field.

On iPhone, open the photo in Photos and swipe up or tap Info. [Apple's guide](https://support.apple.com/guide/iphone/see-photo-and-video-information-iph0edb9c18f/ios) lists camera details and location among the information that may appear. On Android, [Google Photos has a Details panel](https://support.google.com/photos/answer/14216130?hl=en) you can reach by swiping up; other gallery apps may call it Info or Details.

On Windows, right-click a saved photo, choose Properties, then Details. On a Mac, open the file in Preview and use its [Inspector window](https://support.apple.com/guide/preview/view-information-about-pdfs-and-images-prvw9c94f0a4/mac). The exact fields depend on the file and app.

Use these screens for a quick look. If you're comparing contradictory dates or checking for private fields, inspect the file in a fuller reader. A friendly summary can hide distinctions that matter.

## Which EXIF fields should you read?

Read the tags that answer your question: exposure settings for photography, capture time for dates, and latitude plus longitude for location.

| You want to know | Look for | How to read it |
| --- | --- | --- |
| Which camera or lens? | `Make`, `Model`, `LensModel` | The device or lens recorded in the file |
| What exposure settings? | `ExposureTime`, `FNumber`, `ISO` | For example, 1/250 second, f/4 and ISO 800 |
| When was it taken? | `DateTimeOriginal`, `OffsetTimeOriginal` | Camera capture time and its time-zone offset, if present |
| Where was it taken? | `GPSLatitude`, `GPSLongitude`, their reference fields | Coordinates with north/south and east/west directions |
| Which software handled it? | `Software` | A software label, not a complete editing history |

These are stored claims, not fresh measurements. A camera with the wrong clock can write the wrong capture date. A file's Created date can describe when you downloaded that copy rather than when someone took the picture.

For GPS, don't copy bare numbers without checking the directions. South and west become negative values in signed decimal coordinates. If either coordinate is missing, you don't have a complete location.

The [ExifTool tag reference](https://exiftool.org/TagNames/EXIF.html) documents these names. Our guide to [finding camera settings from a photo](/blog/how-to-find-camera-settings-from-a-photo/) explains exposure details without requiring you to learn the rest of the report.

## Why does one app show no EXIF while another does?

The first app may hide the fields or lack support for that file. Test the exact same image in another reader before concluding that its EXIF disappeared.

One [Canon 450D owner on Reddit](https://www.reddit.com/r/AskPhotography/comments/1eddang/exif_data_suddenly_missing_when_transferring/) thought their photos had stopped retaining camera and lens information. Even files still on the memory card appeared to lack it. The fix was in Finder's preview settings: the option to display EXIF had switched off. The author returned to confirm that enabling it solved the problem.

In that case, the information was still there. Try a second viewer on the same file before exporting, converting or attempting to repair anything. If both completed scans show no readable EXIF, look for an earlier copy rather than changing display settings indefinitely.

Also distinguish EXIF from the rest of [photo metadata](/blog/exif-vs-metadata/). An app may show a caption stored in XMP, or a date saved only in its library. Those values do not necessarily belong to the file's EXIF block.

## How do you check whether sharing removed EXIF?

Inspect the original, the exported copy and the recipient's downloaded file separately. This tells you which step lost the fields.

A [photography-contest entrant on Reddit](https://www.reddit.com/r/mobilephotography/comments/16vepdm/how_to_preserve_exif_data_on_an_edited_photo/) needed to send an image through WhatsApp with EXIF intact. They reported missing information after trying both photo and document sending, and asked whether editing could be responsible. A reply blamed WhatsApp, but the thread didn't establish where the loss happened.

For that situation, pick two recognizable fields, such as camera model and capture time. Check them in the camera original first, then in the editor's export. If the export already lacks them, changing the messaging option cannot bring them back. If the export still has them, check the file downloaded at the other end rather than the chat preview.

Our [WhatsApp EXIF guide](/blog/does-whatsapp-remove-exif-data/) covers the sharing choices. The useful habit applies to any service: check the received file. An unchanged filename or a picture that looks identical does not confirm that its embedded data survived.

## Can you inspect EXIF with a desktop command?

Yes. After installing ExifTool, run this read-only command on a local photo to list readable metadata with its group names:

```sh
exiftool -a -G1 -s "photo.jpg"
```

Replace `photo.jpg` with your file's path. This command reads metadata; it does not rewrite the photo.

The flags help when different records use the same name: `-a` includes duplicate tags, `-G1` shows their groups, and `-s` prints tag names. [ExifTool's FAQ](https://exiftool.org/faq.html#Q3) explains why a shorter default report can hide duplicates.

You might see both EXIF and XMP dates, for example. Keep the group labels when comparing them. Two different values deserve a closer look at the file's history; neither automatically wins because it appears first.

## Can EXIF prove a photo is genuine?

No. EXIF can help explain a photo, but ordinary metadata is editable and does not prove authorship or authenticity.

A Software tag naming an editor tells you the file contains that label. It doesn't tell you whether someone made a small crop or replaced half the scene. Missing EXIF is equally inconclusive: sharing apps, screenshots and deliberate privacy cleanup can all leave little camera information.

Keep an untouched original if the details matter. Record which copy you inspected and where it came from. Don't turn an empty camera field into a claim that an image is fake, or a plausible camera model into proof that it isn't.

## What should you check before sending the photo?

Check the outgoing file for location and identifying details, then inspect any cleaned copy before you share it.

The [Image Privacy Checker](/image-privacy-checker/) checks JPEG, PNG and WebP metadata for items such as GPS, names, device identifiers and previews. Other supported image formats can still be inspected in the image viewer. A single coordinate can matter more than a long list of exposure settings.

Use the [Image Metadata Remover](/image-metadata-remover/) when you want a separate cleaned copy. Read its verification result and any residual-field warnings rather than assuming the download contains nothing private. Necessary display information can remain.

Finally, look at the picture itself. Removing GPS won't hide a street sign, an address label or a notification on a screen. Metadata cleanup changes embedded records, not what someone can see in the image.
