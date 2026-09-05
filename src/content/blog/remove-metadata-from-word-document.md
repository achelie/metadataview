---
title: "How to Remove Metadata From a Word Document"
seoTitle: "How to Remove Metadata From a Word Document | ViewExif"
description: "Remove metadata from a Word document, clear author names, dates, company details and custom properties, then verify the cleaned DOCX before sharing it."
excerpt: "A Word file can keep author names, company details, dates, template names and custom properties. Clean a copy, handle comments separately, and scan the result."
category: "Document privacy"
tags:
  - remove metadata from Word document
  - Word metadata remover
  - remove Word author
  - DOCX properties
publishedAt: 2026-08-27
updatedAt: 2026-09-05
featured: false
author: "ViewExif"
cover: "../../assets/blog/remove-metadata-from-word-document.webp"
coverAlt: "Documents, a magnifying glass and a laptop prepared for removing metadata from a Word document"
practicalTake:
  - "Work on a copy because Word's Document Inspector can remove comments and revision data that Undo may not restore."
  - "Treat document properties and tracked changes as separate jobs. A metadata cleaner should not silently delete edits or comments."
  - "Open and rescan the exact cleaned DOCX before sending it. An empty Author box does not prove every property is gone."
faqs:
  - question: "How do I remove metadata from a Word document?"
    answer: "Save a copy, use Word's Document Inspector for hidden content, remove the DOCX properties you do not want to share, and scan the cleaned file before sending it."
  - question: "Can a Word document contain the author's name?"
    answer: "Yes. DOCX files may store Author, Last Modified By, company, manager, template and custom properties, while comments and tracked changes can name collaborators too."
  - question: "Can I remove DOCX metadata without deleting the text?"
    answer: "Yes. A metadata-only cleanup can rewrite Core, App and Custom Properties while preserving the document body, images, comments and tracked changes."
  - question: "Does Word for Mac have Document Inspector?"
    answer: "No. Microsoft says Word for Mac does not include Document Inspector. You can edit properties manually, but comments and other hidden content need a separate review."
  - question: "Does saving a Word document as PDF remove its metadata?"
    answer: "Not reliably. The PDF export may copy the author, title, dates or software name and add new PDF metadata, so inspect the exported PDF separately."
related:
  - remove-metadata-from-pdf
  - how-to-view-pdf-metadata
  - does-gmail-remove-exif-data
---

To remove metadata from a Word document, save a copy, clear its document properties, deal with comments and tracked changes separately, then inspect the cleaned DOCX before sharing it. A Word file can store the author, last editor, company, template, dates, title and custom fields even when the page itself looks anonymous. Use the original only as a backup. Send the cleaned copy.

## How do you remove metadata from a Word document?

Make a copy, inspect it, remove the unwanted properties, then open and scan the cleaned file again.

For Word on Windows, start with Microsoft's Document Inspector. It can find document properties as well as comments, tracked changes, hidden text and other content that a basic Properties window misses. Choose only the categories you mean to remove.

Then run the DOCX through the [Document Metadata Remover](/document-metadata-remover/). ViewExif clears identity and descriptive fields from the Core, App and Custom Properties parts of the package. It preserves the body and images. It also leaves comments and revisions alone, so any review notes you forgot about will still be in the cleaned file.

ViewExif supports DOCX, not the older binary DOC format or macro-enabled DOCM files. If you have a DOC file, use Word to save a separate DOCX copy first and review the conversion before cleaning it.

## What metadata can a Word document store?

A DOCX can store names, dates, company details, titles, keywords, template information, statistics and custom properties.

Modern Word files are ZIP packages. The document text sits in one group of XML files, while properties usually live under `docProps`. Comments and tracked changes live elsewhere in the package, which is why they need their own review.

| Word field or area | What it may reveal | How to handle it |
| --- | --- | --- |
| Author | The account or template owner | Remove if the name should stay private |
| Last Modified By | The last saved-by account | Remove with the other Core Properties |
| Created and Modified | Dates written by Word or another editor | Treat as editable history, not proof |
| Title, Subject and Keywords | Project names or internal labels | Search the full property report |
| Company and Manager | Workplace details from Office settings | Clear from App Properties |
| Template | A template name or path clue | Remove when it identifies a firm or workflow |
| Custom Properties | Client codes, case names or internal IDs | Delete the values and their property entries |
| Comments and tracked changes | Reviewer names, notes and edit history | Review in Word because these are document content |

The [EXIF vs metadata guide](/blog/exif-vs-metadata/) explains the broader distinction. EXIF belongs mainly to images. Word uses Office document properties and package data instead.

## How do you use Word's Document Inspector on Windows?

Open a copy in desktop Word, choose File, Info, Check for Issues, Inspect Document, then review each result before selecting Remove All.

[Microsoft's Document Inspector instructions](https://support.microsoft.com/en-US/Office/collab-files/remove-hidden-data-and-personal-information-by-inspecting-documents-presentations-or-workbooks) recommend inspecting a copy because some removed information cannot be restored with Undo. That is sensible advice, especially for tracked changes and comments.

Do not mash every Remove All button without reading the label. Removing document properties is different from removing comments, headers, hidden text or custom XML. A contract may need its header. A collaborative draft may still need its comments. Pick the categories that match the copy you plan to send.

After removal, select Reinspect. This catches categories that still contain data before you close Word.

## What can you remove on Mac or in Word for the web?

Word for Mac can edit properties manually, while Word for the web cannot currently inspect or change them like desktop Word.

Microsoft's [current Word inspection page](https://support.microsoft.com/en-au/office/inspect-document-b0088a7a-d482-4b87-b762-7c94c7c71e23) says Word for Mac does not have Document Inspector. On a Mac, open File, Properties to review Summary and Custom fields. Word for the web directs you to open the desktop app.

For a DOCX property cleanup that does not depend on Word's menus, use the [Document Metadata Remover](/document-metadata-remover/) in your browser. The file stays in the current tab. Remember that ViewExif intentionally leaves comments, tracked changes and document text in place, so review those in Word before sending the copy.

## Are comments and tracked changes just metadata?

No. They can reveal people and edits, but they are review content rather than ordinary DOCX properties.

A law firm administrator raised this exact problem in an [r/msp discussion about automatic Word cleanup](https://www.reddit.com/r/msp/comments/mrgkum/software_to_auto_strip_metadata_from_word/). The firm wanted comments and tracked changes stripped before lawyers emailed documents to another firm. The hard part was not finding the Author field. It was building a reliable send-time process that also worked on Macs.

Word's Document Inspector can remove comments, revision marks, version information and annotations on supported Windows desktop versions. ViewExif does not remove them because the Document Metadata Remover follows a content-preserving policy. Use Word for that review, then use ViewExif to clean and verify the remaining package properties.

Accepting all tracked changes does not remove ordinary properties such as Author or Company. Deleting comments does not clear Last Modified By. Check the review content in Word, then check the package properties separately.

## Is clearing Author enough to remove Word metadata?

No. Author is one property among several, and a DOCX may also contain custom fields or collaborator details in comments.

An [r/privacy user spent hours looking for a reliable Office cleanup route](https://www.reddit.com/r/privacy/comments/7gkhwf/what_software_is_there_to_remove_metadata_from/). Part of the confusion was whether Document Inspector depended on Windows 10. It actually depends on the Office app and version, not the Windows release alone.

The short Properties panel is useful, but incomplete. Search for Last Modified By, company, manager, template, title, subject, keywords, dates and custom properties. If the document came from a client template, a blank Author can still leave the client's name elsewhere.

Run the [Document Metadata Viewer](/document-metadata-viewer/) before and after cleanup. It reads DOCX Core, App and Custom Properties without extracting the document body into the report.

## Can removed Word metadata be recovered?

Usually not from the cleaned copy if the property values were overwritten, but an older version or backup may still contain them.

That distinction appears in a recent [r/MicrosoftWord plagiarism discussion](https://www.reddit.com/r/MicrosoftWord/comments/1tprgty/retrieving_word_metadata/). The poster received a file with its author data removed and wanted to recover it. One reply explained that Document Inspector's Remove All operation replaces those properties with blanks. Another suggested opening the DOCX as a ZIP to inspect what remains.

Opening a DOCX package can reveal properties that still exist. It cannot recreate a value that is no longer present. Previous versions in OneDrive, SharePoint, email attachments, backups or another collaborator's copy are separate files and may still hold the old information.

Metadata is also weak evidence of authorship. A name can be changed, inherited from a template or removed. Do not treat an Author field, present or absent, as proof in a plagiarism dispute.

## Does saving as PDF remove Word metadata?

No. A PDF export can copy Word properties and add its own creator, producer and date fields.

Exporting is useful when the recipient does not need to edit the document, but it is not a dependable privacy scrubber. Inspect the resulting PDF with the [Document Metadata Viewer](/document-metadata-viewer/). If it contains names or workflow details, follow the guide to [remove metadata from PDF](/blog/remove-metadata-from-pdf/).

The conversion can also preserve comments if you print markup, and visible tracked changes may become part of the PDF page. Check the export settings and read the output. A clean property report cannot hide words that are printed on the page.

## How do you verify the cleaned DOCX?

Open the exact downloaded copy, compare its content with the original, and scan its document properties again.

Drop the cleaned file into the [Document Metadata Viewer](/document-metadata-viewer/). Search for personal names, email addresses, company names, client codes, template names, titles, dates and custom properties. Check the file type and package report, then open the DOCX in Word to confirm the text, images and layout still work.

Windows and macOS will give the cleaned file new local Created or Modified timestamps. Those file system dates describe that copy on that computer. They are not the same as dates embedded in the DOCX package.

If you plan to email the file, attach only the cleaned copy. The [Gmail attachment guide](/blog/does-gmail-remove-exif-data/) is about images, but its practical point applies here too: email is transport, not a metadata cleaner.

## Use the right order before the final send

Finish the content review first: resolve comments and tracked changes in Word if the recipient should not see them. Then inspect and clean the remaining package properties. Finally open the cleaned copy to check its layout, and avoid saving it again unnecessarily before attaching it.

A later save can repopulate authoring properties using the editor's account settings. If you do edit or save again, inspect that new version. A clean `docProps` report cannot certify comments or document text, and a PDF export introduces a separate properties record that needs its own review.

## Does removing Word metadata make the document anonymous?

No. The filename, visible text, comments, tracked changes and sharing records can still identify a person or organization.

Read the document as a stranger would. Search for names, initials, email addresses, customer numbers and internal project terms. Check headers, footers, comments, links and filenames. If the DOCX came from OneDrive or SharePoint, cleaning the downloaded file does not erase the service's version history or access logs.

The cleaned copy closes one easy leak. It does not redact the page or erase an older cloud version. Before sending it, open the file once more and read it as if it came from somebody else.
