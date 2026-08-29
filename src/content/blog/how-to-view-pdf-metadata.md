---
title: "How to View PDF Metadata"
seoTitle: "How to View PDF Metadata: Author, Dates, and Software | ViewExif"
description: "Learn how to view PDF metadata such as author, title, creation date, editing software, page count, and XMP fields without uploading the document."
excerpt: "A PDF can store an author, title, dates, software names, keywords, and custom XMP fields. Here is how to find them and judge what they really mean."
category: "Document metadata"
tags:
  - How to View PDF Metadata
  - PDF metadata
  - PDF properties
  - PDF author
publishedAt: 2026-08-22
updatedAt: 2026-08-22
featured: false
author: "ViewExif"
cover: "../../assets/blog/how-to-view-pdf-metadata.webp"
coverAlt: "Glasses resting on printed documents beside a laptop while checking PDF metadata and file properties"
practicalTake:
  - "Open the actual PDF in a metadata viewer. A filename, download date, or browser tab title does not show the full embedded record."
  - "Author, Creator, Producer, CreationDate, and ModDate are useful clues, but templates and export software often leave stale or generic values."
  - "If a PDF contains private details, make a cleaned copy and scan that output again before sharing it."
faqs:
  - question: "How do I view PDF metadata?"
    answer: "Open the PDF in a metadata viewer and inspect its Document properties, XMP fields, page details, software names, and dates. ViewExif reads the file locally in your browser."
  - question: "Can I see who created a PDF?"
    answer: "You may find an Author, Creator, or Producer value, but it can be missing, inherited from a template, or edited later. Treat it as a clue rather than proof of identity."
  - question: "Can PDF metadata show the creation date?"
    answer: "A PDF may contain CreationDate and ModDate fields. They describe what the writing software recorded, not a guaranteed history of when the document was first drafted or published."
  - question: "Is PDF metadata reliable?"
    answer: "Not by itself. PDF metadata can be stale, wrong, or deliberately changed. Compare it with the document, its source, signatures, and other evidence before drawing conclusions."
  - question: "How do I remove PDF metadata?"
    answer: "Create a separate cleaned copy with a PDF metadata remover, then scan that copy again. A full PDF rewrite helps prevent old top-level metadata from remaining recoverable."
related:
  - exif-vs-metadata
  - remove-metadata-from-pdf
  - does-gmail-remove-exif-data
---

To view PDF metadata, open the actual PDF in a metadata viewer and check fields such as Title, Author, Creator, Producer, CreationDate, ModDate, keywords, page count, and XMP. ViewExif reads the file in your browser, so the document stays on your device. The report can tell you which app wrote the PDF and what dates it recorded, but those values can be edited or inherited from an old template.

## How do you view PDF metadata in a browser?

Drop the PDF into a local metadata viewer, wait for the report, then check the readable properties and full native fields.

Open the [Document Metadata Viewer](/document-metadata-viewer/) and choose the PDF you want to inspect. The page checks the file signature instead of trusting the extension. It then reads document properties, page facts, XMP, and the native fields available to the parser.

Start with the readable report. Search for `Author`, `Creator`, `Producer`, `CreationDate`, `ModDate`, `Title`, and `Keywords`. If a value looks odd, switch to the full field view and note its source and path. Two fields with similar labels may come from different metadata blocks.

Use the file you actually received or plan to send. A browser preview, cloud thumbnail, or renamed copy may not be the same set of bytes.

## What PDF metadata can you see?

A PDF may reveal its title, author, dates, writing software, PDF producer, keywords, page facts, and custom XMP fields.

The exact report depends on how the file was made. Microsoft Word, Google Docs, Adobe Acrobat, a scanner, and an online converter can leave different fields. Some write a person's name. Others write only the application or a generic account label.

| PDF field | What it usually describes | Common reason it looks wrong |
| --- | --- | --- |
| Title | Document title saved by the authoring app | Copied from a template or left blank |
| Author | Name or account stored during creation | Old profile name, shared computer, or manual edit |
| Creator | App that created the page content | Shows Word or another source app, not a person |
| Producer | Software that wrote the final PDF structure | Changes after printing, converting, or optimizing |
| CreationDate | Date recorded when this PDF was generated | Not necessarily the date the text was first written |
| ModDate | Date recorded after a later PDF save | May change after a harmless export or metadata edit |
| Subject and Keywords | Descriptive labels | Often stale, incomplete, or copied forward |
| XMP and custom fields | Extra app, rights, workflow, or identity data | Hidden by basic Properties panels |

Page count, page size, encryption state, and PDF version are technical facts rather than authorship claims. They still help identify whether you are looking at the expected file.

## How do you view PDF metadata on Windows and Mac?

Windows Properties and macOS Finder show a small subset; use a full viewer when you need embedded PDF and XMP fields.

On Windows, right-click the PDF, choose **Properties**, and open **Details**. The available rows vary by Windows version and PDF handler. File Explorer may show a title or author, but its Created and Modified dates usually describe the local file copy.

On a Mac, select the file and choose **File > Get Info** for local file facts. Preview can show more through **Tools > Show Inspector**, though it still may not expose every native metadata path.

This distinction is easy to miss. Download a ten-year-old PDF today and Finder or File Explorer can show today's local creation date while the embedded PDF CreationDate remains old. The [EXIF vs metadata guide](/blog/exif-vs-metadata/) explains the same difference between embedded values and file system properties.

## How do you view PDF metadata in Adobe Acrobat?

Open File Properties in Acrobat for common document fields, then use a metadata viewer if you need the full native record.

In Acrobat, open the PDF and choose **File > Properties**. The Description tab commonly shows Title, Author, Subject, Keywords, Created, Modified, Application, and PDF Producer. Other tabs cover fonts, security, and initial view settings rather than ordinary descriptive metadata.

Acrobat is useful when it is already installed, but a short Properties window can make the report look cleaner than it is. XMP namespaces and custom fields may sit outside the few labels shown on screen. That is when the full field list matters.

Do not upload a confidential PDF to a random metadata website just to get a longer report. A local tool is the boring answer, which is exactly what you want for a tax form, contract, or client document.

## Why do the PDF author and date look wrong?

PDF metadata often comes from an old template, account profile, converter, or later export, so it may not match the visible document.

An employee can start from a colleague's template and inherit that colleague's name. A scanner might use the device owner. A converter may replace Creator and Producer while leaving Title untouched. Dates can reflect the latest PDF generation rather than the first draft.

This annoyance shows up in a [LazyLibrarian Reddit discussion about filtering PDF metadata](https://www.reddit.com/r/LazyLibrarian/comments/1krjiy5/feature_request_autoreject_semiautoedit_filter/). The poster found provider names inside downloaded files and wanted a way to remove them while deciding whether to keep useful title and author fields. A maintainer replied that PDF metadata was often incorrect enough that the app ignored it.

PDF metadata is still useful, but one field should not overrule the rest of the file.

## Can PDF metadata prove when a document was created?

No. CreationDate and ModDate are editable claims written by software, not a tamper-proof timeline.

A public PDF sparked a large [r/argentina discussion](https://www.reddit.com/r/argentina/comments/1p5tge6/el_chiqui_mafia_public%C3%B3_en_el_sitio_de_la_afa_un/) because the document was dated months earlier while its metadata said it had been created and edited the previous evening. That mismatch was worth investigating, but the metadata alone could not prove why it happened.

A legitimate re-export can produce the same pattern. So can an updated file posted under an old document date. Someone can also rewrite the metadata deliberately. Compare the PDF with its publication page, digital signatures, revision history, and other records before accusing anyone of backdating a document.

If a signed provenance record matters, the [C2PA Viewer](/c2pa-viewer/) answers a different question: whether supported signed credentials remain cryptographically bound to the current file. Ordinary PDF properties do not provide that guarantee.

## Can PDF metadata expose private information?

Yes. A PDF can reveal a name, organization, email address, software version, timestamps, workflow labels, or custom properties.

The risk is easy to overlook because the pages can look anonymous. A resume exported from a shared computer may carry the wrong account name. A redacted report can still name its creator. A converter may add its own service tag. Custom XMP can preserve fields that a basic Properties panel never shows.

Metadata inspection does not replace reading the document. Names, addresses, comments, attachments, form values, and revision artifacts may also exist in the PDF content or structure. ViewExif reports metadata and safe document facts; it does not claim to be a legal redaction or document forensics service.

If you handle several file types, the [all-format Metadata Viewer](/metadata-viewer/) lets you check PDFs alongside Office documents, images, video, and audio without sending the files to a server.

## How do you remove PDF metadata?

Make a cleaned copy, rewrite the PDF, and scan the output again before sharing it.

Use the [Document Metadata Remover](/document-metadata-remover/) to clear top-level PDF Info and XMP fields. The tool rewrites the PDF with qpdf so old top-level values are not merely hidden behind an incremental update. It keeps the pages, forms, annotations, and attachments because those are document content, not descriptive metadata.

Download the cleaned copy only after the structure check passes. Then put that exact output back into the metadata viewer. Look for the author, title, organization, dates, software, and custom fields you wanted to remove.

A zero-looking metadata panel does not make the document anonymous. The filename and visible pages can still identify a person or project, and an attachment inside the PDF can have metadata of its own. Clean the copy you will actually send, not a nearby file with almost the same name.
