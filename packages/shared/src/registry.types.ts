import type { Permission } from './permissions';
import type { AIProviderName } from './providers.types';
import type { AppCategory } from './manifest.types';

export interface RegistryEntry {
  id: string;
  name: string;
  version: string;
  description: string;
  longDescription?: string;
  author: string;
  category?: AppCategory;
  keywords?: string[];
  permissions: Permission[];
  providers?: AIProviderName[];
  thumbnail?: string;
  bundle: string;
  checksum: string;
  installs: number;
  updatedAt: string;
  featured?: boolean;
}
