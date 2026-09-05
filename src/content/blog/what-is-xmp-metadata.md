---
title: "What Is XMP Metadata?"
seoTitle: "What Is XMP Metadata? Sidecars, Editing Data, and Privacy | ViewExif"
description: "Learn what XMP metadata is, what an XMP sidecar stores, how it differs from EXIF, when it creates privacy risks, and how to view or remove it."
excerpt: "XMP can carry ratings, captions, creator details, edit settings, rights, dates, and location data inside a file or in a sidecar beside it."
category: "Metadata basics"
tags:
  - what is XMP metadata
  - XMP metadata
  - XMP sidecar file
  - photo metadata
publishedAt: 2026-08-28
updatedAt: 2026-09-05
featured: false
author: "ViewExif"
cover: "../../assets/blog/what-is-xmp-metadata.webp"
coverAlt: "A photographer using a laptop beside printed photos and a camera while reviewing XMP metadata"
practicalTake:
  - "XMP is editable metadata for descriptions, rights, ratings, locations and editing instructions. It can sit inside a file or in a separate .xmp sidecar."
  - "A sidecar protects the original photo from being rewritten, but the metadata can disappear from your workflow if the two files get separated."
  - "Keep XMP with archival originals when it carries useful work. Before sharing, inspect the exact exported copy and remove private fields from that copy."
faqs:
  - question: "What does XMP stand for?"
    answer: "XMP stands for Extensible Metadata Platform. Adobe developed it as a flexible way for apps to store and exchange descriptive, rights, workflow and editing metadata."
  - question: "Is XMP metadata the same as EXIF?"
    answer: "No. EXIF mainly describes camera capture details. XMP can store creator information, ratings, captions, rights, edit settings and copies of some EXIF or IPTC values."
  - question: "What is an XMP sidecar file?"
    answer: "It is a small .xmp file stored beside an image or video. The sidecar keeps metadata and editing instructions without rewriting the original media file."
  - question: "Can I delete an XMP sidecar file?"
    answer: "Usually, but you may lose ratings, captions, keywords or nondestructive edits that your photo app kept only in that sidecar. Back it up before deleting it."
  - question: "Can XMP metadata contain GPS coordinates?"
    answer: "Yes. XMP can repeat EXIF GPS coordinates or store other location fields such as city, state, country and location names, depending on the app and file."
related:
  - exif-vs-metadata
  - what-is-exif-data
  - how-to-remove-metadata-from-a-photo
---

XMP metadata is a flexible set of labels stored inside a file or in a separate `.xmp` sidecar beside it. It can hold a title, caption, creator name, copyright, rating, keywords, edit settings, dates, location and app history. XMP does not change the visible pixels. Photo editors and asset libraries read it to remember what a file means and what work has been done to it.

XMP stands for Extensible Metadata Platform. Adobe created it, and the format is now standardized. The technical plumbing uses XML and RDF, but you do not need to read either to understand your files.

## What does XMP metadata store?

XMP stores descriptive details, ownership information, workflow notes and editing instructions chosen by the app that writes it.

There is no fixed XMP checklist. The format uses namespaces, which are groups of related fields. One app may write a rating, copyright and its own adjustment settings under different names. That is why two metadata tools can label the same file differently.

| Common XMP field | What it may tell you |
| --- | --- |
| `dc:creator` | Photographer, artist or account name |
| `dc:title` | Title assigned to the file |
| `dc:description` | Caption or longer description |
| `dc:subject` | Keywords and searchable tags |
| `xmp:Rating` | Star rating or rejected status |
| `xmp:CreatorTool` | App that created or exported the file |
| `xmpRights:UsageTerms` | Copyright or reuse instructions |
| `photoshop:City` | A city recorded for the image |

XMP can also contain camera values, GPS coordinates, face regions, persistent document IDs and detailed editor settings. [ExifTool's XMP reference](https://github.com/exiftool/exiftool/blob/master/html/TagNames/XMP.html) lists hundreds of fields because apps and industries add their own schemas.

## How is XMP different from EXIF and IPTC?

EXIF usually describes capture, IPTC usually describes publishing, and XMP is the flexible layer that can carry or repeat both kinds of information.

An EXIF block might say a camera used ISO 400 at 1/250 second. IPTC might hold a news caption, credit and contact details. XMP can store a copy of those values alongside a Lightroom rating, crop instructions and copyright terms.

That overlap can look like duplication in a metadata report. It is not necessarily an error. Apps often synchronize a value across formats so older and newer software can both read it. They do not always agree, though. If EXIF says one capture date and XMP says another, treat both as editable claims.

[EXIF vs metadata](/blog/exif-vs-metadata/) explains the broader family tree. The short version is that XMP and EXIF are both metadata, but neither term means every hidden field in a file.

## Does XMP metadata change image quality?

No. Changing XMP edits labels and instructions, not the compressed pixels that make up the visible image.

A crop or exposure value in XMP is usually an instruction for compatible software. The original pixels stay put. Deleting that XMP may make the photo look unedited in the app, but it cannot restore pixels discarded by an earlier export.

## Is XMP embedded in the file or stored as a sidecar?

It can be either: JPEG, TIFF, PNG, PDF and several other formats can embed XMP, while RAW workflows often use a separate `.xmp` sidecar.

Embedding keeps the metadata attached to the media. Move the photo and its XMP moves with it. A sidecar has a matching base name, such as `DSC_0042.NEF` and `DSC_0042.xmp`. The pair must stay together.

Sidecars save ratings and nondestructive adjustments without rewriting a camera RAW file. Adobe's [XMP specification overview](https://developer.adobe.com/xmp/docs/xmp-specifications/) notes the tradeoff: separate metadata can become separated from its media.

That problem came up in an [r/photography discussion about EXIF, IPTC and XMP sidecars](https://www.reddit.com/r/photography/comments/1mqay9o/exifiptc_metadata_or_xmp_sidecar_files/). One user wanted portable ratings without modifying originals. A reply noted that sidecars preserve the photo checksum, but the original poster then had to worry about moving both files together. That is the everyday bargain: safer originals, more file housekeeping.

## Why can a sidecar go missing during export or backup?

A sidecar is a separate file, so a copy, rename, upload or backup can leave it behind even when the photo itself survives.

File Explorer and Finder do not know that two similarly named files form a pair. Photo software often does. If you rename or move a RAW photo inside the catalog, the app may move its sidecar too. If you drag only the RAW file into an email or cloud folder, the XMP may remain behind.

An [r/immich user described the reverse problem](https://www.reddit.com/r/immich/comments/1t8rs2d/xmp_metadata/): an iCloud export had been organized with XMP sidecars, and the user wanted the metadata merged back into a large batch of JPEGs before exporting again. The library could display the sidecar data, while the bare JPEGs still lacked it. Exporting those JPEGs alone would lose the organization the user expected to keep.

Check a small sample after any migration. Confirm that ratings, dates and captions appear in the destination before moving the whole archive.

## Why does Lightroom report an XMP metadata conflict?

Lightroom reports a conflict when its catalog and the file or sidecar on disk appear to contain competing metadata changes.

The catalog can hold one version while a sidecar holds another. An editor, timestamp or permission change may also make Lightroom think the disk copy changed. A bulk sync can overwrite work, so first decide whether the catalog or disk is your trusted version.

One [r/Lightroom thread about growing conflict warnings](https://www.reddit.com/r/Lightroom/comments/1rc8klz/lightroom_created_sidecar_xmp_now_complaining/) started after a library moved from a USB drive to an SMB share. Even old photos began showing conflicts, sometimes just after Lightroom created their sidecars. Replies suspected a false conflict or synchronization issue, but the thread did not prove one universal cause. It does show why hundreds of warnings deserve a backup and a small test, not a blind overwrite.

Adobe documents both automatic and manual XMP saving in [Lightroom Classic](https://helpx.adobe.com/uk/lightroom-classic/desktop/organize-photos-in-lightroom-classic/create-xmp-acr-files.html). Check that setting before deciding which copy is authoritative.

## Can XMP metadata expose private information?

Yes. XMP can contain names, contact details, GPS or place labels, editing history, face regions, document IDs and local workflow clues.

A creator field may name the photographer. Location fields can identify a home or workplace. Apps may also record software versions, save history or IDs that link several exports to one editing project.

Run the exact share copy through the [Image Privacy Checker](/image-privacy-checker/). It checks embedded metadata families, including XMP, and masks sensitive values in the report. It does not inspect faces, street signs, screens or other visible pixels, so review the picture too.

A separate `.xmp` sidecar is also shareable data. If you send it with the photo, the recipient can read whatever it contains even when the image itself looks clean.

## How do you view XMP metadata?

Choose the image locally in a metadata viewer and search the native fields for XMP groups, creator names, rights, locations, ratings and edit records.

The [Image Metadata Viewer](/image-metadata-viewer/) shows readable fields first, then the original group paths in All fields. Search for `XMP`, `dc`, `xmp`, `photoshop`, `crs`, `creator`, `rights`, `GPS`, `location`, `history` and `document ID`.

ViewExif reads embedded XMP from supported images. It does not accept a standalone `.xmp` sidecar as the main upload. For a sidecar, open it with the photo app that created it or inspect it with a dedicated metadata tool. Do not assume the sidecar and image contain the same values.

Use the file you will actually publish. An original RAW file, an edited JPEG and a social media download can all have different XMP.

## How do you remove XMP metadata safely?

Make a cleaned copy, remove embedded XMP from that copy, then scan the output instead of trusting a successful save message.

The [Image Metadata Remover](/image-metadata-remover/) removes writable descriptive and private metadata while preserving the image structure needed for display. Keep the original if its ratings, rights or edit settings matter to your archive.

If the workflow uses a sidecar, cleaning the image does not delete that separate `.xmp` file. Do not attach or publish the sidecar with the cleaned image. If you decide to delete it locally, back it up first because it may contain the only copy of your adjustments.

Read [how to remove metadata from a photo](/blog/how-to-remove-metadata-from-a-photo/) for the full clean, verify and share workflow. The verification step matters because XMP can contain duplicate fields and custom namespaces that a short Properties panel never shows.

## Which XMP copy are you changing?

Before editing XMP, locate whether it is embedded in the media or stored in a separate `.xmp` sidecar. A catalog can keep another working copy. Editing one does not establish that all three now agree.

Record the namespace and property as well as the displayed value. Two applications can expose different subsets, and custom namespaces may not appear in a simple properties panel. If a sensitive name remains after cleanup, search readable native fields for that value rather than only the familiar Creator label. Retain the original media and sidecar together for an archive; share only the reviewed copies.

## Should you keep XMP metadata in your photo archive?

Keep useful XMP with archival originals, but share a separate cleaned export when the metadata is private or irrelevant to the recipient.

Ratings, captions, keywords, rights and nondestructive edits can save hours later. Throwing all of that away from an archive just to make one upload is usually the wrong trade. A clean export gives you privacy without flattening the history of your working files.

Sidecars need a little housekeeping. Include them in backups and move them through software that understands the pair. With embedded XMP, remember that the data travels with every copy until an export or cleanup removes it.

Before sharing, ask one plain question: does the recipient need these fields? If not, inspect the export, remove them and inspect it once more.
