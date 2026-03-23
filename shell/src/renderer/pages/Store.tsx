import React, { useEffect, useState, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { StoreAppCard } from '../components/StoreAppCard';
import { AppDetailModal } from '../components/AppDetailModal';
import { FeaturedCarousel } from '../components/FeaturedCarousel';
import type { RegistryEntry } from '@vibedepot/shared';
import { Input } from '@/components/ui/input';
import { Search, Loader2, Sparkles, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export function Store(): React.ReactElement {
  const [registry, setRegistry] = useState<RegistryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedApp, setSelectedApp] = useState<RegistryEntry | null>(null);
  const [installingId, setInstallingId] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);

  const installedApps = useAppStore((s) => s.installedApps);
  const addInstalledApp = useAppStore((s) => s.addInstalledApp);

  useEffect(() => {
    window.shellAPI.store.fetchRegistry()
      .then((data) => {
        setRegistry(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch registry:', err);
        setLoading(false);
      });
  }, []);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    registry.forEach((entry) => {
      if (entry.category) cats.add(entry.category);
    });
    return Array.from(cats);
  }, [registry]);

  const filteredRegistry = useMemo(() => {
    return registry.filter((entry) => {
      const matchesSearch =
        entry.name.toLowerCase().includes(search.toLowerCase()) ||
        entry.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !category || entry.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [registry, search, category]);

  const featuredApps = useMemo(() => {
    return registry.filter((entry) => entry.featured).slice(0, 5);
  }, [registry]);

  const handleInstall = async (entry: RegistryEntry): Promise<void> => {
    setInstallingId(entry.id);
    try {
      const manifest = await window.shellAPI.store.installApp(
        entry.id,
        entry.bundle,
        entry.checksum,
        entry.version
      );
      addInstalledApp(manifest);
    } catch (err) {
      console.error('Installation failed:', err);
      alert(`Installation failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setInstallingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground animate-pulse font-medium">Fetching the vibe...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-12 animate-in fade-in duration-700">
      {/* Header & Featured */}
      <section className="bg-primary/5 border-b border-border py-12 px-8 overflow-hidden relative">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 size-80 bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 size-60 bg-primary/5 rounded-full blur-[80px]" />
        
        <div className="max-w-6xl mx-auto flex flex-col gap-10">
          <div className="flex flex-col gap-3 relative z-10">
            <Badge variant="outline" className="w-fit bg-primary/10 text-primary border-primary/20 flex gap-1.5 py-1 px-3">
              <Sparkles className="size-3.5 fill-primary" />
              Discover the best AI Apps
            </Badge>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground leading-tight">
              AI App Marketplace
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl font-medium leading-relaxed">
              Explore and install curated AI applications to supercharge your workflow. 
              VibeDepot connects your models to powerful, specialized tools.
            </p>
          </div>

          {featuredApps.length > 0 && (
            <div className="relative z-10">
              <FeaturedCarousel
                apps={featuredApps}
                onSelect={setSelectedApp}
              />
            </div>
          )}
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-8 w-full flex flex-col gap-8">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              type="text"
              placeholder="Search apps by name or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 border-border bg-card shadow-sm group-hover:border-primary/50 transition-all focus-visible:ring-primary/20"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 w-full md:w-auto">
            <Button
              variant={!category ? "default" : "outline"}
              size="sm"
              onClick={() => setCategory(null)}
              className="h-9 px-4 font-semibold shadow-sm"
            >
              All Apps
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={category === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setCategory(cat)}
                className="h-9 px-4 font-semibold shadow-sm whitespace-nowrap"
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        <Separator className="opacity-50" />

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRegistry.map((entry) => (
            <StoreAppCard
              key={entry.id}
              entry={entry}
              isInstalled={installedApps.some((a) => a.id === entry.id)}
              isInstalling={installingId === entry.id}
              onInstall={() => handleInstall(entry)}
              onClick={() => setSelectedApp(entry)}
            />
          ))}
          {filteredRegistry.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-muted/30 rounded-3xl border border-dashed border-border">
              <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Search className="size-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-xl font-bold">No apps found</h3>
              <p className="text-muted-foreground mt-2 max-w-xs">
                We couldn't find any apps matching your current search or category. Try something else!
              </p>
              <Button 
                variant="outline" 
                className="mt-6"
                onClick={() => { setSearch(''); setCategory(null); }}
              >
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </div>

      {selectedApp && (
        <AppDetailModal
          entry={selectedApp}
          isInstalled={installedApps.some((a) => a.id === selectedApp.id)}
          isInstalling={installingId === selectedApp.id}
          onClose={() => setSelectedApp(null)}
          onInstall={() => handleInstall(selectedApp)}
        />
      )}
    </div>
  );
}
