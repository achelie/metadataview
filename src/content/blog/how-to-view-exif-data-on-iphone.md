---
title: "How to View EXIF Data on iPhone"
seoTitle: "How to View EXIF Data on iPhone: Photos, GPS & Camera Info | ViewExif"
description: "Learn how to view EXIF data on iPhone, read camera settings and GPS in Photos, inspect fuller metadata, and remove private details before sharing."
excerpt: "Your iPhone can show when and where a photo was taken, which camera and lens made it, and the settings used. Here is where to find those details and how to check the full file."
category: "EXIF basics"
tags:
  - iPhone EXIF
  - iPhone photo metadata
  - photo metadata iPhone
  - GPS metadata
publishedAt: 2026-08-19
updatedAt: 2026-08-19
featured: false
author: "ViewExif"
cover: "../../assets/blog/how-to-view-exif-data-on-iphone.webp"
coverAlt: "A person holding a smartphone and browsing a gallery of photos before checking the images for EXIF data"
practicalTake:
  - "Open a photo in the iPhone Photos app, then swipe up or tap the Info button to see the details Apple has available for that file."
  - "A map means the photo has location information in Photos, while a missing camera panel often means the file was exported, downloaded, or stripped."
  - "For a fuller report, inspect the exact file you plan to share, remove private fields from a copy, and check the cleaned copy again."
faqs:
  - question: "How do I see EXIF data on iPhone?"
    answer: "Open the photo in the Photos app, then swipe up or tap the circled Info button. The panel can show the date, file details, camera, lens, exposure settings, and location."
  - question: "Can iPhone photos contain GPS location?"
    answer: "Yes. If Camera had location access when the photo was taken, the image may contain coordinates and Photos can show the place on a map."
  - question: "Why is EXIF data missing?"
    answer: "The image may be a screenshot, an edited export, a downloaded copy, or a version rebuilt by a messaging or social app. Some files simply never contained camera EXIF."
  - question: "Can I remove EXIF data on iPhone?"
    answer: "Yes. Photos can remove a saved location or omit Location from a share. For a reusable copy without broader EXIF fields, use a metadata remover and verify the result."
related:
  - how-to-find-where-a-photo-was-taken
  - what-is-exif-data
  - how-to-remove-gps-data-from-photos-before-sharing
---

To view EXIF data on iPhone, open Photos, choose a picture, then swipe up or tap the circled **i** button. The Info panel can show the date and time, filename, dimensions, iPhone or camera model, lens, ISO, aperture, shutter speed, and a map when location data is present.

What you see depends on the file. An original camera photo usually has more iPhone photo metadata than a screenshot, edited export, or image saved from a chat. If you need the complete EXIF, XMP, IPTC, or GPS report, inspect the actual file in a full metadata viewer.

## How do you view photo information in iPhone Photos?

Open the picture, swipe up, or tap the Info button at the bottom of the screen.

The built-in steps are short:

1. Open **Photos** on your iPhone.
2. Tap the photo you want to inspect.
3. Swipe up on the photo, or tap the circled **i** button.
4. Scroll through the date, filename, camera details, and map.
5. Swipe down or tap **i** again to close the panel.

Apple's [iPhone user guide](https://support.apple.com/guide/iphone/see-photo-and-video-information-iph0edb9c18f/ios) confirms that this panel can show the capture device, date and time, camera metadata, file size, and location. Some versions of iOS also show albums, captions, people, and Visual Look Up results. Those library details are useful, but they are not all embedded EXIF fields.

If there is no camera panel or map, Photos is not hiding a secret advanced screen. That particular copy may not contain those details.

## What EXIF data can iPhone Photos show?

Photos can show the basic camera, exposure, file, time, and location details that exist for the selected image.

An original iPhone camera photo often has most of the following. A photo from another camera may show its own make and lens instead.

| Detail | What it tells you |
| --- | --- |
| Date and time | When the photo record says the picture was taken |
| Filename and size | The saved name and storage size of this copy |
| Dimensions | The image width and height in pixels |
| Camera model | The iPhone or other camera that wrote the field |
| Lens | The reported lens or iPhone camera module |
| ISO | How strongly the camera amplified the sensor signal |
| Aperture | The size of the lens opening used for the shot |
| Shutter speed | How long the sensor collected light |
| Location | A map or coordinates when GPS metadata is present |

The panel is a readable summary, not a complete dump of every metadata block. It may omit maker notes, detailed GPS fields, XMP editing records, IPTC credits, embedded previews, or fields Apple does not use in the Photos interface.

## How do you read ISO, aperture, and shutter speed?

Use the three values as a quick explanation of how the camera handled the light, not as a quality score.

A higher ISO helps in darker scenes but can add grain. A wider aperture, shown by a smaller f-number such as f/1.8, lets in more light and can soften the background. A fast shutter speed such as 1/1000 freezes motion; a slower one such as 1/15 can blur movement or camera shake.

iPhone computational photography makes this less tidy than a traditional camera lesson. Night mode, HDR, image stacking, and software processing can shape the final picture too. The EXIF data iPhone writes still gives useful context, but it does not describe every decision made while the phone built the image.

## How do you view the full EXIF, XMP, IPTC, and GPS report?

Use the exact image file in the [Image Metadata Viewer](/image-metadata-viewer/) when the Photos panel does not show enough.

The viewer runs in your browser and groups the readable fields without uploading the image. It can show the short camera summary along with native EXIF paths, XMP fields, IPTC credits, color information, GPS entries, software names, and other metadata the Photos app leaves out.

Choose the original file when possible. A preview saved from a website, an image copied from Notes, and a version downloaded from a chat are different files. Their visible pixels may look alike while their metadata reports do not.

If you are checking privacy rather than camera settings, use the [Image Privacy Checker](/image-privacy-checker/). It highlights location, names, device identifiers, editing traces, and other metadata worth reviewing before a photo leaves your phone.

## Why is EXIF data missing from an iPhone photo?

EXIF is usually missing because that copy was rebuilt, stripped, or never came from a camera in the first place.

Common examples include screenshots, social-media downloads, edited exports, and photos saved from messaging apps. A [screenshot creates a new image](/blog/do-screenshots-have-metadata/) and normally does not copy the camera EXIF or GPS from the picture shown on screen. It can still have its own dimensions, file dates, and color information.

The transfer route matters too. In an [r/iCloud discussion about photos losing their original dates](https://www.reddit.com/r/iCloud/comments/1vnw3yd/pics_shared_with_me_lost_exif_data/), the poster found that WhatsApp-saved copies had lost capture information while AirDrop copies kept it. Replies pointed out that a later iCloud or cable transfer cannot restore metadata an earlier app already removed.

Do not use the date under iPhone Storage or Files as a substitute for `DateTimeOriginal`. A newly downloaded copy can have today's local file date even when the embedded capture date is years old.

## Can iPhone photo metadata reveal your location?

Yes. When Camera had location access, a photo may contain coordinates precise enough to identify a home, school, workplace, or regular stop.

In Photos, a map below the image is the easiest warning. Apple says only items with location information appear in the map collection, although a library can also contain a location that was added or adjusted later. Check the actual exported file if you need to know what another person will receive.

In an [r/iOS privacy discussion](https://www.reddit.com/r/ios/comments/1o390ce/exif_location_sharing_a_privacy_nightmare/), one user disliked having to remember the Location switch every time they shared a photo. Other users pointed to the Photos share sheet and the **Adjust Location** control. Those controls help when you share from Photos, but an upload inside another app may not present them in the same way.

No GPS does not make the pixels private. A street sign, school badge, delivery label, reflection, or house number can reveal a place without any metadata at all.

## Can you change a photo's date or location in Photos?

Yes. Photos lets you adjust the library's date, time, and location, but an edited value is not proof of when or where the picture was made.

Open the photo, tap the **More** button, then choose **Adjust Date & Time** or **Adjust Location**. To remove the location from that item in Photos, choose **Adjust Location**, then **No Location**. Apple also allows batch changes after selecting several photos.

This is handy when an old camera clock was wrong or scanned family photos arrived with today's date. It also shows why metadata should be treated as editable context. A map and timestamp can be corrected, mistyped, or deliberately changed.

Library information and embedded file information are not always identical after an export. If the result matters, save or export the version you plan to use, then inspect that final file rather than assuming the Photos screen and attachment contain the same fields.

## How do you remove EXIF and GPS before sharing?

For one share, turn off Location in Photos; for a reusable clean copy, remove broader metadata and verify the output.

To omit location from the iPhone share sheet:

1. Select the photo in Photos and tap **Share**.
2. Tap **Options** at the top of the share sheet.
3. Turn off **Location**, then tap **Done**.
4. Choose the person or app you want to share with.

Apple notes that **All Photos Data**, available for some AirDrop and iCloud Link shares, can include the original file, edit history, and metadata. Leave that off when your goal is to share less information.

Turning off Location for one send does not remove camera model, software, author, or other metadata. To make a separate file for repeated sharing, use the [Image Metadata Remover](/image-metadata-remover/). Keep the original in Photos, download the cleaned copy, and run that copy through the privacy checker.

Our step-by-step guide to [removing GPS data from photos before sharing](/blog/how-to-remove-gps-data-from-photos-before-sharing/) covers the same check-clean-check workflow on iPhone, Android, Windows, and Mac. Inspect the output instead of trusting a filename that happens to include "clean."
