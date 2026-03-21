import { create } from 'zustand';

interface ProviderStatus {
  hasKey: boolean;
  masked: string | null;
}

interface SettingsStoreState {
  providers: Record<string, ProviderStatus>;
  setProviderStatus: (provider: string, status: ProviderStatus) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useSettingsStore = create<SettingsStoreState>((set) => ({
  providers: {
    anthropic: { hasKey: false, masked: null },
    openai: { hasKey: false, masked: null },
    gemini: { hasKey: false, masked: null },
  },
  setProviderStatus: (provider, status) =>
    set((state) => ({
      providers: { ...state.providers, [provider]: status },
    })),
  theme: 'light',
  setTheme: (theme) => set({ theme }),
}));
