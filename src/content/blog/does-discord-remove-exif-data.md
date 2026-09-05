---
title: "Does Discord Remove EXIF Data? Photos, Videos, and GPS Explained"
description: "Discord usually strips EXIF from uploaded photos, but videos, PNG chunks, filenames, old attachments, and visible clues still deserve a quick check."
excerpt: "Discord usually removes camera EXIF and GPS from uploaded photos. Videos, PNG data, old attachments, and visible clues make the full answer less tidy."
category: "Image privacy"
tags:
  - Discord
  - EXIF
  - GPS metadata
  - attachment privacy
publishedAt: 2026-08-12
updatedAt: 2026-09-05
featured: false
author: "ViewExif"
cover: "../../assets/blog/does-discord-remove-exif-data.webp"
coverAlt: "Person holding a smartphone beside a computer while using a chat app"
practicalTake:
  - "A normal JPEG uploaded to Discord usually loses its camera EXIF and GPS, while the original on your device stays unchanged."
  - "Old videos and PNG custom data have behaved differently over time, so inspect the copy you actually download from Discord."
  - "Removing EXIF does not hide a filename, street sign, reflection, username, or any other clue that is visible in the post."
faqs:
  - question: "Does Discord remove GPS from images?"
    answer: "Discord normally removes embedded GPS coordinates from uploaded JPEG photos. If the location matters, clean the file yourself and check the downloaded attachment rather than relying on that normal behavior."
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

Discord photo downloads have lost camera EXIF and GPS in historical user reports. Those reports are not a current field-by-field guarantee, especially for older attachments, alternate download routes and video. Inspect the exact saved attachment before relying on its metadata.

The original in your camera roll is not cleaned. Discord processes a separate upload, so deleting the attachment later does nothing to the file on your phone.

## Does Discord remove EXIF data from photos?

That matches a [2024 r/discordapp test](https://www.reddit.com/r/discordapp/comments/1e5i7we/question_does_discord_remove_exif_data_from/) where the poster downloaded images from a chat and could not find the location or date fields. Other users reported the same result for photos and said newer video uploads were also being cleaned.

| What you send | What the Discord copy usually keeps |
| --- | --- |
| JPEG camera photo | Pixels, dimensions, and basic file details, but not camera EXIF or GPS |
| PNG with text or custom chunks | Results have changed across download routes and app updates |
| New phone video | User tests say location metadata is now removed, but verify it |
| Old Discord video | May predate the 2020 video fix |
| Original file in an archive | Treat it as the original and assume its metadata remains |

Discord has changed its media pipeline before. What matters is the downloaded attachment you have now, not a test someone ran five years ago.

## Can someone recover EXIF from a Discord download?

No. If Discord removed the tags, a metadata viewer cannot rebuild them from the downloaded copy.

A [2021 r/discordapp thread](https://www.reddit.com/r/discordapp/comments/ll1kod/does_discord_remove_exif_data/) reached the practical answer quickly: upload the file, download it, and inspect the result. If the GPS or capture time is gone, you need the original photo or a backup to get it back.

When a photo arrives without a useful date, the download time is not the moment the camera took the picture. A filename may offer a clue, but it is not reliable proof.

## Why did Discord videos leak GPS in 2020?

Discord cleaned photo metadata at the time, but its video path briefly left phone location data intact.

In a widely shared [2020 r/discordapp investigation](https://www.reddit.com/r/discordapp/comments/jzwite/psa_discord_does_not_strip_location_data_for/), users downloaded phone videos and found GPS information that could narrow down where they were recorded. A Discord staff reply said image metadata was already stripped, acknowledged that video was harder, and described fixes for mobile apps and the backend.

The risk was not theoretical. Another user later said [someone found their address from an old video](https://www.reddit.com/r/discordapp/comments/sq9xwj/does_discord_strip_video_exif_data/). Replies pointed out that new uploads should have been covered after November 2020, while an older attachment could still be a problem.

If you posted a sensitive phone video before that change, remove the old message. Do not assume Discord retroactively replaced every copy people had already downloaded.

## Does Discord keep PNG metadata and custom chunks?

Sometimes. PNG data has not behaved as consistently as JPEG EXIF.

PNG can hold text fields and application-specific chunks that are not the usual camera EXIF. In 2023, [game and art communities reported that Discord had stripped data stored inside PNG files](https://www.reddit.com/r/discordapp/comments/12800f7/discord_is_stripping_metadata_out_of_png_images/). Some relied on those chunks to carry character or project data. Later replies reported different results depending on how the PNG was uploaded and downloaded.

For privacy and backups, the lesson is the same: a PNG attachment is not a dependable metadata vault, and you cannot assume every custom field disappears. Keep the source elsewhere and inspect the downloaded copy.

## Can a Discord image reveal your IP or address?

The image file does not contain your connection IP, but the post can still reveal where you live.

One [r/discordapp user worried that a stranger had found their school and city](https://www.reddit.com/r/discordapp/comments/foilna/does_discord_automatically_strip_exif_data/). Replies noted that Discord strips image EXIF and that an IP address would not usually pinpoint a home anyway. A link to a site controlled by someone else is a separate risk because opening it creates a network request.

The pixels are often the easier route. Street signs, house numbers, school badges, reflections, windows, and landmarks survive metadata removal. A reused username or reverse image search can connect the post to another account. Clean metadata helps, but it cannot crop the photo for you.

## Why do saved Discord images show the wrong date?

A photo app may use the download date because Discord's copy no longer has the original capture time.

This is a common archive headache. A recent [Immich discussion](https://www.reddit.com/r/immich/comments/1ucdnw8/i_made_this_tool_to_fix_wrong_timeline_dates_by/) described rebuilding dates from filenames after services such as Discord stripped the embedded timestamp. That can improve sorting, but a filename can be renamed or generated by an app, so it remains a best guess.

If the date matters, keep the original file. The Discord attachment is a sharing copy, not a photo archive.

## How do you test the exact Discord upload?

Send the file to a private test channel, download the attachment, and inspect that downloaded copy.

Open it in the [Image Metadata Viewer](/image-metadata-viewer/) and search for `GPS`, `Location`, `DateTimeOriginal`, `Make`, `Model`, `Artist`, `Comment`, and `Software`. The [Image Privacy Checker](/image-privacy-checker/) groups fields that may deserve attention.

Check the final route you plan to use. A JPEG preview, a PNG attachment, and a video do not necessarily pass through the same processing. Repeat the test after a major app change if the file is sensitive.

## How much can the historical reports tell you?

The community reports cited here describe particular upload routes and dates. They are useful warnings about differences between JPEG, PNG and video, but they are not current certification of Discord's media pipeline. In particular, a claimed fix for newer uploads does not establish the contents of an older attachment.

When inspecting an existing post, distinguish the displayed preview from the file obtained through the attachment download. Read the saved file's format and metadata. If it is an archive, inspect the contained file separately. For a new post, clean the source before upload; avoid treating a claim about JPEG EXIF as a promise about video telemetry or PNG text.

## How do you remove metadata before Discord?

Make a cleaned copy before uploading when the file contains private details.

The [Image Metadata Remover](/image-metadata-remover/) creates a separate file and scans the result again. Keep the original for your archive. Rename the cleaned copy too if its filename contains a name, address, client, or project code.

Other services make their own copies and follow different rules. See what happens to [Instagram photo metadata](/blog/does-instagram-remove-exif-data/) and [WhatsApp photo metadata](/blog/does-whatsapp-remove-exif-data/). If you plan to share a capture instead, remember that [screenshots create new metadata](/blog/do-screenshots-have-metadata/) and still show whatever was visible on screen.
