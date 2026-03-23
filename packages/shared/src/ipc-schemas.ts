import { z } from 'zod';
import { AI_PROVIDERS } from './providers.types';

// AI schemas
export const CallAISchema = z.object({
  provider: z.enum(AI_PROVIDERS).optional(),
  model: z.string().optional(),
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string(),
    })
  ),
  maxTokens: z.number().int().positive().optional(),
  temperature: z.number().min(0).max(2).optional(),
});

export const StreamAISchema = CallAISchema;

// Keys schemas
export const KeysSetSchema = z.object({
  provider: z.enum(AI_PROVIDERS),
  key: z.string().min(1),
});

export const KeysGetSchema = z.object({
  provider: z.enum(AI_PROVIDERS),
});

export const KeysDeleteSchema = z.object({
  provider: z.enum(AI_PROVIDERS),
});

// Storage schemas
export const StorageSetSchema = z.object({
  key: z.string().min(1).max(256),
  value: z.unknown(),
});

export const StorageGetSchema = z.object({
  key: z.string().min(1).max(256),
});

export const StorageDeleteSchema = z.object({
  key: z.string().min(1).max(256),
});

// Shell schemas
export const ShellOpenExternalSchema = z.object({
  url: z.string().url(),
});

export const ShellNotifySchema = z.object({
  title: z.string().max(256),
  body: z.string().max(1024),
});

export const ShellSetTitleSchema = z.object({
  title: z.string().max(256),
});

// App management schemas
export const AppLaunchSchema = z.object({
  appId: z.string(),
});

export const AppCloseSchema = z.object({
  appId: z.string(),
});

// Store schemas
export const StoreInstallSchema = z.object({
  appId: z.string(),
  bundleUrl: z.string().url(),
  expectedChecksum: z.string(),
  version: z.string(),
});

export const StoreUninstallSchema = z.object({
  appId: z.string(),
  deleteData: z.boolean().optional().default(false),
});

// Database (SQLite) schemas
export const DbRunSchema = z.object({
  sql: z.string().min(1),
  params: z.array(z.unknown()).optional(),
});

export const DbQuerySchema = z.object({
  sql: z.string().min(1),
  params: z.array(z.unknown()).optional(),
});

export const DbTransactionSchema = z.object({
  statements: z.array(
    z.object({
      sql: z.string().min(1),
      params: z.array(z.unknown()).optional(),
    })
  ),
});

// Sideloading schemas
export const SideloadAppSchema = z.object({
  folderPath: z.string().min(1),
});

export const UnsideloadAppSchema = z.object({
  appId: z.string().min(1),
});

// Publish wizard schemas
export const PublishReadFolderSchema = z.object({
  folderPath: z.string().min(1),
});

export const PublishValidateSchema = z.object({
  folderPath: z.string().min(1),
  manifest: z.record(z.unknown()),
});

export const PublishCreateBundleSchema = z.object({
  folderPath: z.string().min(1),
  manifest: z.record(z.unknown()),
});

export const PublishOpenPRSchema = z.object({
  manifest: z.record(z.unknown()),
  checksum: z.string().min(1),
});

