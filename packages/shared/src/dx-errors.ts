import type { ZodError } from 'zod';

export type DxErrorCode =
  | 'PERMISSION_DENIED'
  | 'MISSING_API_KEY'
  | 'INVALID_PARAMS'
  | 'AI_PROVIDER_ERROR'
  | 'STORAGE_ERROR'
  | 'DB_ERROR'
  | 'UNKNOWN';

export interface SerializedDxError {
  __dxError: true;
  code: DxErrorCode;
  message: string;
  suggestion: string;
}

export class DxError extends Error {
  code: DxErrorCode;
  suggestion: string;

  constructor(code: DxErrorCode, message: string, suggestion: string) {
    super(message);
    this.name = 'DxError';
    this.code = code;
    this.suggestion = suggestion;
  }

  toSerializable(): SerializedDxError {
    return {
      __dxError: true,
      code: this.code,
      message: this.message,
      suggestion: this.suggestion,
    };
  }

  static fromSerializable(obj: SerializedDxError): DxError {
    return new DxError(obj.code, obj.message, obj.suggestion);
  }

  static isSerializedDxError(value: unknown): value is SerializedDxError {
    return (
      typeof value === 'object' &&
      value !== null &&
      (value as SerializedDxError).__dxError === true &&
      typeof (value as SerializedDxError).code === 'string' &&
      typeof (value as SerializedDxError).message === 'string' &&
      typeof (value as SerializedDxError).suggestion === 'string'
    );
  }
}

// --- Factory functions ---

export function permissionDenied(appId: string, permission: string): DxError {
  return new DxError(
    'PERMISSION_DENIED',
    `App "${appId}" does not have "${permission}" permission`,
    `Add "${permission}" to the permissions array in your manifest.json`
  );
}

export function missingApiKey(triedProviders: string[]): DxError {
  const tried = triedProviders.length > 0 ? triedProviders.join(', ') : 'none';
  return new DxError(
    'MISSING_API_KEY',
    `No API key available. Tried providers: ${tried}`,
    'Open Settings and add an API key for one of your app\'s supported providers'
  );
}

export function invalidParams(error: ZodError): DxError {
  const issues = error.issues
    .map((i) => `${i.path.join('.')}: ${i.message}`)
    .join('; ');
  return new DxError(
    'INVALID_PARAMS',
    `Invalid parameters: ${issues}`,
    'Check the Bridge API documentation for the correct parameter format'
  );
}

export function aiProviderError(
  provider: string,
  originalMessage: string
): DxError {
  return new DxError(
    'AI_PROVIDER_ERROR',
    `${provider} API error: ${originalMessage}`,
    'Check that your API key is valid and you have sufficient credits'
  );
}

export function storageError(
  operation: string,
  originalMessage: string
): DxError {
  return new DxError(
    'STORAGE_ERROR',
    `Storage ${operation} failed: ${originalMessage}`,
    'Ensure your app has the correct storage permissions in manifest.json'
  );
}

export function dbError(operation: string, originalMessage: string): DxError {
  return new DxError(
    'DB_ERROR',
    `Database ${operation} failed: ${originalMessage}`,
    'Check your SQL syntax and ensure your app has "storage.db" permission in manifest.json'
  );
}
