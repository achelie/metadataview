---
title: "How to Tell When a Photo Was Taken"
seoTitle: "How to Tell When a Photo Was Taken Using EXIF Dates | ViewExif"
description: "Learn how to tell when a photo was taken by checking EXIF DateTimeOriginal, separating capture time from file dates, and spotting missing or changed metadata."
excerpt: "Start with DateTimeOriginal in the original image, then compare other EXIF dates and file timestamps before treating the result as reliable."
category: "EXIF basics"
tags:
  - How to Tell When a Photo Was Taken
  - photo DateTimeOriginal
  - photo capture date
  - EXIF date
publishedAt: 2026-08-31
updatedAt: 2026-08-31
featured: false
author: "ViewExif"
cover: "../../assets/blog/how-to-tell-when-a-photo-was-taken.webp"
coverAlt: "A vintage camera beside a flip clock representing how to tell when a photo was taken"
practicalTake:
  - "Check the original image for DateTimeOriginal first. The Created date shown by your computer may only tell you when that copy arrived."
  - "Compare DateTimeOriginal, CreateDate, ModifyDate, and any time-zone offset. A disagreement is a reason to investigate, not to pick the oldest value."
  - "EXIF dates are useful clues, not proof. A wrong camera clock, an editor, or a metadata tool can change them without changing the visible picture."
faqs:
  - question: "How can I find the date a photo was taken?"
    answer: "Inspect the original image and look for EXIF DateTimeOriginal. Compare it with CreateDate, ModifyDate, the filename, and the photo library record before relying on it."
  - question: "What is DateTimeOriginal in a photo?"
    answer: "DateTimeOriginal is the date and time the camera says it captured the image. It can be missing, wrong, or edited, especially when the camera clock was not set correctly."
  - question: "Can a photo's EXIF date be wrong?"
    answer: "Yes. The device clock may have been wrong, the time-zone offset may be absent, or an editor may have rewritten the field. EXIF dates should be treated as context rather than proof."
  - question: "Why does a downloaded photo show today's date?"
    answer: "Your computer may be showing when it created or modified the downloaded copy. That file-system date is separate from the embedded EXIF capture time."
  - question: "Can you tell when a photo was taken without EXIF?"
    answer: "Not exactly from the file alone. A filename, cloud library, message date, or nearby photos may provide clues, but none can recreate a missing original capture timestamp."
related:
  - what-is-exif-data
  - how-to-check-metadata-of-an-image
  - how-to-view-exif-data-on-android
---

To tell when a photo was taken, inspect the original image and look for the EXIF field `DateTimeOriginal`. That is usually the camera's capture time. Do not confuse it with the Created or Modified date shown by your computer, which may only record when the file was downloaded, copied, or edited.

The word "usually" matters. A camera clock can be wrong, an app can remove the field, and anyone with a metadata editor can change it. Treat the date as a strong clue when the surrounding details agree, not as automatic proof.

## How can you tell when a photo was taken?

Open the original image in a metadata viewer, find `DateTimeOriginal`, and compare it with the other dates instead of reading one label in isolation.

Drop the file into the [Image Metadata Viewer](/image-metadata-viewer/) and search for `DateTimeOriginal`. Camera JPEGs and HEIC photos often include it. You may also see `CreateDate`, `ModifyDate`, an offset such as `OffsetTimeOriginal`, and file-system dates supplied by your device.

Start with the file closest to the camera original. Website thumbnails and chat downloads may look identical while carrying different dates. Our guide to [checking image metadata](/blog/how-to-check-metadata-of-an-image/) explains how to tell embedded EXIF from an app's own library record.

## Which photo date should you trust?

Use `DateTimeOriginal` as the first capture-date clue, then check whether the other fields and the file's history support it.

| Date or field | What it normally describes |
| --- | --- |
| `DateTimeOriginal` | When the camera says it captured the photo |
| `CreateDate` | When the digital image data was created |
| `ModifyDate` | When metadata or the image was last saved |
| `OffsetTimeOriginal` | The UTC offset paired with the capture time |
| `GPSDateStamp` | A date recorded with GPS data, usually paired with GPS time |
| File Created | When this local copy appeared on the current device |
| File Modified | When this local copy was last written on the current device |

On an untouched camera file, the first three embedded dates may match. An editor can update `ModifyDate` while leaving `DateTimeOriginal` alone. A scan of an old print may carry the scan date, not the date of the pictured event. When fields disagree, look for an export, clock correction, or other action that explains the gap.

## Why does the file say it was created today?

The Created date often belongs to the copy on your current device, so downloading an old photo today can give it today's local file date.

This catches people when they save an email attachment or move a family archive to a new drive. The operating system needs dates for that local file. Copying, extracting, syncing, or downloading can assign new ones even when `DateTimeOriginal` still says 2014.

An [r/digitalforensics user had this problem with an emailed JPEG](https://www.reddit.com/r/digitalforensics/comments/17w0a8w/metadata_from_emailed_image/). The visible file dates looked new, but the original capture date was still the question. Replies separated the attachment's embedded EXIF from the recipient computer's timestamps. That is the right split to make.

Renaming usually leaves the embedded time alone. Copying may change the local Created date, while editing can change both.

## What happens after email, chat, or social upload?

A transfer may preserve the original bytes, rebuild the image, or strip the capture date, so inspect the received copy rather than assuming.

An ordinary email attachment often preserves EXIF, while many chat and social platforms create a processed sharing copy. Even one app can have two routes: sending as a compressed photo may remove more than sending as a file. Our [Gmail EXIF guide](/blog/does-gmail-remove-exif-data/) shows why an attachment and an image preview should not be treated as the same thing.

The difference also appeared in an [r/iCloud discussion about photos losing their original dates](https://www.reddit.com/r/iCloud/comments/1vnw3yd/pics_shared_with_me_lost_exif_data/). WhatsApp-saved copies had lost capture information while AirDrop copies kept it. A later transfer could not restore fields removed earlier. For an archive, ask for the original file.

## How do you check the date on a phone or computer?

Open the photo's Info or Details panel for a quick answer, then inspect the original file when you need the complete date record.

On iPhone, swipe up in Photos or tap the info button. On Android, swipe up in Google Photos or use **More > About**. The [iPhone EXIF guide](/blog/how-to-view-exif-data-on-iphone/) and [Android EXIF guide](/blog/how-to-view-exif-data-on-android/) cover the exact menus. Windows and macOS show shorter property lists, so use a full viewer when the date source is unclear.

In a [Reddit discussion about re-uploaded Google Photos albums](https://www.reddit.com/r/googlephotos/comments/1r5lrdc/metadata_in_google_photos/), users compared EXIF timestamps with upload and file dates after old pictures landed correctly on the timeline. Export and inspect the file when you need to know what the image itself says.

## Can screenshots and edited copies keep the original date?

A screenshot is a new image and usually does not inherit the source photo's capture date, while an edited export may keep, change, or remove it.

If you screenshot a photo taken in 2019, the new file normally describes the screenshot made today. It cannot preserve the old `DateTimeOriginal` by magic. Our guide to [screenshot metadata](/blog/do-screenshots-have-metadata/) covers the platform differences and the metadata the new screenshot may still contain.

Editors are less predictable. Some preserve the original capture date and update only `ModifyDate`. Others rebuild the file with a fresh date or no EXIF at all. "Edited" therefore does not mean the date is gone, and "date present" does not mean the file is untouched.

Compare the original and edited versions when both exist. A changed software field can explain the date gap.

## Why can the time be wrong by hours or years?

The camera clock may have been set incorrectly, and many older photos store local time without a reliable time-zone offset.

A photo taken at 7:00 PM in Tokyo might contain only `19:00:00`, with no indication that the clock used Japan Standard Time. When a library moves that value across time zones, it may display a different hour. Daylight saving changes add more room for confusion.

A one-hour error often suggests daylight saving or a missing offset. A difference of several years points more often to an unset clock, reset battery, scan, or manual edit. GPS time can be another clue when it exists, but many photos have none.

## Can EXIF dates be changed or faked?

Yes. Metadata tools can rewrite `DateTimeOriginal` without visibly changing the picture, so an EXIF date is not proof of when an event happened.

Changing dates has ordinary uses, such as fixing a wrong time zone or assigning an approximate year to scanned family prints. It can also fabricate a neat story. Compare the date with the camera model, software field, neighboring images, and known transfer history.

For a plain explanation of what these fields are, see [what EXIF data contains](/blog/what-is-exif-data/). EXIF records what a file says about itself. It does not certify that the statement is true.

## What if the photo has no DateTimeOriginal?

Without an embedded capture time, the file alone usually cannot tell you the exact moment the photo was taken.

Look for another original copy, a camera filename, the message that carried it, or nearby photos from the event. These can narrow the window, but a message date shows when the file was sent. Clues in the pixels are visual investigation, not recovered metadata.

If a platform stripped the field, only a source copy or backup can bring it back. A different metadata viewer cannot display bytes that are no longer there.

## How do you verify a photo date before relying on it?

Use the closest original, compare independent date fields, record the file's path, and state what remains uncertain.

Inspect `DateTimeOriginal`, `CreateDate`, `ModifyDate`, and any offset. Record whether the file was a camera original, email attachment, cloud export, or social download. For a serious dispute, preserve the original and its hash, then ask a qualified examiner.

If the photo will be shared after you inspect it, run the outgoing copy through the [Image Privacy Checker](/image-privacy-checker/). If it exposes a date or location you do not want to send, make a separate copy with the [Image Metadata Remover](/image-metadata-remover/) and check that result again.
