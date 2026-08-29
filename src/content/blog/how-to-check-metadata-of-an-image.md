---
title: "How to Check Metadata of an Image"
seoTitle: "How to Check Metadata of an Image: EXIF, GPS, and More | ViewExif"
description: "Learn how to check metadata of an image, including EXIF camera settings, dates, GPS, XMP, IPTC, and file details on phones and computers."
excerpt: "Open the exact image file in a metadata viewer to check its camera details, capture date, GPS, software, author fields, and other embedded records."
category: "Metadata basics"
tags:
  - how to check metadata of an image
  - image metadata
  - check image EXIF data
  - photo metadata viewer
publishedAt: 2026-08-29
updatedAt: 2026-08-29
featured: false
author: "ViewExif"
cover: "../../assets/blog/how-to-check-metadata-of-an-image.webp"
coverAlt: "A camera beside a laptop used to check image metadata while editing a photo"
practicalTake:
  - "Check the exact image you received or plan to share. A thumbnail, screenshot, cloud export, and original photo can all contain different metadata."
  - "Start with EXIF capture time and GPS, then check XMP, IPTC, comments, software, and file facts instead of stopping at one heading."
  - "Metadata is editable and may be missing. Use it as context, then inspect a cleaned copy before sharing anything sensitive."
faqs:
  - question: "How do I check the metadata of an image?"
    answer: "Open the actual image file in a metadata viewer and inspect its EXIF, GPS, XMP, IPTC, file, and technical sections. Check the copy you will use, not a thumbnail or screenshot."
  - question: "Can I check image metadata on my phone?"
    answer: "Yes. The iPhone Photos app and many Android gallery apps show basic details. A browser metadata viewer can show more embedded fields when the gallery leaves them out."
  - question: "How can I tell when a photo was taken?"
    answer: "Look for DateTimeOriginal or another embedded capture date. Do not confuse it with the file Created or Modified date, which may change when the image is copied or downloaded."
  - question: "How do I know if an image has GPS metadata?"
    answer: "Search the report for GPSLatitude, GPSLongitude, coordinates, position, city, or location. No GPS fields means the file itself cannot give you an exact location."
  - question: "Can image metadata be fake?"
    answer: "Yes. A person or app can edit or remove metadata without changing the visible picture. Treat camera, date, author, and GPS fields as clues rather than proof."
related:
  - what-is-exif-data
  - how-to-view-exif-data-on-iphone
  - how-to-remove-metadata-from-a-photo
---

To check the metadata of an image, open the exact file in a metadata viewer and inspect its EXIF, GPS, XMP, IPTC, and file sections. You may find the camera, lens, capture date, exposure settings, editing software, author details, and location. Check the actual copy you received or plan to share because a download, screenshot, or export may not match the original.

The basic process takes less than a minute. The harder part is knowing which date matters, why one app shows fewer fields than another, and what an empty report really means.

## What should you check first?

Check the file itself first, then look for capture time, GPS coordinates, camera details, author fields, software, and comments.

Do not begin with the filename. A name such as `IMG_2048.jpg` tells you very little and can be changed in seconds. Open the file and scan its embedded sections instead.

Start with `DateTimeOriginal`, `GPSLatitude`, and `GPSLongitude` when your question is about when or where the photo was made. For camera settings, look for model, lens, ISO, aperture, shutter speed, and focal length. If privacy is the concern, also search for artist, owner, serial number, copyright, contact, city, description, and software.

EXIF is only part of the report. Our guide to [what EXIF data means](/blog/what-is-exif-data/) explains its camera fields, but an image can also carry XMP, IPTC, PNG text, color profiles, application notes, and embedded previews.

## How do you check metadata with a browser?

Choose the image in a local browser viewer, wait for the report, and search the readable summary plus the complete native fields.

Open the [Image Metadata Viewer](/image-metadata-viewer/) and choose a JPEG, PNG, WebP, HEIC, TIFF, or GIF. ViewExif reads the file in the current browser tab. It does not need an account or an upload to a separate processing server.

The readable view is the quickest place to find familiar details. Use the complete field view when you need the original tag name or when a value is tucked inside an unfamiliar metadata group. Search for a plain word such as `GPS`, `author`, `software`, or `date` instead of scrolling through every row.

Use the full size image whenever possible. A website preview may be a resized copy. A photo pasted into a document and saved again may be another copy. The metadata report answers questions about the file you opened, not every earlier version of that picture.

## How do you check image metadata on iPhone and Android?

Use the Photos or gallery information panel for a quick check, then use a metadata viewer if you need the full embedded record.

On an iPhone, open a photo in Photos and swipe up or tap the information button. The panel can show the date, location, camera, lens, file type, dimensions, and exposure details when they exist. [How to view EXIF data on iPhone](/blog/how-to-view-exif-data-on-iphone/) walks through that screen and explains why some fields are absent.

Android gallery apps vary by phone maker. Open the image, find Details or Info, and look for the date, dimensions, camera, and location. If the gallery shows only a short list, open the original file in a browser viewer.

That gap is a real source of confusion. One [Nextcloud user could see EXIF in the web interface but not in the Android app](https://www.reddit.com/r/NextCloud/comments/1qri69p/nextcloud_android_app_exif_data/). A reply suggested using a gallery app with metadata support. The file had not necessarily changed. The two interfaces simply exposed different information.

## How do you check image metadata on Windows and Mac?

Use file properties for a short summary or a dedicated viewer when you need GPS, XMP, IPTC, and native tag paths.

On Windows, right-click the file, choose Properties, and open Details. You may see the camera, date taken, dimensions, rating, title, and GPS. Windows does not display every tag, and its file dates are not always capture dates.

On a Mac, select the file in Finder and use Get Info for basic file facts. Preview can show more through Tools, Show Inspector, and the information tabs. Photos also has an information panel for library items.

These built-in views are convenient, but they are summaries. If Windows says a field is blank, that does not prove the image has no metadata elsewhere. Run the same file through a fuller viewer before making a privacy or provenance decision.

## Which image metadata fields are worth reading?

Read the fields that answer your question and separate embedded capture data from local file system facts.

| Field or group | What it can tell you |
| --- | --- |
| `DateTimeOriginal` | The capture time recorded by the camera or phone |
| File Created or Modified | When this local copy was created or changed on the device |
| Camera Model and Lens | The device and lens written into the image |
| ISO, Aperture, Shutter Speed | Exposure settings used for the shot |
| GPS Latitude and Longitude | Stored coordinates, if geotagging was enabled |
| Orientation | How software should rotate the stored pixels |
| Software or CreatorTool | The camera firmware, editor, or exporter that wrote the field |
| XMP, IPTC, Comments | Captions, credits, rights, workflow data, and custom text |

The most common mistake is treating a file date as the day the shutter fired. Downloading an old photo today can give the local copy today's Created date while `DateTimeOriginal` still carries the old camera date. Either value can also be edited.

## Why can the same image show different metadata?

Different copies and different apps can show different metadata because files get rebuilt, sidecar data gets separated, and viewers read different tag sets.

A messaging service may recompress a photo. A photo editor may export a fresh JPEG. A cloud library may keep an adjustment in its database rather than inside the downloaded image. Even when the bytes are identical, one app may show five friendly fields while another reveals hundreds of native tags.

Google Photos exports are a good example. In a [Reddit discussion about Takeout metadata](https://www.reddit.com/r/googlephotos/comments/1usf6nc/i_built_a_cli_tool_to_fix_google_photos_metadata/), the author first blamed empty EXIF and later corrected the claim. Existing embedded EXIF generally stayed with the media, while cloud edits and some date or location changes lived in separate JSON files. Extracting a ZIP could also reset the local file modification time.

The sensible check is boring but reliable: compare the exact files, not their thumbnails or names. A hash can tell you whether two copies have identical bytes. A metadata report can show which fields differ.

## What does missing metadata mean?

Missing metadata means the current file does not contain the field your viewer can read. It does not explain why the field is absent.

The camera may never have recorded GPS. A screenshot may have started life without lens data. An editor or social platform may have stripped the original tags. A privacy tool may have removed them on purpose.

Some images are born with almost no capture metadata. A [film photographer on Reddit described lab scans as blank JPEGs](https://www.reddit.com/r/AnalogCommunity/comments/1u3libe/i_built_filmtag_an_opensource_tool_to_batchinject/): no film camera, lens, or shooting date, because the scanner created the digital file later. Adding those details afterward can improve an archive, but the new fields are records entered by a person, not untouched camera evidence.

An empty GPS section also cannot reveal where a photo was taken. It does not make the picture anonymous, though. Street names, faces, mail labels, reflections, and landmarks remain visible in the pixels.

## Can metadata prove who made an image?

No. Ordinary image metadata can support a story about a file, but anyone with the right tool can edit or delete it.

A camera model, creator name, or copyright line may be useful context. None proves authorship by itself. The same applies to dates and GPS. A believable value is still editable.

For signed provenance, check whether the file has valid C2PA Content Credentials. Even a valid credential proves the signed record is bound to that file without an undetected change. It does not prove that every statement or visible scene is true.

When the stakes are higher than casual curiosity, keep the original bytes, record where the file came from, compare hashes, and avoid drawing a conclusion from one metadata field.

## What should you do before sharing an image?

Inspect the exact outgoing copy, remove fields you do not want to disclose, and verify the cleaned file before you send it.

Run the image through the [Image Privacy Checker](/image-privacy-checker/) to find GPS, device identifiers, names, timestamps, editing traces, and embedded previews. It checks metadata only. It cannot detect a house number or computer screen visible in the picture.

If the report contains private fields, create a separate copy with the [Image Metadata Remover](/image-metadata-remover/). Keep the original for your archive. Then check the cleaned copy again. Renaming the file does not remove embedded metadata, and trusting the destination app is a gamble you do not need to take.

The final check should answer a simple question: does this exact file still contain anything you would rather not hand to the recipient?
