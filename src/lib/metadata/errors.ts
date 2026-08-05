export const ERROR_CODES = [
  'UNSUPPORTED_FILE_TYPE',
  'FILE_TOO_LARGE',
  'INVALID_FILE_SIGNATURE',
  'MIME_SIGNATURE_MISMATCH',
  'CORRUPTED_FILE',
  'PNG_CHUNK_TOO_LARGE',
  'PNG_INFLATED_TEXT_TOO_LARGE',
  'METADATA_STRING_TOO_LARGE',
  'METADATA_LIMIT_REACHED',
  'INVALID_COMPRESSED_METADATA',
  'INVALID_WORKFLOW_JSON',
  'WORKFLOW_TOO_LARGE',
  'ENCRYPTED_PDF',
  'UNSUPPORTED_CODEC',
  'C2PA_UNSUPPORTED',
  'C2PA_WASM_LOAD_FAILED',
  'C2PA_VALIDATION_FAILED',
  'IMAGE_DECODE_FAILED',
  'IMAGE_TOO_LARGE_TO_REENCODE',
  'WORKER_CRASHED',
  'PARSE_CANCELLED',
  'IMAGE_ENCODE_FAILED',
  'PARSE_TIMEOUT',
  'UNKNOWN_PARSE_ERROR',
] as const;

export type ParseErrorCode = (typeof ERROR_CODES)[number];

export class MetadataError extends Error {
  readonly code: ParseErrorCode;

  constructor(code: ParseErrorCode, message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'MetadataError';
    this.code = code;
  }
}

export function toMetadataError(error: unknown): MetadataError {
  if (error instanceof MetadataError) return error;
  const message = error instanceof Error ? error.message : 'The file could not be inspected.';
  return new MetadataError('UNKNOWN_PARSE_ERROR', message, {
    cause: error instanceof Error ? error : undefined,
  });
}
