---
title: "How to View EXIF Data on Android"
seoTitle: "How to View EXIF Data on Android: Photos, GPS, and Camera Info | ViewExif"
description: "Learn how to view EXIF data on Android in Google Photos, check camera details and GPS, and inspect the original file when gallery apps omit fields."
excerpt: "Open a photo's Info or Details panel for a quick look, then inspect the original file when you need the complete EXIF, GPS, XMP, or IPTC record."
category: "EXIF basics"
tags:
  - How to View EXIF Data on Android
  - Android photo metadata
  - EXIF data Android
  - Google Photos metadata
publishedAt: 2026-08-30
updatedAt: 2026-09-05
featured: false
author: "ViewExif"
cover: "../../assets/blog/how-to-view-exif-data-on-android.webp"
coverAlt: "An Android smartphone camera screen used to take a photo before checking its EXIF data"
practicalTake:
  - "In Google Photos, open the picture and swipe up or tap More, then About. Samsung Gallery usually puts the same basics under Details."
  - "The info panel is only a summary. Check the original file in a full metadata viewer when you need exact GPS, XMP, IPTC, or native EXIF tags."
  - "A photo shown on a map may use an app estimate instead of embedded GPS. Inspect the file itself before treating the location or date as evidence."
faqs:
  - question: "How do I see EXIF data on an Android phone?"
    answer: "Open the photo in Google Photos, swipe up or tap More, then About. In Samsung Gallery, open the image and swipe up or choose Details. The menu name may differ on other phones."
  - question: "Can Android photos contain GPS coordinates?"
    answer: "Yes. If the camera had location permission and geotagging was enabled, the photo may contain GPS latitude and longitude. A map in an app can also come from an estimated or manually added location."
  - question: "Why is EXIF data missing on Android?"
    answer: "The file may be a screenshot, chat download, social media copy, edited export, or image that never had camera EXIF. Some gallery apps also hide fields that still exist in the file."
  - question: "Can I view full EXIF data in Google Photos?"
    answer: "Google Photos shows a useful summary, but not every native EXIF, XMP, IPTC, maker note, or GPS field. Use a full metadata viewer for the complete readable report."
  - question: "Can I remove EXIF data on Android before sharing?"
    answer: "Yes. Create a separate cleaned copy with a metadata remover, then inspect that new file again. Keep the original if you still need its capture date, camera settings, or location for your archive."
related:
  - how-to-view-exif-data-on-iphone
  - how-to-check-metadata-of-an-image
  - how-to-remove-gps-data-from-photos-before-sharing
---

To view EXIF data on Android, open the photo in Google Photos and swipe up, or tap **More** and then **About**. You can usually see the capture date, dimensions, camera model, lens, aperture, shutter speed, ISO, and location when those fields exist. Samsung Gallery and other phone makers use slightly different menus, often called **Details** or **Info**.

That screen is a summary. If you need the complete Android photo metadata, inspect the original image file in a full viewer. The app may omit fields even when the file still contains them.

## How do you view EXIF data in Google Photos?

Open the photo in Google Photos, swipe up, or tap **More** and then **About** to reveal the information panel.

The panel normally shows the file name, date and time, dimensions, storage size, camera details, and a map when Photos has a location. Camera photos may also show the lens, focal length, aperture, shutter speed, and ISO. A saved web image or chat attachment usually has less.

Google changes labels occasionally, but the swipe-up gesture has stayed the quickest route. If you see an edit icon next to the date or location, remember that editing the value in Google Photos does not always rewrite the original file. Google's own [Android photo editing help](https://support.google.com/photos/answer/6128850?co=GENIE.Platform%3DAndroid&hl=en) says a downloaded copy may still show the date written by the camera.

## How do you view EXIF data in Samsung Gallery?

Open the picture in Samsung Gallery, swipe up, or tap the three-dot menu and choose **Details**.

Samsung's panel can show the date, file path, dimensions, size, camera model, exposure settings, and location. The exact rows depend on the phone, One UI version, and image. Older Galaxy phones used **Gallery > three dots > Details**, which is also the answer Galaxy owners gave in a [Reddit thread about finding EXIF on a Note 8](https://www.reddit.com/r/GalaxyNote8/comments/7z0kdn/how_can_i_read_the_exif_metadata_on_the_photos_i/).

The menu may move after an update. If swiping up does nothing, look for **Details**, **Info**, or an **i** icon. Motorola, Xiaomi, Oppo, and other gallery apps do not all expose the same fields.

## What EXIF fields can an Android phone show?

Android gallery apps usually show a short set of camera, exposure, time, file, and location details.

| Field | What it means |
| --- | --- |
| Camera model | The phone or camera written into the image |
| Lens or focal length | The lens module and field of view used for the shot |
| ISO | The sensor sensitivity value recorded for the exposure |
| Aperture | The lens opening, shown as an f-number such as f/1.8 |
| Shutter speed | How long the sensor collected light |
| `DateTimeOriginal` | The capture time stored by the camera |
| GPS latitude and longitude | Embedded coordinates when geotagging was enabled |
| Software | The camera, editor, or exporter that last wrote the field |

These values are useful, but they are editable. A camera model or date can help explain a file; it does not prove who took the photo or whether the visible scene is genuine. For a plain-language overview of the tags, read [what EXIF data contains](/blog/what-is-exif-data/).

## Why does one Android app show more metadata than another?

Apps read different tag sets, so a short Info panel does not mean the file has no other metadata.

Google Photos might show the camera and map while a file manager shows only size and modified date. A self-hosted gallery may index EXIF on its web page but omit it from the Android client. That exact mismatch came up in a [Nextcloud Android discussion](https://www.reddit.com/r/NextCloud/comments/1qri69p/nextcloud_android_app_exif_data/): the user could read EXIF on the web, not in the phone app. The reply suggested a gallery client with metadata support.

Nothing in that report proves the bytes changed. The two apps simply exposed different views. This is why an empty row in one gallery is a weak answer. Check the original file with another reader before deciding the metadata is gone.

## How do you inspect the complete original file?

Locate the original image in device storage, then open that exact file in the [Image Metadata Viewer](/image-metadata-viewer/).

The viewer can read JPEG, PNG, WebP, HEIC, TIFF, and GIF in the current browser tab. It groups familiar details and still lets you search the native fields for `GPS`, `DateTimeOriginal`, `Software`, `Artist`, `XMP`, or `IPTC`.

Choose carefully if the image exists in several places. The thumbnail inside a message, a version saved from Google Photos, and the camera original in `DCIM/Camera` may look identical while carrying different metadata. It is easy to inspect the chat copy while comparing it with details remembered from the camera original.

Our broader guide to [checking image metadata](/blog/how-to-check-metadata-of-an-image/) explains how to separate capture dates from file dates and how to read fields outside EXIF. If you also use an Apple device, the [iPhone EXIF guide](/blog/how-to-view-exif-data-on-iphone/) covers its built-in Info panel.

## Why does Google Photos show the wrong date?

Google Photos may fall back to an upload or file date when the image lacks a usable embedded capture time.

You usually notice this after moving an old library, extracting a backup, or saving pictures from a chat. The file system's Created and Modified dates can change during copying. `DateTimeOriginal`, when it survives inside the image, is more portable.

A recent [Google Photos Reddit discussion](https://www.reddit.com/r/googlephotos/comments/1r5lrdc/metadata_in_google_photos/) captures the confusion well. One user noticed re-uploaded albums finally appearing under their old dates. A commenter explained that Google Photos uses embedded EXIF time when it exists, then falls back when it does not. Another user pointed out that Photos can also display an edited date from its own interface.

So check both layers. Read what Google Photos displays, then inspect the downloaded file if the distinction matters. A date in the library and a date inside the image are not automatically the same record.

## How do you check GPS metadata on Android?

Look for a map in the photo's Info panel, then inspect GPS latitude and longitude in the file to confirm the coordinates are embedded.

Google Photos can use three kinds of location: coordinates saved by the camera, a location you added, or an estimate based on other information. Its [location help page](https://support.google.com/photos/answer/6153599?co=GENIE.Platform%3DAndroid&hl=en) makes that distinction explicit. A pin in the app does not always mean the JPEG contains GPS.

Use the [Image Privacy Checker](/image-privacy-checker/) when the question is whether the file itself could reveal a place. It flags embedded coordinates and other sensitive fields. If no GPS tags exist, EXIF cannot recover an exact location. The pixels may still reveal a street sign, house number, school badge, or familiar landmark.

## Why can a downloaded or shared photo lose EXIF?

The receiving copy can lose EXIF when an app resizes, recompresses, exports, or rebuilds the image before saving it.

This is common with chat attachments, social media downloads, edited copies, and screenshots. The original in `DCIM/Camera` may keep the full camera record while the version in `Downloads` contains only dimensions and a new file date. Sending as a document or file sometimes preserves more than sending through a photo picker, but behavior varies by app and version.

Do not try to infer the original fields from a stripped copy. Once the coordinates or capture time are absent, another viewer cannot recreate them. Compare the camera original with the received file if you need to know what changed.

## When Gallery, Google Photos and the file disagree

First identify the app showing the information. A manufacturer's Gallery, Google Photos and a file manager need not read the same sources or show the same fields. A place assigned in a cloud library can differ from GPS embedded in the exported image.

Save the copy you actually intend to inspect and read it in the viewer. A blank gallery panel calls for checking native fields; a parser warning calls for resolving a reading problem. Neither result alone means the camera never wrote EXIF. Keep app-level corrections separate from file-level values when deciding what will travel in an attachment.

## What should you do before sharing an Android photo?

Inspect the exact outgoing file, remove private fields from a copy, and verify that cleaned copy before sending it.

Do not rely on the destination app to strip GPS for you. Its behavior can change, and a different share option may handle the file differently. If the privacy report finds coordinates, names, device identifiers, or editing notes, use the [Image Metadata Remover](/image-metadata-remover/) to make a separate copy.

Keep the original in your archive if its date and camera settings matter. Then reopen the cleaned file in the viewer. A filename ending in `clean` is only a label; the second scan is what tells you whether the fields are actually gone. For a phone-focused checklist, see [how to remove GPS data before sharing](/blog/how-to-remove-gps-data-from-photos-before-sharing/).
