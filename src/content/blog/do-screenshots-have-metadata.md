---
title: "Do Screenshots Have Metadata? What iPhone, Android, Windows, and Mac Save"
description: "Screenshots usually drop the original photo's GPS and camera EXIF, but they can still carry file, time, color, and software metadata."
excerpt: "A screenshot is a new image, not a copy of the original file. It usually drops camera EXIF and GPS, but it is not blank or anonymous."
category: "Image privacy"
tags:
  - screenshots
  - EXIF
  - image privacy
  - GPS metadata
publishedAt: 2026-08-09
updatedAt: 2026-08-09
featured: true
author: "ViewExif Editorial Team"
reviewedBy: "ViewExif Product Engineering"
cover: "../../assets/blog/do-screenshots-have-metadata.webp"
coverAlt: "A hand using a smartphone on a wooden desk with a sharing menu visible on the screen"
practicalTake:
  - "A screenshot is a new file, so it normally does not copy the original photo's camera model, lens settings, or GPS tags."
  - "It can still contain its own dimensions, color profile, dates, software markers, and other technical fields."
  - "Check the pixels too. Removing metadata will not hide a map, notification, username, address, or face shown on screen."
faqs:
  - question: "Do screenshots contain GPS location data?"
    answer: "Usually not. A normal screenshot does not use the camera, so it normally has no camera GPS tags. An app or later edit can still add location data."
  - question: "Does taking a screenshot remove EXIF metadata?"
    answer: "It usually leaves the original image's camera EXIF behind because the device creates a new file from the pixels on screen. The screenshot can have metadata of its own."
  - question: "Can someone find my location from a screenshot?"
    answer: "Yes, even without GPS. A map, street name, weather location, notification, Wi-Fi name, or account screen can reveal where you are."
  - question: "Do iPhone screenshots include location metadata?"
    answer: "A normal iPhone screenshot usually has no camera GPS EXIF. Photos, Shortcuts, editors, and export apps can change the final file, so check the copy you will send."
  - question: "Does cropping a screenshot remove its metadata?"
    answer: "Not reliably. Some editors create a fresh file, while others keep or add fields. Cropping also does not hide private details that remain visible."
related:
  - does-whatsapp-remove-exif-data
  - does-instagram-remove-exif-data
  - does-discord-remove-exif-data
---

Yes, screenshots have metadata. They just tend to have less of it than camera photos.

When you take a screenshot, your phone or computer creates a new image from the pixels on screen. It normally does not copy the original photo's camera model, lens settings, or GPS coordinates. The new file can still contain its own size, dimensions, color profile, date, and software details.

That makes a screenshot a useful sharing copy, but not a privacy guarantee. Apps and editors can add fields later, and the image itself may show more than the metadata does.

## What a screenshot usually keeps

| Detail | Camera photo | Screenshot |
| --- | --- | --- |
| GPS coordinates | May be embedded | Usually not copied |
| Camera and lens | Common in EXIF | Usually absent |
| Date and time | May store capture time | May store a new file or creation time |
| Dimensions | Photo resolution | Captured screen area |
| Color profile | Often present | Often present |
| Software details | Camera or editor | Screenshot tool or editor |

A screenshot can move through Photos, a chat app, an editor, or a cloud service before you share it. Each step can create a different file. A social platform may strip most fields, but email or direct file sharing may leave them alone.

Check the final copy, not an earlier version that merely looks the same.

## What iPhone, Android, Windows, and Mac save

### iPhone and iPad

An ordinary iPhone or iPad screenshot normally has no camera GPS or lens data. It can include dimensions, color information, and a creation date. Photos may also hold library information that is separate from the metadata embedded in the image file.

Markup, Shortcuts, and third-party editors can change the result. If you export the same screenshot through two apps, the files may look identical but contain different fields.

### Android

Android varies by phone maker. Many devices save screenshots as PNG, while some use JPEG or another format. The filename often carries the date even when the file itself does not.

A [Reddit discussion in r/Android](https://www.reddit.com/r/Android/comments/7b1cb2/til_android_screenshots_dont_include_any_metadata/) compared an Android PNG with an iOS screenshot. The Android file had no embedded creation date, while the iOS file had an XMP date. Replies pointed out that other phones used JPEG and behaved differently. It is a good example of why one phone's result should not become a rule for every Android device.

### Windows

Snipping Tool creates a new image with normal technical details such as width, height, bit depth, and file dates. Saving it again in Paint or Photos may rewrite the file or add a software marker.

Windows Properties also shows filesystem details. Those can change when you copy or download a file, even if its embedded metadata stays the same.

### macOS

macOS normally saves screenshots as PNG files. The default filename includes a date and time, and the image can contain dimensions and a display color profile.

One [r/privacy user asked whether a Mac screenshot automatically scrubs the original image](https://www.reddit.com/r/privacy/comments/1amghzo/does_screenshot_on_macos_scrub_exifmetadata/). The clearest reply made the important distinction: macOS does not copy the metadata from the image on screen, but the screenshot still has metadata of its own.

## What people are actually worried about

Reddit posts on the topic tend to ask one practical question: what does the other person receive?

In another [r/privacy discussion about files, photos, and screenshots](https://www.reddit.com/r/privacy/comments/ubrsu6/metadata_stored_on_filesjpegscreenshots/), the poster worried that a Mac screenshot might expose their name or computer details. The replies kept coming back to two points:

- Finder or Windows may show local file information that is not embedded in the image.
- The sharing route matters. Email may send the original file, while a social app may convert it first.

Looking at an Info panel on your own computer does not tell you exactly what a recipient will see. Assuming that a platform will clean the file for you is not reliable either.

## A screenshot can reveal location without GPS

Hidden fields are only half the problem. A screenshot may visibly show:

- a map pin, route, street name, or delivery address;
- a weather location or Wi-Fi network name;
- notification previews, email addresses, and phone numbers;
- usernames, profile photos, browser tabs, or account IDs;
- faces, documents, QR codes, and workplace tools.

Removing EXIF will not touch those pixels. Crop them out or cover them with an opaque block. A translucent highlighter is not a safe redaction.

## How to check the file you will share

You do not need to upload the screenshot to a server.

1. Open the [Image Metadata Viewer](/image-metadata-viewer/) and choose the exact screenshot you plan to send.
2. Search the report for `GPS`, `location`, `author`, `software`, `date`, and `comment`.
3. Use the [Image Privacy Checker](/image-privacy-checker/) to flag fields that may reveal a person, device, or place.
4. Look at the screenshot at full size and check every visible corner yourself.

The tools run in the current browser tab. They do not use OCR or face recognition, so the pixel check is still your job.

## How to make a cleaner copy

If the report finds metadata you do not want to share, use the [Image Metadata Remover](/image-metadata-remover/) to make a separate copy. Keep the original for yourself.

Then inspect the cleaned file again. This catches fields that a format needs to preserve and confirms that you are checking the actual download, not the source image. Rename the copy too if its filename contains a name, date, or project title.

A screenshot normally drops the original photo's camera EXIF and GPS, but it still deserves one quick check before you send it.
