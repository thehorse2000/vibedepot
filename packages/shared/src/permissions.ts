export const Permission = {
  AI: 'ai',
  STORAGE_KV: 'storage.kv',
  STORAGE_FILES: 'storage.files',
  STORAGE_DB: 'storage.db',
  NETWORK: 'network',
  CLIPBOARD: 'clipboard',
  NOTIFICATIONS: 'notifications',
} as const;

export type Permission = (typeof Permission)[keyof typeof Permission];

/** Permissions that are auto-granted to all apps */
export const AUTO_GRANTED_PERMISSIONS: Permission[] = [Permission.STORAGE_KV];

/** Permissions that require user consent */
export const CONSENT_REQUIRED_PERMISSIONS: Permission[] = [
  Permission.STORAGE_FILES,
  Permission.STORAGE_DB,
  Permission.NETWORK,
  Permission.CLIPBOARD,
  Permission.NOTIFICATIONS,
];
