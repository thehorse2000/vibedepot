import type { Permission } from './permissions';
import type { AIProviderName } from './providers.types';

export interface AppManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  longDescription?: string;
  author: string;
  authorUrl?: string;
  license?: string;
  entry: string;
  thumbnail?: string;
  screenshots?: string[];
  category?: string;
  keywords?: string[];
  models?: {
    required: boolean;
    providers: AIProviderName[];
    default?: AIProviderName;
    minContextWindow?: number;
  };
  permissions: Permission[];
  minShellVersion?: string;
  maxBundleSize?: string;
  changelog?: string;
  homepage?: string;
  repository?: string;
}

export const APP_CATEGORIES = [
  'productivity',
  'writing',
  'coding',
  'files',
  'research',
  'data',
  'media',
  'integrations',
  'utilities',
  'fun',
] as const;

export type AppCategory = (typeof APP_CATEGORIES)[number];
