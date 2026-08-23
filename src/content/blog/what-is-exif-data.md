---
title: "What Is EXIF Data?"
seoTitle: "What Is EXIF Data? GPS, Camera Info & Photo Metadata Explained | ViewExif"
description: "Learn what EXIF data stores inside a photo, how it differs from other metadata, when GPS creates a privacy risk, and how to view or remove it."
excerpt: "EXIF can record the camera, lens, exposure, capture time, orientation, software, and sometimes GPS inside a photo. Here is what those fields mean in plain English."
category: "EXIF basics"
tags:
  - EXIF data
  - EXIF metadata
  - photo metadata
  - GPS metadata
publishedAt: 2026-08-18
updatedAt: 2026-08-18
featured: false
author: "ViewExif Editorial Team"
reviewedBy: "ViewExif Product Engineering"
cover: "../../assets/blog/what-is-exif-data.webp"
coverAlt: "A photographer holding an SD card beside a camera and laptop before inspecting photo EXIF data"
practicalTake:
  - "EXIF is one part of photo metadata, and it may store camera settings, capture time, editing software, or GPS coordinates."
  - "Use EXIF as a clue, not proof. A person or app can change, delete, or replace its fields without changing the visible picture."
  - "Before sharing a sensitive photo, inspect the exact file, create a cleaned copy, and check that copy rather than trusting the upload service."
faqs:
  - question: "Does every photo have EXIF data?"
    answer: "No. Many camera JPEGs have EXIF, but screenshots, edited exports, downloaded images, and some PNG, GIF, or WebP files may have little or none."
  - question: "Does EXIF contain GPS location?"
    answer: "Sometimes. A phone or camera can save latitude and longitude when location tagging is enabled, but many photos contain no GPS fields at all."
  - question: "Can EXIF data be changed?"
    answer: "Yes. Photo editors and metadata tools can rewrite or remove EXIF fields, so camera details and dates should be treated as useful context rather than proof."
  - question: "Does a screenshot contain EXIF data?"
    answer: "A screenshot usually does not copy the original photo's camera EXIF or GPS, though the new screenshot can still have its own dates, dimensions, color, and software metadata."
  - question: "How can I view EXIF data?"
    answer: "Open the original photo in a metadata viewer, then look for EXIF camera, exposure, date, orientation, software, and GPS fields in the report."
related:
  - how-to-remove-metadata-from-a-photo
  - exif-vs-metadata
  - how-to-find-where-a-photo-was-taken
---

EXIF data is information stored inside many digital photo files. It can record the camera model, lens, ISO, aperture, shutter speed, capture time, orientation, editing software, and sometimes GPS coordinates. You do not see these details in the pixels, but a photo app or metadata viewer can read them.

EXIF stands for Exchangeable Image File Format. Despite the name, it is not a separate file attached to your picture. It is a set of fields written into formats such as JPEG and TIFF. Some newer image formats can carry the same information in their own containers.

EXIF is one kind of photo metadata. That distinction matters because a file may have XMP, IPTC, color profile, file system, or application data even when its EXIF section is empty.

## Is EXIF the same as photo metadata?

No. Photo metadata is the broad category, while EXIF is one common way to store camera and capture information.

Think of photo metadata as everything a file says about itself. EXIF may describe how the camera made the picture. IPTC can hold captions, credits, and contact details. XMP can store editing history, ratings, and fields copied between apps. An ICC profile tells software how to display color. Your operating system also shows a filename, size, and file dates that may not be embedded in the image at all.

This is why an app can say "No EXIF found" while another viewer still shows useful data. The second app may be reading a different metadata block. If you care about privacy, checking only the EXIF heading is too narrow.

The reverse is also true. A photo with a long metadata report does not necessarily contain private information. Width, height, bit depth, and color profile are technical facts that many apps need to display the image correctly.

## What information can EXIF data contain?

EXIF can store the camera, lens, exposure settings, original capture time, image rotation, software, and location used for one photo.

The exact list depends on the device and the app that last saved the file. A phone may write only a small group of familiar fields. A dedicated camera can add autofocus mode, flash state, white balance, serial numbers, and maker-specific notes. An editor may keep the camera settings but replace the software field with its own name.

| Common field | What it usually means |
| --- | --- |
| Camera Make and Model | The manufacturer and camera or phone model that created the image |
| LensModel | The lens reported by the camera |
| ISO | The sensor sensitivity setting used for the shot |
| FNumber or Aperture | How wide the lens opening was |
| ExposureTime or ShutterSpeedValue | How long the sensor collected light |
| DateTimeOriginal | The date and time the camera says the photo was captured |
| GPSLatitude and GPSLongitude | The recorded coordinates, if location tagging was on |
| Orientation | How software should rotate the stored pixels for display |
| Software | The camera firmware, editor, or export app that last wrote this field |

Photographers often read ISO, aperture, and shutter speed to understand why a picture is sharp, noisy, bright, or blurred. Those fields are useful for learning. They are not a score for whether the photo is good.

## What does DateTimeOriginal really tell you?

`DateTimeOriginal` is the capture time written inside the photo, but it can be wrong, missing, or edited.

It is different from the file's Created or Modified date. If you download a ten-year-old picture today, your computer may show today's date for the new local copy while EXIF still shows the older capture date. Time zones add another wrinkle because older cameras often stored a local clock time without an offset.

An [r/digitalforensics user asking about an emailed JPEG](https://www.reddit.com/r/digitalforensics/comments/17w0a8w/metadata_from_emailed_image/) ran into exactly this problem. The downloaded file dates looked new, but the question was whether the original capture date still existed inside the image. Replies separated the email attachment's embedded EXIF from the recipient computer's local timestamps.

That distinction helps with family archives and basic troubleshooting. It does not make the date courtroom proof. A wrong camera clock, an export, or a metadata editor can all change it.

## Does EXIF data include GPS location?

Sometimes. EXIF can store precise latitude and longitude, but only if the device or an app wrote those fields.

Phones often ask for location permission and may geotag photos when it is allowed. A camera without GPS may record none. Some photo libraries know a location from their own database without embedding it in the exported file, while other apps copy the coordinates into a new export.

Valid GPS coordinates can point to a house, school, workplace, or a place visited on a particular day. Altitude and viewing direction may also appear. A city name alone is less precise, but it can still narrow the context.

No GPS field does not mean the picture is location-safe. A street sign, shipping label, window view, car plate, or familiar landmark is visible in the pixels and has nothing to do with EXIF. Our guide to [removing GPS data before sharing](/blog/how-to-remove-gps-data-from-photos-before-sharing/) covers both the hidden coordinates and the details that metadata tools cannot see.

## Can EXIF data reveal private information?

Yes. GPS is the clearest risk, but dates, device identifiers, author fields, thumbnails, and editing details can also reveal more than you meant to share.

A camera model is usually harmless on its own. Pair it with a serial number, an exact capture time, and a home coordinate, and the picture becomes much easier to connect to a person or event. Embedded thumbnails can be awkward too. An editor may change the main image while leaving a small preview made earlier in the workflow.

One [r/privacy user needed to send an employer a workplace photo anonymously](https://www.reddit.com/r/privacy/comments/1cjxcez/removing_all_identifying_info_from_a_photo/). The useful replies did not stop at "delete EXIF." They recommended cleaning locally and then opening the result in a second tool to make sure the metadata was gone. That second check matters because identity or location details may sit in XMP, IPTC, PNG text, or another block rather than the main EXIF section.

Run the exact file through the [Image Privacy Checker](/image-privacy-checker/) when the location or author matters. It checks metadata, not faces, writing, reflections, or landmarks in the image itself.

## Can EXIF data be changed or deleted?

Yes. You can edit or remove EXIF without visibly changing the photo, although the saving method may affect the file.

Photo organizers routinely correct capture dates when a camera clock was wrong. Editors update orientation and software fields. Metadata tools can add a copyright notice or delete GPS. A social platform may build a fresh image and leave most camera metadata behind.

Because the fields are editable, EXIF metadata is evidence about a file's history, not proof of who took the photo or whether the scene is true. A believable camera model can be typed in. A missing GPS block might mean privacy cleanup, a camera without location, or an app that stripped metadata during export.

Deletion has limits too. Removing metadata from one copy does not erase the original in a phone library, cloud backup, chat, or email. Keep track of which file is clean. Do not overwrite the only original if you want its capture details later.

## How can you view photo EXIF data?

Open the original file in a metadata viewer and read the EXIF section alongside the other metadata blocks.

Windows and macOS can show a short list through file properties or photo inspectors. Camera and editing apps may show more. For a fuller report, drop the image into the [Image Metadata Viewer](/image-metadata-viewer/). It reads the file in your browser and groups camera, exposure, date, GPS, color, and native fields without uploading the photo.

Use the original file when possible. A thumbnail from a website, a screenshot, or an image copied from a document may be a different file with different metadata. Our [screenshot metadata guide](/blog/do-screenshots-have-metadata/) explains why a screenshot normally drops the source photo's camera EXIF even though the new image still has basic file information.

When checking dates, compare `DateTimeOriginal` with the file system dates rather than assuming they describe the same event. When checking location, search for GPS, latitude, longitude, position, city, and country across the whole report.

## How do you remove EXIF before sharing a photo?

Create a cleaned copy, inspect that copy, and share it only after the private fields are gone.

Use the [Image Metadata Remover](/image-metadata-remover/) to make a separate file while keeping your camera original. Then put the cleaned result back into the metadata viewer or privacy checker. Search for GPS, author, serial, owner, software, comments, and embedded previews that you do not want to send.

Do not assume the destination will clean the photo for you. An ordinary Gmail attachment can preserve the file you attach, as the [Gmail EXIF guide](/blog/does-gmail-remove-exif-data/) explains. WhatsApp and Instagram often rebuild photos sent through their normal image routes, but a file or document route can behave differently. The safest point to remove EXIF is before the file leaves your device.

Renaming does not delete embedded fields. Cropping and screenshots may create a new file, but neither is a reliable privacy process across every app. Inspect the cleaned copy before you send it, so a hidden coordinate or old author name does not travel with the picture.
