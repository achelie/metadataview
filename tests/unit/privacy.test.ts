import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ImageMetadataField, ImageMetadataGroup, ImageMetadataSection, NormalizedImageMetadata } from '../../src/lib/metadata/types';
import { createPrivacyReport, createPrivacyReportFromRules, levelForScore } from '../../src/lib/privacy/create-privacy-report';
import { createSafePrivacyExport, privacyReportFilename } from '../../src/lib/privacy/safe-report-export';
import type { PrivacyRule } from '../../src/lib/privacy/types';

interface FieldInput { key: string; value: unknown; group?: ImageMetadataGroup; label?: string; source?: string }

function metadata(inputs: FieldInput[] = [], options: { thumbnail?: boolean; lastModified?: string; location?: Partial<NormalizedImageMetadata['location']> } = {}): NormalizedImageMetadata {
  const byGroup = new Map<ImageMetadataGroup, ImageMetadataField[]>();
  inputs.forEach((input, index) => {
    const group = input.group ?? 'privacy';
    const displayValue = typeof input.value === 'string' ? input.value : JSON.stringify(input.value);
    const field: ImageMetadataField = { id: `${group}-${index}`, key: input.key, label: input.label ?? input.key, path: input.key, value: input.value, displayValue, group, source: input.source ?? 'Test fixture', sensitive: false, searchValue: `${input.key} ${displayValue}`.toLowerCase() };
    byGroup.set(group, [...(byGroup.get(group) ?? []), field]);
  });
  const sections: ImageMetadataSection[] = [...byGroup].map(([id, fields]) => ({ id, title: id, note: 'fixture', fields }));
  return {
    file: { name: 'fixture.png', safeName: 'fixture', size: 512, mime: 'image/png', detectedType: 'png', extension: 'png', lastModified: options.lastModified, declaredMime: 'image/png', actualFormat: 'png', width: 32, height: 24, megapixels: 0.001, aspectRatio: '4:3', animated: false, alpha: true, metadataFieldCount: inputs.length, warningCount: 0, hasEmbeddedMetadata: inputs.length > 0 || Boolean(options.thumbnail) },
    sections,
    location: { valid: false, ...options.location },
    container: { kind: 'png', hasIcc: false, hasExif: false, hasXmp: false, hasAlpha: true, animated: false },
    raw: {}, warnings: [], legacy: options.thumbnail ? { HasEmbeddedThumbnail: true } : {},
  };
}

function report(fields: FieldInput[], options?: Parameters<typeof metadata>[1]) { return createPrivacyReport(metadata(fields, options)); }
function risk(fields: FieldInput[], id: string, options?: Parameters<typeof metadata>[1]) { return report(fields, options).risks.find((item) => item.id === id); }

afterEach(() => vi.useRealTimers());

describe('image privacy rules', () => {
  it('detects valid GPS coordinates as one critical 40-point rule', () => { const item = risk([{key:'GPSLatitude',value:40.7,group:'location'},{key:'GPSLongitude',value:-74,group:'location'}], 'precise-location'); expect(item).toMatchObject({ score: 40, severity: 'critical' }); });
  it('does not treat latitude alone as precise location', () => expect(risk([{key:'GPSLatitude',value:40.7,group:'location'}], 'precise-location')).toBeUndefined());
  it('rejects an invalid latitude', () => expect(risk([{key:'GPSLatitude',value:91,group:'location'},{key:'GPSLongitude',value:1,group:'location'}], 'precise-location')).toBeUndefined());
  it('rejects an invalid longitude', () => expect(risk([{key:'GPSLatitude',value:1,group:'location'},{key:'GPSLongitude',value:181,group:'location'}], 'precise-location')).toBeUndefined());
  it('applies south and west coordinate references', () => { const item = risk([{key:'GPSLatitude',value:33.9,group:'location'},{key:'GPSLatitudeRef',value:'S',group:'location'},{key:'GPSLongitude',value:151.2,group:'location'},{key:'GPSLongitudeRef',value:'W',group:'location'}], 'precise-location'); expect(item?.fields.map((field)=>field.rawValue)).toEqual(expect.arrayContaining([33.9,151.2,'S','W'])); });
  it('accepts explicit zero-zero coordinates', () => expect(risk([{key:'GPSLatitude',value:0,group:'location'},{key:'GPSLongitude',value:0,group:'location'}], 'precise-location')).toBeDefined());
  it('scores altitude alone as low risk', () => expect(risk([{key:'GPSAltitude',value:140,group:'location'}], 'gps-altitude')).toMatchObject({score:5,severity:'low'}));
  it('does not separately score altitude when coordinates exist', () => expect(risk([{key:'GPSLatitude',value:1,group:'location'},{key:'GPSLongitude',value:2,group:'location'},{key:'GPSAltitude',value:3,group:'location'}], 'gps-altitude')).toBeUndefined());
  it('scores direction alone as low risk', () => expect(risk([{key:'GPSImgDirection',value:90,group:'location'}], 'gps-direction')).toMatchObject({score:3}));
  it('adds the GPS plus capture-time combination', () => expect(risk([{key:'GPSLatitude',value:1,group:'location'},{key:'GPSLongitude',value:2,group:'location'},{key:'DateTimeOriginal',value:'2026:01:02 03:04:05',group:'dates'}], 'location-time-combination')).toMatchObject({score:10,severity:'high'}));

  it('detects a normal device model without calling it an identifier', () => { const value = report([{key:'Model',value:'Fujifilm X-T5',group:'camera'}]); expect(value.risks.map((item)=>item.id)).toEqual(['device-model']); });
  it('detects a body serial number', () => expect(risk([{key:'BodySerialNumber',value:'AB123456',group:'camera'}], 'device-identifier')).toMatchObject({score:25}));
  it('detects a lens serial number', () => expect(risk([{key:'LensSerialNumber',value:'LENS-991',group:'camera'}], 'device-identifier')).toBeDefined());
  it('detects a camera owner name', () => expect(risk([{key:'CameraOwnerName',value:'Ada Lovelace',group:'author'}], 'device-owner')).toMatchObject({score:20}));
  it('detects an author name', () => expect(risk([{key:'Artist',value:'Ada Lovelace',group:'author'}], 'creator-identity')).toMatchObject({score:15}));
  it('does not treat an editing application as a person', () => expect(risk([{key:'Creator',value:'Adobe Photoshop',group:'author'}], 'creator-identity')).toBeUndefined());
  it('detects a valid email address', () => expect(risk([{key:'CiEmailWork',value:'ada@example.test',group:'author'}], 'contact-details')).toMatchObject({score:25}));
  it('does not treat a stray at-sign as an email', () => expect(risk([{key:'Email',value:'find me @ the studio',group:'author'}], 'contact-details')).toBeUndefined());
  it('detects a plausible phone number', () => expect(risk([{key:'CiTelWork',value:'+1 (212) 555-0100',group:'author'}], 'contact-details')).toBeDefined());
  it('scores rights text neutrally', () => expect(risk([{key:'CopyrightNotice',value:'© Ada Studio',group:'author'}], 'rights-information')).toMatchObject({score:8,severity:'medium'}));

  it('detects embedded capture time', () => expect(risk([{key:'DateTimeOriginal',value:'2026:01:02 03:04:05',group:'dates'}], 'capture-time')).toMatchObject({score:10}));
  it('ignores browser File.lastModified', () => expect(report([], {lastModified:'2026-01-02T03:04:05.000Z'}).risks).toHaveLength(0));
  it('scores embedded modification time only when capture time is absent', () => expect(risk([{key:'ModifyDate',value:'2026:01:02 03:04:05',group:'dates'}], 'modification-time')).toMatchObject({score:3}));
  it('does not double-score modification time with capture time', () => expect(risk([{key:'DateTimeOriginal',value:'2026:01:01',group:'dates'},{key:'ModifyDate',value:'2026:01:02',group:'dates'}], 'modification-time')).toBeUndefined());
  it('detects processing software', () => expect(risk([{key:'ProcessingSoftware',value:'Darktable 5',group:'software'}], 'software-information')).toMatchObject({score:3}));
  it('scores a document ID as an 8-point history signal', () => expect(risk([{key:'DocumentID',value:'xmp.did:123',group:'privacy'}], 'editing-history')).toMatchObject({score:8}));
  it('scores detailed edit history at 15 points', () => expect(risk([{key:'HistoryAction',value:'saved, converted, cropped',group:'privacy'}], 'editing-history')).toMatchObject({score:15}));
  it('detects a real embedded thumbnail flag', () => expect(risk([], 'embedded-thumbnail', {thumbnail:true})).toMatchObject({score:12}));
  it('does not infer a thumbnail from the main image', () => expect(risk([], 'embedded-thumbnail')).toBeUndefined());

  it('detects an AI prompt without claiming it is always secret', () => expect(risk([{key:'Positive Prompt',value:'editorial portrait in rain',group:'ai'}], 'ai-prompt')).toMatchObject({score:8}));
  it('merges several AI settings into one 5-point risk', () => { const value = report([{key:'Model',value:'flux.safetensors',group:'ai'},{key:'Seed',value:42,group:'ai'},{key:'Sampler',value:'euler',group:'ai'}]); expect(value.risks.filter((item)=>item.id==='ai-settings')).toHaveLength(1); expect(risk([], 'nope')).toBeUndefined(); expect(value.risks.find((item)=>item.id==='ai-settings')?.score).toBe(5); });
  it('does not confuse a camera Model with an AI model', () => expect(risk([{key:'Model',value:'Nikon Z8',group:'camera'}], 'ai-settings')).toBeUndefined());
  it('detects a valid ComfyUI workflow object', () => expect(risk([{key:'Workflow',value:{'1':{class_type:'KSampler'}},group:'ai'}], 'comfy-workflow')).toMatchObject({score:15,severity:'high'}));
  it('rejects malformed workflow JSON', () => expect(risk([{key:'Workflow',value:'{not json',group:'ai'}], 'comfy-workflow')).toBeUndefined());

  it('detects and masks a Windows user path', () => { const item=risk([{key:'SourceFile',value:'C:\\Users\\Jonathan\\Pictures\\draft.png',group:'ai'}], 'local-file-path'); expect(item?.fields[0]?.displayValue).toContain('Jo***'); expect(item?.fields[0]?.rawValue).toContain('Jonathan'); });
  it('detects and masks a macOS user path', () => expect(risk([{key:'Input',value:'/Users/morgan/Models/lora.safetensors',group:'ai'}], 'local-file-path')?.fields[0]?.displayValue).toContain('/Users/mo***/'));
  it('detects and masks a Linux home path', () => expect(risk([{key:'Input',value:'/home/alex/work/private.png',group:'ai'}], 'local-file-path')?.fields[0]?.displayValue).toContain('/home/al***/'));
  it('detects a private IP without opening it', () => expect(risk([{key:'Endpoint',value:'http://192.168.1.20:8188/view',group:'ai'}], 'internal-network-address')).toMatchObject({score:10,severity:'medium'}));
  it('redacts a credential-bearing URL preview and scores it high', () => { const item=risk([{key:'Callback',value:'https://example.test/job?access_token=secret-123',group:'ai'}], 'internal-network-address'); expect(item).toMatchObject({score:25,severity:'high'}); expect(item?.fields[0]?.displayValue).toContain('[redacted]'); });
});

describe('privacy combinations, deduplication, and scoring', () => {
  it('adds a name plus contact combination', () => expect(risk([{key:'Artist',value:'Ada',group:'author'},{key:'Email',value:'ada@example.test',group:'author'}], 'identity-contact-combination')).toMatchObject({score:10,severity:'high'}));
  it('adds a workflow plus local-path combination', () => expect(risk([{key:'Workflow',value:{'1':{class_type:'LoadImage'}},group:'ai'},{key:'Input',value:'C:\\Users\\Ada\\input.png',group:'ai'}], 'workflow-path-combination')).toMatchObject({score:10,severity:'critical'}));
  it('adds a model plus serial combination', () => expect(risk([{key:'Model',value:'Canon R5',group:'camera'},{key:'SerialNumber',value:'1234',group:'camera'}], 'model-serial-combination')).toMatchObject({score:5}));
  it('adds a location plus device combination', () => expect(risk([{key:'GPSLatitude',value:1,group:'location'},{key:'GPSLongitude',value:2,group:'location'},{key:'Model',value:'Canon R5',group:'camera'}], 'location-device-combination')).toMatchObject({score:5}));
  it('adds a capped high-correlation location, name, and time rule', () => expect(risk([{key:'GPSLatitude',value:1,group:'location'},{key:'GPSLongitude',value:2,group:'location'},{key:'Artist',value:'Ada',group:'author'},{key:'DateTimeOriginal',value:'2026:01:01',group:'dates'}], 'location-identity-time-combination')).toMatchObject({score:10,severity:'critical'}));
  it('does not score duplicate EXIF and XMP coordinates twice', () => { const value=report([{key:'GPSLatitude',value:1,group:'location',source:'EXIF'},{key:'GPSLongitude',value:2,group:'location',source:'EXIF'},{key:'exif.GPSLatitude',value:1,group:'location',source:'XMP'},{key:'exif.GPSLongitude',value:2,group:'location',source:'XMP'}]); expect(value.risks.filter((item)=>item.id==='precise-location')).toHaveLength(1); expect(value.risks.find((item)=>item.id==='precise-location')?.fields).toHaveLength(2); expect(value.score).toBe(40); });
  it('merges duplicate author values inside one rule', () => { const item=risk([{key:'Artist',value:'Ada',group:'author'},{key:'Creator',value:'Ada',group:'author'}], 'creator-identity'); expect(item?.fields).toHaveLength(1); expect(item?.score).toBe(15); });
  it('caps a crowded report at 100', () => { const value=report([{key:'GPSLatitude',value:1,group:'location'},{key:'GPSLongitude',value:2,group:'location'},{key:'DateTimeOriginal',value:'2026',group:'dates'},{key:'Model',value:'X-T5',group:'camera'},{key:'SerialNumber',value:'ABC',group:'camera'},{key:'Artist',value:'Ada',group:'author'},{key:'Email',value:'ada@example.test',group:'author'},{key:'Positive Prompt',value:'private project',group:'ai'},{key:'Workflow',value:{'1':{}},group:'ai'},{key:'Input',value:'C:\\Users\\Ada\\secret.png',group:'ai'}],{thumbnail:true}); expect(value.score).toBe(100); });
  it('sorts risks by severity, score, and ID', () => { const risks=report([{key:'GPSLatitude',value:1,group:'location'},{key:'GPSLongitude',value:2,group:'location'},{key:'DateTimeOriginal',value:'2026',group:'dates'},{key:'Model',value:'X-T5',group:'camera'}]).risks; const ranks={critical:4,high:3,medium:2,low:1}; expect(risks).toEqual([...risks].sort((a,b)=>ranks[b.severity]-ranks[a.severity]||b.score-a.score||a.id.localeCompare(b.id))); });
  it('uses exact level thresholds', () => { expect([0,19,20,39,40,69,70,100].map(levelForScore)).toEqual(['Low','Low','Moderate','Moderate','High','High','Critical','Critical']); });
  it('returns a stable report for the same input and clock', () => { vi.useFakeTimers(); vi.setSystemTime(new Date('2026-07-31T12:00:00Z')); const fixture=metadata([{key:'Artist',value:'Ada',group:'author'}]); expect(createPrivacyReport(fixture)).toEqual(createPrivacyReport(fixture)); });
  it('does not mutate normalized metadata', () => { const fixture=metadata([{key:'Artist',value:'Ada',group:'author'}]); const before=structuredClone(fixture); createPrivacyReport(fixture); expect(fixture).toEqual(before); });
  it('returns score zero for empty metadata', () => expect(createPrivacyReport(metadata())).toMatchObject({score:0,level:'Low',risks:[]}));
  it('keeps running when one rule throws', () => { const broken: PrivacyRule={id:'broken',category:'other',title:'Broken',severity:'low',weight:1,evaluate(){throw new Error('sensitive detail');}}; const value=createPrivacyReportFromRules(metadata([{key:'Artist',value:'Ada',group:'author'}]),[broken]); expect(value.score).toBe(0); expect(value.warnings).toEqual(['Privacy rule broken could not be evaluated.']); });
});

describe('safe privacy report export', () => {
  it('is JSON serializable, masks identifiers, and excludes raw values and raw metadata', () => { const value=report([{key:'SerialNumber',value:'SECRET-123',group:'camera'}]); const exported=createSafePrivacyExport(value); const text=JSON.stringify(exported); expect(()=>JSON.parse(text)).not.toThrow(); expect(text).not.toContain('rawValue'); expect(text).not.toContain('"raw"'); expect(text).not.toContain('SECRET-123'); expect(text).toContain('SE***23'); });
  it('contains the documented schema 1.2 top-level report fields', () => expect(Object.keys(createSafePrivacyExport(report([])))).toEqual(['version','evidencePolicyVersion','generatedAt','file','completeness','engines','score','level','scoreTimeline','sourceStats','fieldStats','summary','detectedFieldCount','sensitiveFieldCount','risks','warnings','scanWarnings','disclaimer']));
  it('uses a sanitized privacy-report filename', () => expect(privacyReportFilename('../My unsafe <image>.png')).toBe('My-unsafe-image.privacy-report.json'));
  it('does not include worker or binary image fields', () => { const exported=createSafePrivacyExport(report([{key:'Workflow',value:{'1':{}},group:'ai'}])); const text=JSON.stringify(exported); expect(text).not.toMatch(/blob:|worker|thumbnailBytes|arrayBuffer/i); });
});
