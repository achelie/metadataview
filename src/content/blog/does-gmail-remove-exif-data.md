---
title: "Does Gmail Remove EXIF Data? What Photo Attachments Keep"
description: "Gmail normally sends photo attachments with their EXIF intact. Learn what recipients can read, what inline images change, and how to clean a file first."
excerpt: "Gmail is email, not a social photo feed. A photo attached to a message normally arrives with its GPS, camera details, dates, and other embedded fields still inside."
category: "Image privacy"
tags:
  - Gmail
  - EXIF
  - email attachments
  - image privacy
publishedAt: 2026-08-15
updatedAt: 2026-08-15
featured: false
author: "MetadataView Editorial Team"
reviewedBy: "MetadataView product engineering"
cover: "../../assets/blog/does-gmail-remove-exif-data.webp"
coverAlt: "A black laptop and smartphone on a bright white desk prepared for sending an email attachment"
practicalTake:
  - "A normal photo attachment in Gmail keeps the metadata already stored in the file, including GPS if the camera saved it."
  - "A new download date belongs to the recipient's device and does not mean Gmail erased the original EXIF capture date."
  - "Clean the photo before attaching it when location, camera, author, or editing details should stay private."
faqs:
  - question: "Does Gmail remove GPS data from attached photos?"
    answer: "No. A normal Gmail attachment can keep GPS coordinates stored in the photo's EXIF, so remove location data before sending a sensitive image."
  - question: "Does Gmail compress photo attachments?"
    answer: "A file added as a regular attachment is normally delivered unchanged. A phone share sheet, pasted image, Google Photos route, or another app may create a different copy first."
  - question: "Can a Gmail recipient see where a photo was taken?"
    answer: "Yes, if the attached file contains valid GPS EXIF. The recipient can download the photo and inspect those coordinates with ordinary metadata software."
  - question: "Does forwarding a Gmail message remove EXIF?"
    answer: "No automatic cleanup should be assumed. If the forwarded message includes the same attachment, its embedded metadata can travel to the next recipient too."
  - question: "Does renaming a photo remove its EXIF data?"
    answer: "No. Renaming changes the filename, while EXIF remains stored inside the image. You need to remove or rewrite those embedded fields separately."
related:
  - does-telegram-remove-exif-data
  - does-whatsapp-remove-exif-data
  - does-discord-remove-exif-data
---

Does Gmail remove EXIF data? No, not from a normal photo attachment. Gmail usually delivers the file with the metadata it already contains, which may include GPS coordinates, the camera model, capture time, lens details, an author name, and editing software.

Gmail behaves differently from Instagram, Reddit, or a chat app that routinely rebuilds images for a feed. Email attachments are meant to remain files. That is useful when someone needs the original photo, but it is a poor privacy filter.

The sending route still matters. A photo added with the paperclip is not quite the same workflow as an image pasted into the message, shared from Google Photos, or replaced with a Drive link. Check the exact file you plan to send instead of trusting the Gmail preview.

## Does Gmail remove EXIF from photo attachments?

No. A photo added as a regular Gmail attachment normally reaches the recipient with its embedded EXIF unchanged.

A [Gmail Help Community test](https://support.google.com/mail/thread/122174064/image-file-tags-and-metadata-in-gmail?hl=en) compared a downloaded attachment with the source and found the files were byte for byte identical. The same discussion says Gmail sends attached and embedded image files unaltered. That is a community product expert's test, not a formal promise for every future Gmail client, but it matches how ordinary email attachments are supposed to work.

An [r/GMail user asked the same EXIF question](https://www.reddit.com/r/GMail/comments/p8s7rp/does_gmail_strip_images_of_metadata_before_being/) after finding little clear documentation. The replies were cautious rather than definitive, but the practical answer was that Gmail does not act as an EXIF scrubber. One commenter pointed to the phone's own option to remove location before sharing.

| Sending route | What the recipient gets | Metadata expectation |
| --- | --- | --- |
| Paperclip file attachment | A downloadable image file | Existing EXIF normally remains |
| Image pasted into the message | An inline MIME image that may also appear as an attachment | Often keeps the image data, but verify the saved copy |
| Photo shared through another app or Google Photos | A copy or link prepared by that service | Depends on the route chosen before Gmail opens |
| File over Gmail's attachment limit | A Google Drive link | The hosted file follows Drive sharing behavior |

## Does pasting a photo into Gmail change the answer?

Usually not, but an inline image is easier to confuse with a newly generated copy, especially on a phone.

Gmail can display an image inside the message body while still storing it as a MIME attachment. The visual placement does not prove the file was cleaned. Copy and paste, a mobile share sheet, or an image editor may create a new file before Gmail receives it, and that new file can have different metadata.

If privacy matters, do not infer anything from how the compose window looks. Send a harmless test image through the same app and route, download it from the receiving account, and inspect the result. The [WhatsApp EXIF guide](/blog/does-whatsapp-remove-exif-data/) explains why a route that creates a new photo copy can behave differently from sending an original file.

## Why does a downloaded photo show a new created date?

The new date usually records when the recipient saved the attachment, not when the camera took the picture.

This distinction caused confusion in the Gmail Help discussion. The sender saw a new file creation date on the receiving computer and thought the old metadata had disappeared. The product expert explained that the operating system supplied that local date even though the transferred file matched the original byte for byte.

Look for `DateTimeOriginal`, `CreateDate`, or other EXIF fields inside the image. Those can still show the old capture time. File Explorer or Finder may show today's date because today's copy is new on that device. Both dates can be correct descriptions of different events.

## Can a Gmail recipient recover the original date or GPS?

Yes. If the attachment contains EXIF dates or coordinates, the recipient can read them after downloading the image.

That exact problem came up in an [r/digitalforensics discussion about an emailed JPEG](https://www.reddit.com/r/digitalforensics/comments/17w0a8w/metadata_from_emailed_image/). The poster wanted the original date from a photo sent by email. Replies noted that timestamps may remain embedded in the file, and the poster later extracted EXIF from the inline image.

The recipient does not need access to your Gmail account or a specialist lab. Common photo apps and metadata readers can expose GPS, camera details, and capture dates. A missing field also proves very little: the camera may never have written it, or another app may have removed it before Gmail received the file.

## What happens when someone forwards the email?

The metadata can travel again if the forwarded message carries the same attachment.

Forwarding does not turn the photo into a social media preview. The next recipient may receive the attached bytes that were already in the message. Downloading, renaming, and attaching the file to a fresh email also leaves EXIF alone unless an editor or cleanup tool rewrites it.

A workplace photo may pass through several inboxes before anyone thinks about its hidden fields. In an [r/privacy thread about emailing a photo anonymously](https://www.reddit.com/r/privacy/comments/1cjxcez/removing_all_identifying_info_from_a_photo/), the poster needed to send an employer a picture without revealing their identity. Replies recommended stripping the file locally first. That avoids relying on every later recipient to handle the original carefully.

## What happens to photos larger than 25 MB?

Personal Gmail accounts use a Google Drive link when the total attachment size exceeds 25 MB, so the message no longer contains a normal attachment.

[Google's Gmail attachment help](https://support.google.com/mail/answer/6584?hl=en) documents the 25 MB personal-account limit and says larger files are replaced with a Drive link. Work and school limits can be set by an administrator.

A Drive link changes access and storage, not the metadata inside the hosted image. The recipient may still download the original file from Drive. Check the sharing permissions as well as the photo itself, since anyone granted access can potentially retrieve the embedded EXIF.

## How do you check the file a Gmail recipient gets?

Download the attachment from a receiving account and compare that copy with the file you sent.

Open both in the [Image Metadata Viewer](/image-metadata-viewer/) and compare the SHA-256 value, file size, dimensions, MIME type, and metadata fields. Matching hashes mean the bytes match. Different hashes mean some step changed the file, so inspect the differences rather than assuming the change improved privacy.

The [Image Privacy Checker](/image-privacy-checker/) gives a shorter view of GPS, names, device IDs, editing history, and embedded previews. Use an ordinary test photo for route testing. Sending a genuinely sensitive original to yourself still gives Gmail that original.

## Should you remove metadata before attaching a photo?

Yes, when the recipient does not need the capture details or the image could expose a person or place.

Use the [Image Metadata Remover](/image-metadata-remover/) to create a separate cleaned copy and verify it before you compose the email. Keep the original in your own archive. Attach only the cleaned copy.

Do not stop at EXIF if the stakes are high. A filename can contain a client name or address, and the pixels can show mail labels, house numbers, reflections, faces, or a computer screen. Gmail cannot decide whether those visible details are safe for you.
