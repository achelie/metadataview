---
title: "How to Remove Metadata From PDF"
seoTitle: "How to Remove Metadata From PDF Safely | ViewExif"
description: "Remove metadata from PDF files, clear Author, dates, software, Info and XMP fields, then verify a fully rewritten copy before sharing it."
excerpt: "A PDF can keep names, dates, software, titles, keywords, and XMP after its pages look anonymous. Remove those fields, rewrite the file, and scan the result."
category: "Document privacy"
tags:
  - remove metadata from PDF
  - PDF metadata remover
  - remove PDF author
  - delete PDF properties
publishedAt: 2026-08-26
updatedAt: 2026-09-05
featured: false
author: "ViewExif"
cover: "../../assets/blog/remove-metadata-from-pdf.webp"
coverAlt: "Documents and a laptop on a desk before removing metadata from a PDF file"
practicalTake:
  - "Scan the PDF first because its Info dictionary and XMP packet can hold similar fields in different places."
  - "Use a full PDF rewrite after clearing metadata so an earlier incremental version cannot expose the old top-level values."
  - "Do not clean a digitally signed PDF unless you accept that changing the file will invalidate its signature."
faqs:
  - question: "How do I remove metadata from a PDF?"
    answer: "Create a separate copy that clears the PDF Info and XMP fields, rewrites the complete PDF, and scans the result before you share it."
  - question: "Can a PDF contain hidden author information?"
    answer: "Yes. Author, Creator, Producer, dates, titles, keywords, organization names, and custom XMP values can remain even when the visible pages look anonymous."
  - question: "Does printing to PDF remove all metadata?"
    answer: "No. Printing may drop some fields, but it can add new software details and may flatten links, forms, accessibility data, or other useful document features."
  - question: "Can the Modified date be removed from a PDF?"
    answer: "An embedded ModDate can be removed, but the operating system still gives every file local Created and Modified timestamps. Those file system dates are not PDF metadata."
  - question: "Does removing PDF metadata break a digital signature?"
    answer: "Yes. A cryptographic PDF signature binds to the signed file bytes. Rewriting metadata changes those bytes and invalidates the existing signature."
related:
  - how-to-view-pdf-metadata
  - remove-metadata-from-word-document
  - does-gmail-remove-exif-data
---

To remove metadata from PDF, make a separate copy that clears both the PDF Info dictionary and XMP metadata, then fully rewrites and rescans the file. Deleting Author in a Properties window is not enough. The same name or date may exist in another metadata block, and a simple incremental edit can leave the old value recoverable. Keep the original until the cleaned PDF opens correctly and its pages still match.

## What is the safest way to remove metadata from PDF?

Start with the [Document Metadata Viewer](/document-metadata-viewer/). Search the full report for Author, Creator, Producer, Title, Subject, Keywords, CreationDate, ModDate, company names, email addresses, software, and XMP. This tells you what the PDF carries before you change it.

Next, create a cleaned copy with the [Document Metadata Remover](/document-metadata-remover/). ViewExif clears removable top-level Info and XMP fields, then uses qpdf to rewrite the complete file. It checks the output type, page count, page dimensions, and other document facts before enabling a verified download.

This is metadata cleanup, not document redaction. Pages, forms, annotations, and attachments are content. Read those separately if the PDF contains private information.

## What metadata can a PDF contain?

A PDF can store names, dates, titles, software, keywords, rights details, identifiers, and custom workflow fields.

The visible pages tell only part of the story. A Word export may copy the account name into Author and write Microsoft Word into Creator. Acrobat, a scanner, or an online converter may add a Producer value. XMP can repeat those fields and add its own namespaces.

| PDF field or area | What it may reveal | Cleanup note |
| --- | --- | --- |
| Author | A person, account, or template owner | Remove when identity is private |
| Creator | The app that created the page content | Often different from Producer |
| Producer | Software that wrote the PDF structure | Usually removable |
| CreationDate and ModDate | Export or later-save times | Editable and not proof of authorship |
| Title, Subject, and Keywords | Project names or internal labels | Easy to overlook in a short Properties panel |
| XMP | Duplicate and custom metadata | Must be checked separately from Info |
| Document IDs | Persistent identifiers for a PDF workflow | May link related versions |
| Page count and dimensions | Document structure | Keep and verify after cleanup |

The guide on [how to view PDF metadata](/blog/how-to-view-pdf-metadata/) explains how to read these fields before deciding what should go.

## Why is deleting Author and Title not enough?

The same detail can appear in the PDF Info dictionary, XMP, or a custom field, so one blank Properties box proves very little.

This was the core worry in a [Reddit question from someone who exported a Word file](https://www.reddit.com/r/pdf/comments/1qlgf75/pdf_metadata/). They had changed Author and Created dates with Python and wanted to know whether the PDF could still connect back to their laptop. Replies pointed out that regular PDF metadata and XMP both need attention.

That distinction is practical, not academic. A basic properties panel might show an empty Author while a full reader still finds `dc:creator` in XMP. A PDF may also include the writing app, company name, document ID, or custom workflow label. Search the cleaned file rather than trusting the field you edited.

Some archive standards, including PDF/A workflows, use XMP as part of conformance. Removing it may affect that status. If archival compliance matters, preserve the original and validate the cleaned copy with the system that receives it.

## Why does the Modified date still appear after cleanup?

Windows and macOS assign file system timestamps to every file, even when the PDF contains no embedded ModDate.

The difference confused a user in an [r/pdf thread about removing Modified metadata](https://www.reddit.com/r/pdf/comments/1mopabc/remove_modified_metadata_not_change_to_the_same/). They tried Print to PDF, Notepad, PowerShell, and several utilities. Some attempts corrupted the document; others only changed the date.

A helpful reply separated the two clocks. The Details tab can expose data embedded in the PDF. The first tab of Windows Properties shows timestamps for the local file on that computer. Those local Created and Modified values cannot be removed because the file system needs them. Copying or downloading the cleaned PDF may change them again.

Use a metadata viewer that labels each field's source. `File` or `System` dates describe the current copy. PDF Info or XMP dates travel inside the document and can be targeted for removal.

## Does Print to PDF remove all PDF metadata?

No. Printing can discard some metadata, but it is an unpredictable conversion rather than a verified cleanup.

A virtual printer builds a new PDF from what it can render. It may drop the old Author or XMP packet, then add its own Creator, Producer, and current date. It can also flatten forms, break links, remove bookmarks, harm accessibility tags, or change page behavior. Printing paper and scanning it goes further, but turns the pages into images and can reduce searchability and quality.

Use Print to PDF only when you want that tradeoff. If the goal is to keep the document working while removing descriptive metadata, use a metadata-aware rewrite and compare the output with the original.

## Why does a full PDF rewrite matter?

PDF editors can append a new version while leaving older objects in the file, so hiding a value is not the same as deleting its bytes.

ExifTool's official [PDF tag documentation](https://github.com/exiftool/exiftool/blob/master/html/TagNames/PDF.html) warns that its PDF edits use incremental updates. The current index points to the new metadata, but the previous information remains and the change can be reversed. ExifTool alone is therefore not enough for secure PDF metadata removal.

ViewExif first clears the writable Info and XMP fields, then runs qpdf to linearize and rewrite the document. QPDF describes this as a structural transformation that rewrites the file without changing its page content. The second step matters because it removes the abandoned top-level metadata objects instead of leaving them behind an updated index.

The output will have a new file hash and may have a different size. That is expected after a full rewrite. Page count, dimensions, and the ability to open the file should remain stable.

## What happens to a digitally signed PDF?

Removing metadata changes the PDF bytes, so an existing digital signature will no longer validate.

An [r/pdf user who rearranged signed pages](https://www.reddit.com/r/pdf/comments/1p3a132/edit_digitally_signed_pdf/) found that the signatures disappeared after saving. Replies explained that this is the point of a cryptographic signature: it detects changes made after signing. Flattening a visible signature into an image preserves its appearance, not its verification.

ViewExif warns when it detects a document signature and asks for confirmation before cleanup. If the signature matters, stop and request an unsigned source or ask the signer to sign the cleaned document again. Never present a flattened signature graphic as proof that the modified PDF is still signed.

## Does PDF metadata removal hide everything private?

No. Metadata cleanup does not remove text, images, comments, form values, attachments, or badly applied redactions.

A black rectangle drawn over text may only cover the text visually. Comments can contain names. Attachments can carry their own metadata. A filename can reveal a client or case number even when the PDF itself is clean. ViewExif deliberately preserves document content, so it is not a legal redaction tool or malware scanner.

Check the pages and attachments yourself. If the PDF arrived through email, remember that the service may keep its own delivery records; the [Gmail EXIF and attachment guide](/blog/does-gmail-remove-exif-data/) explains why file cleanup and platform data are separate questions.

## Define what a successful PDF cleanup covers

The top-level Info and XMP cleanup covers document properties; it does not inspect every private value in page content, annotations or attached files. A structural rewrite can discard superseded objects without making the whole document a redacted release.

If the output still contains the name you meant to remove, identify whether it is a property, a comment, a form value or visible text. Use the corresponding document-editing or redaction workflow, then recheck the final export. A passed page-count check is useful for integrity, not proof that every page looks identical or that every attachment is safe.

## How do you verify the cleaned PDF?

Open the exact downloaded copy, compare its pages with the original, and scan its full metadata report again.

Use the [Document Metadata Viewer](/document-metadata-viewer/) and search for the names, dates, software, titles, keywords, XMP, and IDs you intended to remove. Check the report's Residual section rather than assuming every PDF field is writable.

Open several pages, test important links or forms, and confirm the page count and dimensions. For a contract or archival file, keep the original beside the cleaned copy until the recipient accepts it. A good result says what was removed, what stayed, and whether verification finished. A blank Author box by itself cannot tell you any of that.
