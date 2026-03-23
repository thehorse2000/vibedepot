import React, { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { AppCard } from '../components/AppCard';
import type { RegistryEntry, AppManifest } from '@vibedepot/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Plus, 
  FolderOpen, 
  Library as LibraryIcon, 
  AlertCircle,
  PackageOpen,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

export function Library(): React.ReactElement {
  const installedApps = useAppStore((s) => s.installedApps);
  const addInstalledApp = useAppStore((s) => s.addInstalledApp);
  const removeInstalledApp = useAppStore((s) => s.removeInstalledApp);
  const runningAppIds = useAppStore((s) => s.runningAppIds);
  const setAppRunning = useAppStore((s) => s.setAppRunning);

  const [registry, setRegistry] = useState<RegistryEntry[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    window.shellAPI.store.fetchRegistry()
      .then(setRegistry)
      .catch(console.error);
  }, []);

  const filteredApps = useMemo(() => {
    return installedApps.filter((app) =>
      app.name.toLowerCase().includes(search.toLowerCase()) ||
      app.description.toLowerCase().includes(search.toLowerCase())
    );
  }, [installedApps, search]);

  const handleLaunch = async (appId: string): Promise<void> => {
    try {
      await window.shellAPI.apps.launch(appId);
      setAppRunning(appId, true);
      toast.success('App launched successfully');
    } catch (err) {
      console.error('Launch failed:', err);
      toast.error(`Launch failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleClose = async (appId: string): Promise<void> => {
    try {
      await window.shellAPI.apps.close(appId);
      setAppRunning(appId, false);
      toast.info('App closed');
    } catch (err) {
      console.error('Close failed:', err);
      toast.error(`Close failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleUninstall = async (appId: string): Promise<void> => {
    if (!confirm('Are you sure you want to uninstall this app?')) return;
    try {
      await window.shellAPI.store.uninstallApp(appId);
      removeInstalledApp(appId);
      toast.success('App uninstalled');
    } catch (err) {
      console.error('Uninstall failed:', err);
      toast.error(`Uninstall failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleSideload = async (): Promise<void> => {
    try {
      const folderPath = await window.shellAPI.sideload.selectFolder();
      if (!folderPath) return;

      const manifest = await window.shellAPI.sideload.loadApp(folderPath);
      addInstalledApp(manifest);
      toast.success(`Sideloaded ${manifest.name}`);
    } catch (err) {
      console.error('Sideload failed:', err);
      toast.error(`Sideload failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleRemoveSideloaded = async (appId: string): Promise<void> => {
    try {
      await window.shellAPI.sideload.unloadApp(appId);
      removeInstalledApp(appId);
      toast.success('Sideloaded app removed');
    } catch (err) {
      console.error('Unload failed:', err);
      toast.error(`Unload failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  return (
    <div className="flex flex-col gap-8 p-8 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-primary">
            <LibraryIcon className="size-5" />
            <span className="text-sm font-bold uppercase tracking-wider">Workspace</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight">Your Library</h1>
          <p className="text-muted-foreground font-medium">
            Manage and launch your installed AI applications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleSideload} className="h-10 font-bold shadow-sm border-dashed">
            <FolderOpen className="size-4 mr-2" />
            Sideload App
          </Button>
          <Button onClick={() => window.location.hash = '#store'} className="h-10 font-bold shadow-sm">
            <Plus className="size-4 mr-2" />
            Get More Apps
          </Button>
        </div>
      </div>

      <div className="relative group max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input
          type="text"
          placeholder="Search your library..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-11 bg-card border-border shadow-sm focus-visible:ring-primary/20"
        />
      </div>

      <Separator className="opacity-50" />

      {installedApps.length === 0 ? (
        <div className="py-24 flex flex-col items-center justify-center text-center bg-muted/20 rounded-3xl border border-dashed border-border">
          <div className="size-20 rounded-full bg-muted flex items-center justify-center mb-6">
            <PackageOpen className="size-10 text-muted-foreground/40" />
          </div>
          <h3 className="text-2xl font-bold">Your library is empty</h3>
          <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
            You haven't installed any apps yet. Head over to the store to discover amazing AI tools!
          </p>
          <Button 
            className="mt-8 px-8 font-bold"
            onClick={() => window.location.hash = '#store'}
          >
            Visit Store
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredApps.map((app) => {
            const registryEntry = registry.find((r) => r.id === app.id);
            const hasUpdate = registryEntry && registryEntry.version !== app.version;
            
            return (
              <AppCard
                key={app.id}
                app={app}
                isRunning={runningAppIds.has(app.id)}
                hasUpdate={hasUpdate}
                registryVersion={registryEntry?.version}
                sideloaded={app.sideloaded}
                onLaunch={() => handleLaunch(app.id)}
                onClose={() => handleClose(app.id)}
                onUninstall={() => handleUninstall(app.id)}
                onRemove={() => handleRemoveSideloaded(app.id)}
              />
            );
          })}
          
          {filteredApps.length === 0 && search && (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <AlertCircle className="size-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-bold">No results for "{search}"</h3>
              <Button variant="link" onClick={() => setSearch('')}>Clear search</Button>
            </div>
          )}
        </div>
      )}

      {runningAppIds.size > 0 && (
        <div className="fixed bottom-8 right-8 animate-in zoom-in duration-300">
          <Badge className="bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg flex gap-2 items-center text-sm font-bold border-none">
            <Zap className="size-4 fill-current animate-pulse" />
            {runningAppIds.size} Apps Running
          </Badge>
        </div>
      )}
    </div>
  );
}
