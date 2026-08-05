export const FIELD_ALIASES = Object.freeze({
  latitude: ['GPSLatitude', 'gps:latitude', 'Location Latitude', 'latitude'],
  longitude: ['GPSLongitude', 'gps:longitude', 'Location Longitude', 'longitude'],
  latitudeRef: ['GPSLatitudeRef', 'gps:latitudeRef'],
  longitudeRef: ['GPSLongitudeRef', 'gps:longitudeRef'],
  destinationLatitude: ['GPSDestLatitude', 'GPSDestinationLatitude'],
  destinationLongitude: ['GPSDestLongitude', 'GPSDestinationLongitude'],
  destinationLatitudeRef: ['GPSDestLatitudeRef', 'GPSDestinationLatitudeRef'],
  destinationLongitudeRef: ['GPSDestLongitudeRef', 'GPSDestinationLongitudeRef'],
  altitude: ['GPSAltitude', 'gps:altitude', 'Location Altitude'],
  direction: ['GPSImgDirection', 'GPSDestBearing', 'gps:direction'],
  place: ['Location', 'Sublocation', 'City', 'State', 'ProvinceState', 'Country', 'CountryPrimaryLocationName', 'LocationCreated', 'LocationShown', 'LocationCreatedCity', 'LocationShownCity', 'GPSAreaInformation', 'Scene'],
  deviceModel: ['Make', 'Model', 'CameraModelName', 'UniqueCameraModel', 'LensModel', 'LensID'],
  deviceIdentifier: ['SerialNumber', 'BodySerialNumber', 'LensSerialNumber', 'InternalSerialNumber', 'CameraSerialNumber', 'ImageUniqueID', 'DeviceID', 'UniqueID', 'CameraID', 'LensIDNumber'],
  deviceOwner: ['CameraOwnerName', 'OwnerName', 'CameraOwner', 'HostComputer'],
  creator: ['Artist', 'Author', 'Creator', 'By-line', 'Byline', 'Credit', 'ImageCreator', 'ArtworkCreator'],
  people: ['PersonInImage', 'PersonShown', 'RegionPersonDisplayName', 'RegionPersonName', 'ArtworkOrObjectInImage'],
  contact: ['Email', 'Contact', 'CreatorContactInfo', 'CiEmailWork', 'CiTelWork', 'CiAdrExtadr', 'CiAdrCity', 'CiAdrRegion', 'CiAdrPcode', 'CiAdrCtry', 'CiUrlWork', 'LicensorEmail', 'LicensorTelephone', 'LicensorURL'],
  rights: ['Copyright', 'Rights', 'CopyrightNotice', 'UsageTerms'],
  captureTime: ['DateTimeOriginal', 'CreateDate', 'DateCreated', 'SubSecDateTimeOriginal', 'OffsetTimeOriginal', 'GPSDateStamp'],
  modificationTime: ['ModifyDate'],
  software: ['Software', 'CreatorTool', 'ProcessingSoftware'],
  editingHistory: ['History', 'HistoryAction', 'HistoryParameters', 'HistorySoftwareAgent', 'DerivedFrom', 'DocumentAncestors', 'DocumentID', 'InstanceID', 'OriginalDocumentID', 'RenditionClass', 'MetadataDate'],
  thumbnail: ['HasEmbeddedThumbnail', 'Thumbnail', 'ThumbnailImage', 'PreviewImage', 'OtherImage', 'MPImage', 'JpgFromRaw', 'PreviewTIFF', 'GainMapImage', 'DepthMap'],
  originalFile: ['OriginalFileName', 'PreservedFileName', 'RawFileName', 'OriginalRawFileName', 'SourceFileName'],
  aiPrompt: ['Positive Prompt', 'Prompt', 'Negative Prompt', 'Generation Parameters', 'parameters'],
  aiSettings: ['Model', 'Model Hash', 'ModelHash', 'Seed', 'LoRA', 'LoRAs', 'Sampler', 'Scheduler'],
  workflow: ['Workflow', 'ComfyUI Workflow', 'ComfyWorkflow'],
});

export const SOFTWARE_NAMES = /\b(?:adobe|photoshop|lightroom|capture one|gimp|imagemagick|image magick|comfyui|automatic1111|stable diffusion|fooocus|invokeai|novelai|metadataview)\b/i;
export const EMAIL_PATTERN = /^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?)+$/i;
export const WINDOWS_PATH_PATTERN = /\b[A-Za-z]:\\(?:Users|Documents and Settings|ProgramData|home)\\[^\s"'<>]+/i;
export const UNIX_PATH_PATTERN = /(?:\/Users\/[^\s"'<>]+|\/home\/[^\s"'<>]+)/i;
export const TOKEN_URL_PATTERN = /https?:\/\/[^\s"'<>]+[?&](?:access_?token|auth|api_?key|secret|signature|sig)=[^\s&#"'<>]+/i;
export const INTERNAL_ADDRESS_PATTERN = /(?:\blocalhost\b|\b127(?:\.\d{1,3}){3}\b|\b10(?:\.\d{1,3}){3}\b|\b192\.168(?:\.\d{1,3}){2}\b|\b172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2}\b|file:\/\/[^\s"'<>]+)/i;
