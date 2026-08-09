---
title: "Do Screenshots Have Metadata? What iPhone, Android, Windows, and Mac Save"
description: "Screenshots usually drop the original photo's GPS and camera EXIF, but they can still carry file, time, color, and software metadata."
excerpt: "A screenshot is a new image, not an invisible photocopy of the original file. That usually removes camera EXIF and GPS, but it does not make the screenshot blank or anonymous."
category: "Image privacy"
tags:
  - screenshots
  - EXIF
  - image privacy
  - GPS metadata
publishedAt: 2026-08-09
updatedAt: 2026-08-09
featured: true
author: "MetadataView Editorial Team"
reviewedBy: "MetadataView product engineering"
cover: "../../assets/blog/do-screenshots-have-metadata.webp"
coverAlt: "A hand using a smartphone on a wooden desk with a sharing menu visible on the screen"
coverCredit:
  name: "ready made"
  source: "Pexels"
  url: "https://www.pexels.com/photo/crop-person-touching-smartphone-screen-while-using-application-3850268/"
practicalTake:
  - "A screenshot is a newly created image, so it usually does not inherit the camera model, lens settings, or GPS tags from the photo or app shown on screen."
  - "The screenshot can still carry its own filename, dimensions, color profile, creation time, software markers, and format-specific fields."
  - "The pixels are often the bigger privacy risk: notifications, map pins, usernames, browser tabs, and faces remain visible even when EXIF is gone."
  - "Do not guess from the file extension. Inspect the exact copy you plan to share, then remove metadata and check the cleaned copy again."
faqs:
  - question: "Do screenshots contain GPS location data?"
    answer: "Usually not. A screenshot is generated from the screen rather than captured by the camera, so it normally has no camera GPS tags. An app, editor, or photo library can still add location information later, so inspect the final file before sharing it."
  - question: "Does taking a screenshot remove EXIF metadata?"
    answer: "It usually removes the original image's camera EXIF because the operating system creates a new file from displayed pixels. The new screenshot may still contain its own technical metadata, color information, dates, or software fields."
  - question: "Can someone find my location from a screenshot?"
    answer: "They may not need GPS metadata. A screenshot can visibly show a map, address, weather location, Wi-Fi name, delivery notification, workplace tool, or other clue that identifies where you are."
  - question: "Do iPhone screenshots include location metadata?"
    answer: "An ordinary iPhone screenshot usually does not contain camera GPS EXIF. Photos, editing apps, shortcuts, or later exports may change the file, and the Photos library can hold information that is separate from the bytes embedded in the image."
  - question: "Does cropping a screenshot remove its metadata?"
    answer: "Not reliably. Some editors create a fresh file and drop fields, while others copy or add metadata during export. Cropping also does nothing to hide usernames, notifications, maps, or other sensitive pixels that remain in the image."
sources:
  - title: "Take a screenshot or record your screen on your Android device"
    publisher: "Google Android Help"
    url: "https://support.google.com/android/answer/9075928?hl=en"
  - title: "Understand, find and edit your photos' locations"
    publisher: "Google Photos Help"
    url: "https://support.google.com/photos/answer/6153599?co=GENIE.Platform%3DAndroid&hl=en"
  - title: "Use Snipping Tool to capture screenshots"
    publisher: "Microsoft Support"
    url: "https://support.microsoft.com/en-us/windows/apps/use-snipping-tool-to-capture-screenshots"
  - title: "Take a screenshot on your Mac"
    publisher: "Apple Support"
    url: "https://support.apple.com/en-us/KM204852"
  - title: "Manage location metadata in Photos"
    publisher: "Apple Personal Safety User Guide"
    url: "https://support.apple.com/en-sg/guide/personal-safety/ips0d7a5df82/web"
related: []
---

The short answer is **yes, screenshots have metadata**. The reassuring part is that a normal screenshot usually does not inherit the original photo's camera EXIF or GPS coordinates. The less reassuring part is that it is still a file created by an operating system or app, and that file can carry its own details.

That distinction matters. If you screenshot a photo taken at home, the new screenshot will usually lose the camera model, shutter speed, lens, and embedded latitude and longitude from the source photo. It may still reveal its dimensions, color profile, creation time, filename, image format, or the software that saved it. More importantly, the pixels may show a street name, map pin, notification, account name, or browser tab.

So screenshotting can reduce one kind of metadata exposure. It is not a universal privacy button.

There is one more wrinkle: the copy you share may not be the copy your device first created. Sending a screenshot through a chat app, saving it from a cloud album, pasting it into a document, or exporting it from an editor can produce another new file. That second workflow may strip fields, preserve them, or add its own software and date tags. Inspecting the original screenshot tells you about the original screenshot; it does not automatically tell you what arrived at the other end.

## A screenshot is a new image, not the original file

When you take a screenshot, the device captures what is being drawn on the display and writes those pixels into a new image. It does not normally copy the hidden EXIF block from the photo, website, map, or chat visible underneath.

Think of it like photographing a printed receipt. The new photo does not inherit the receipt printer's internal records. It does, however, get a new set of facts about how that photo was made. A screenshot works in the same broad way: old metadata is usually left behind, while a smaller set of new file metadata may appear.

The exact fields depend on the operating system, device manufacturer, screenshot utility, image format, and anything that edits the file afterward. That is why the honest answer is “usually,” not “always.”

## Original photo metadata versus screenshot metadata

| Detail | Original camera photo | New screenshot |
| --- | --- | --- |
| GPS coordinates | May be embedded by the camera | Usually not copied from the original |
| Camera make and model | Common in EXIF | Usually absent |
| Lens, ISO, aperture, shutter speed | Common in EXIF | Not relevant to a screen capture |
| Date and time | Capture time may be embedded | New file or creation time may appear |
| Dimensions | Yes | Yes, based on the captured screen area |
| Color profile | Often present | May be added by the operating system |
| Software information | Camera or editor may be named | Screenshot or editing software may be named |
| Visible private details | Whatever the camera captured | Everything visible on the screen |

This table describes common behavior, not a promise for every device. A social app may recompress a screenshot. An editor may add XMP. A cloud library may store location or inferred information in its database without embedding it in the downloaded file.

## What metadata do iPhone and iPad screenshots save?

An iPhone or iPad screenshot is normally a new image created by iOS or iPadOS. Because the camera did not take it, the screenshot usually has no lens settings, camera serial number, or camera-generated GPS coordinates.

You can still expect basic technical facts such as pixel width and height, file size, format information, and color data. The filename and the Photos library can also communicate when the screenshot was created. If you crop it, mark it up, run it through a Shortcut, or export it through another app, that workflow may add or rewrite metadata.

Apple also makes an important distinction between metadata embedded in a file and information managed by the Photos app. Photos can display, change, or remove location information for media. That does not mean every value visible inside Photos is necessarily embedded in every exported screenshot.

The practical rule is simple: check the exported file, not just the information panel inside your library.

That rule matters when you use Share, Save to Files, AirDrop, a messaging app, or an editor. Those routes can return different bytes even when the image looks identical. A library may also know when and where an item was added without writing that information into the PNG itself. Embedded metadata, library records, filenames, and filesystem dates are four different things, and privacy advice gets sloppy when it treats them as one bucket.

## What about Android screenshots?

Android creates a screenshot as a new image too, but Android is an ecosystem rather than one identical camera roll. Google, Samsung, Xiaomi, OnePlus, and other manufacturers can use different screenshot formats, filenames, folders, and editing pipelines.

Most normal Android screenshots do not copy camera EXIF or GPS from whatever appears on the display. They can still include dimensions, color information, a timestamp, compression details, or a software marker. Scrolling screenshots and screenshots edited immediately after capture may take a different route through the device's software and produce a different set of fields.

Google's Android help describes screenshots as newly captured images stored in a Screenshots collection. Google Photos can also estimate or manage location information separately. That is another reason not to treat “no GPS tag found” as proof that nobody can infer a location.

The file format also matters. PNG is common for crisp interface text, while some devices or apps may save JPEG or WebP. Each container offers different places for text, color, EXIF, or XMP data. A long scrolling screenshot can be unusually tall and may pass through a manufacturer-specific editor before it reaches the gallery. None of this means the file is dangerous by default. It means a generic claim about “all Android screenshots” is less useful than a report for the file in front of you.

## Windows screenshots have file details too

Windows Snipping Tool captures a full screen, window, rectangle, or free-form area and creates a new image. Modern Windows versions can automatically save captures to a Screenshots folder, or you can save another copy with a filename and format you choose.

The saved file normally contains technical image fields rather than camera EXIF: width, height, bit depth, color profile, compression, and file dates are the useful examples. If you continue editing in Paint, Photos, or another application, that software may rewrite the image or add its own marker.

Windows file properties can also show filesystem information that is not embedded metadata. Copying the file to another drive or downloading it again can change those filesystem dates without changing the image bytes. A metadata report should keep that difference clear.

## macOS screenshots usually start as PNG files

macOS creates a new screen image when you use the Screenshot utility or the familiar Command-Shift shortcuts. The default filename visibly includes a date and time, which is already information even before anyone inspects the file's internal fields.

The image may contain its pixel dimensions and a display color profile. It normally will not contain the original photo's camera EXIF or GPS simply because that photo happened to be visible on the screen. Markup, Preview, an automation, or a later export can change the result.

If the filename itself is sensitive, rename the sharing copy as well as checking its embedded metadata. MetadataView does not count a filename as hidden image metadata, but the person receiving the file can obviously read it.

## Can a screenshot reveal your location without GPS?

Absolutely. Metadata is only one layer of privacy.

A screenshot may visibly expose:

- a map pin, route, street name, or delivery address;
- weather for a very specific town;
- a Wi-Fi network name or workplace dashboard;
- notification previews, email addresses, and phone numbers;
- usernames, profile photos, browser tabs, or account IDs;
- the device's language, time zone, battery level, and local time;
- faces, windows, landmarks, documents, or QR codes.

Removing EXIF cannot erase any of those pixels. Blur, crop, or cover them in a flattened sharing copy, then inspect the final output at full size. Be especially careful with transparent markup: a translucent highlighter is not the same as an opaque redaction.

## How to check a screenshot before sharing it

You do not need to install an app or upload the screenshot to a server.

1. Open the [Image Metadata Viewer](/image-metadata-viewer/).
2. Drop in the exact screenshot you plan to send.
3. Review the readable summary, then search the native fields for `GPS`, `location`, `author`, `software`, `date`, and `comment`.
4. Open the [Image Privacy Checker](/image-privacy-checker/) for an evidence-based review of fields that may expose identity or location.
5. Inspect the pixels yourself. The checker deliberately does not run OCR, face recognition, or landmark detection.

Everything runs in the current browser tab. The file is not posted to an analysis API, and clearing or refreshing the page ends the session.

For a high-stakes share, repeat the check after every conversion. Renaming a file does not remove embedded fields. Copying it into a ZIP does not remove them either. A messaging service may alter the image, but you should not assume that it will. The dependable routine is boring on purpose: prepare the final copy, inspect that copy, open it to confirm it still looks right, and only then send it.

## How to remove screenshot metadata safely

If the report finds fields you do not want to share, use the [Image Metadata Remover](/image-metadata-remover/) to create a separate cleaned copy. Keep the original for yourself.

The important part is verification. A useful removal flow does not stop after producing a download. It scans the output again, lists anything preserved or left behind, and blocks a broken file. MetadataView does that comparison locally and gives you a receipt describing the result.

After cleaning, look at the image one more time. Metadata removal cannot hide a name in a notification, an address in a map, or a face in a photo. For sensitive material, treat the job as two separate checks: hidden fields and visible pixels.

## The safest answer is to inspect the final copy

Screenshots usually shed the original file's camera EXIF and GPS metadata. That makes them useful when you need a quick sharing copy, but it does not make them anonymous. They still have technical file details, later apps can add metadata, and the screen itself may reveal far more than a hidden tag ever could.

Do not build a privacy decision around what a screenshot “should” contain. Check the actual file, clean it if needed, and check the result again.
