---
title: "Does Discord Remove EXIF Data? Photos, Videos, and GPS Explained"
description: "Does Discord remove EXIF data? Historical user reports cover specific photo and video downloads. Check GPS, PNG fields, and the exact attachment you save."
excerpt: "Discord users have reported missing photo metadata, but those reports do not certify every attachment. Here is how to check photos, videos, PNG fields, and filenames."
category: "Image privacy"
tags:
  - Discord
  - EXIF
  - GPS metadata
  - attachment privacy
publishedAt: 2026-08-12
updatedAt: 2026-09-18
featured: false
author: "ViewExif"
cover: "../../assets/blog/does-discord-remove-exif-data.webp"
coverAlt: "Person holding a smartphone beside a computer while using a chat app"
practicalTake:
  - "A 2024 user reported finding no metadata in downloaded chat pictures, without a controlled source comparison or a complete field inventory."
  - "Old videos and PNG custom data have behaved differently over time, so inspect the copy you actually download from Discord."
  - "Removing EXIF does not hide a filename, street sign, reflection, username, or any other clue that is visible in the post."
faqs:
  - question: "Does Discord remove GPS from images?"
    answer: "The cited 2024 user report describes downloaded pictures, not a current GPS-removal guarantee. Clean sensitive coordinates before upload and inspect the exact saved attachment."
  - question: "Does Discord remove metadata from videos?"
    answer: "Historical community reports describe changes to video handling, not a current guarantee. Inspect the actual downloaded video and clean sensitive fields before uploading."
  - question: "Does Discord remove or change filenames?"
    answer: "A filename is not EXIF. Discord may display or alter it depending on the client and upload route, so rename files that contain a real name, project title, or private note."
  - question: "Does uploading an image as a file preserve EXIF?"
    answer: "Do not assume that a different attachment button preserves or removes every field. Send a test copy, download it, and inspect that exact result."
  - question: "Should I trust Discord to remove private metadata?"
    answer: "Not for a sensitive file. Make a cleaned copy before uploading, then check it locally so a platform change cannot make the privacy decision for you."
related:
  - does-telegram-remove-exif-data
  - does-whatsapp-remove-exif-data
  - does-instagram-remove-exif-data
---

A 2024 Discord user reported finding no metadata in pictures downloaded from a chat. The report did not document source-file tags, formats or client versions. It cannot establish which fields Discord removed or guarantee current behavior. Inspect the exact saved attachment.

The original in your camera roll is not cleaned. Discord processes a separate upload, so deleting the attachment later does nothing to the file on your phone.

## Does Discord remove EXIF data from photos?

In a [July 2024 r/discordapp discussion](https://www.reddit.com/r/discordapp/comments/1e5i7we/question_does_discord_remove_exif_data_from/), the poster said they downloaded chat pictures and found no data. There is no supplied before-and-after field inventory. Another commenter believed newer videos were cleaned; that opinion is not a video test or an official guarantee.

| What you send | What the cited evidence establishes |
| --- | --- |
| JPEG camera photo | The 2024 picture report does not identify formats or prove JPEG-wide removal |
| PNG with text or custom chunks | A 2023 community thread reports loss and later recovery through some routes |
| New phone video | No current removal guarantee established by these sources |
| Old Discord video | A 2020 report found location data; announced work did not certify every file |
| Original file in an archive | Treat it as the original and assume its metadata remains |

Discord has changed its media pipeline before. What matters is the downloaded attachment you have now, not a test someone ran five years ago.

## Can someone recover EXIF from a Discord download?

No. If Discord removed the tags, a metadata viewer cannot rebuild them from the downloaded copy.

Compare against an original known to contain the fields you are checking. An empty report on a random attachment alone cannot show whether the sender’s camera ever recorded GPS.

When a photo arrives without a useful date, the download time is not the moment the camera took the picture. A filename may offer a clue, but it is not reliable proof.

## Why did Discord videos leak GPS in 2020?

A November 2020 community report described location data in downloaded phone videos. It documents a historical risk, not the behavior of every current video upload.

The [2020 r/discordapp thread](https://www.reddit.com/r/discordapp/comments/jzwite/psa_discord_does_not_strip_location_data_for/) includes a reply from ReallyAmused describing image stripping and planned video work: an iOS change had merged for a future release, Android had no ETA, and backend work was a proof of concept. This is evidence of an announcement at that time, not proof that all clients or stored attachments were fixed.

Do not assign a universal “safe after November 2020” cutoff. The announcement does not establish one. A downloaded copy also survives independently of later changes to the service.

If an old message exposes a sensitive phone video, review and remove it if necessary. Do not assume Discord retroactively replaced every copy people had already downloaded.

## Does Discord keep PNG metadata and custom chunks?

The cited 2023 discussion reports changing PNG results. It does not establish which chunks survive in a current download.

PNG can hold text fields and application-specific chunks that are not the usual camera EXIF. In 2023, [game and art communities reported that Discord had stripped data stored inside PNG files](https://www.reddit.com/r/discordapp/comments/12800f7/discord_is_stripping_metadata_out_of_png_images/). Some relied on those chunks to carry character or project data. Later replies reported different results depending on how the PNG was uploaded and downloaded.

For privacy and backups, the lesson is the same: a PNG attachment is not a dependable metadata vault, and you cannot assume every custom field disappears. Keep the source elsewhere and inspect the downloaded copy.

## Can a Discord image reveal your IP or address?

Ordinary camera EXIF does not record the connection IP used to upload it. Custom text or visible content can still contain an address, and the post can reveal where you live.

Opening an external link creates a separate network request. A map or other website can receive your connection information even if the picture you inspected contains no GPS tags.

The pixels are often the easier route. Street signs, house numbers, school badges, reflections, windows, and landmarks survive metadata removal. A reused username or reverse image search can connect the post to another account. Clean metadata helps, but it cannot crop the photo for you.

## Why do saved Discord images show the wrong date?

A photo app may use the download date because Discord's copy no longer has the original capture time.

Before repairing a library date, compare the saved attachment with the source. If capture time is absent, a filename or message time may help you estimate it. Label that estimate: neither is proof of when the camera took the picture.

If the date matters, keep the original file. The Discord attachment is a sharing copy, not a photo archive.

## How do you test the exact Discord upload?

Use a harmless synthetic file with known tags in a private test channel, download the attachment, and inspect that downloaded copy. Do not upload a private original just to test removal.

Open it in the [Image Metadata Viewer](/image-metadata-viewer/) and search for `GPS`, `Location`, `DateTimeOriginal`, `Make`, `Model`, `Artist`, `Comment`, and `Software`. The [Image Privacy Checker](/image-privacy-checker/) groups fields that may deserve attention.

Check the final route you plan to use. A JPEG preview, a PNG attachment, and a video do not necessarily pass through the same processing. Repeat the test after a major app change if the file is sensitive.

## How much can the historical reports tell you?

The community reports cited here describe particular upload routes and dates. They are useful warnings about differences between JPEG, PNG and video, but they are not current certification of Discord's media pipeline. In particular, a claimed fix for newer uploads does not establish the contents of an older attachment.

When inspecting an existing post, distinguish the displayed preview from the file obtained through the attachment download. Read the saved file's format and metadata. If it is an archive, inspect the contained file separately. For a new post, clean the source before upload; avoid treating a claim about JPEG EXIF as a promise about video telemetry or PNG text.

## How do you remove metadata before Discord?

Make a cleaned copy before uploading when the file contains private details.

The [Image Metadata Remover](/image-metadata-remover/) creates a separate file and scans the result again. Keep the original for your archive. Rename the cleaned copy too if its filename contains a name, address, client, or project code.

Other services make their own copies and follow different rules. See what happens to [Instagram photo metadata](/blog/does-instagram-remove-exif-data/) and [WhatsApp photo metadata](/blog/does-whatsapp-remove-exif-data/). If you plan to share a capture instead, remember that [screenshots create new metadata](/blog/do-screenshots-have-metadata/) and still show whatever was visible on screen.
