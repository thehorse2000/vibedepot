import React from 'react';
import type { AppManifest } from '@vibedepot/shared';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Square, Trash2, User, RefreshCw, Layers } from 'lucide-react';

interface AppCardProps {
  app: AppManifest;
  isRunning: boolean;
  hasUpdate?: boolean;
  registryVersion?: string;
  sideloaded?: boolean;
  onLaunch: () => void;
  onClose: () => void;
  onUninstall?: () => void;
  onRemove?: () => void;
}

export function AppCard({
  app,
  isRunning,
  hasUpdate,
  registryVersion,
  sideloaded,
  onLaunch,
  onClose,
  onUninstall,
  onRemove,
}: AppCardProps): React.ReactElement {
  return (
    <Card className={`group relative flex items-center p-4 gap-4 border border-border bg-card hover:border-primary/50 transition-all duration-300 ${isRunning ? 'ring-1 ring-primary/50' : ''}`}>
      <div className={`size-12 rounded-xl flex items-center justify-center text-primary-foreground font-bold text-xl ${isRunning ? 'bg-primary' : 'bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary'}`}>
        {app.name.charAt(0).toUpperCase()}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-base leading-none truncate">{app.name}</h3>
          {sideloaded && (
            <Badge variant="outline" className="text-[10px] h-4 px-1.5 border-indigo-500/50 text-indigo-500 bg-indigo-500/5 uppercase font-bold tracking-wider">
              <Layers className="size-2.5 mr-1" />
              Dev
            </Badge>
          )}
          {hasUpdate && (
            <Badge variant="secondary" className="text-[10px] h-4 px-1.5 bg-amber-500/10 text-amber-500 border-amber-500/20 uppercase font-bold tracking-wider">
              <RefreshCw className="size-2.5 mr-1" />
              Update v{registryVersion}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1.5 line-clamp-1 leading-relaxed max-w-md">
          {app.description}
        </p>
        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <User className="size-3" />
            <span>{app.author}</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <span className="bg-muted px-1.5 py-0.5 rounded font-mono">v{app.version}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isRunning ? (
          <Button
            size="sm"
            variant="destructive"
            onClick={onClose}
            className="h-8 px-3 font-semibold shadow-sm"
          >
            <Square className="size-3 mr-1.5 fill-current" />
            Stop
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={onLaunch}
            className="h-8 px-3 font-semibold shadow-sm"
          >
            <Play className="size-3 mr-1.5 fill-current" />
            Launch
          </Button>
        )}

        {(sideloaded && onRemove && !isRunning) && (
          <Button
            size="icon"
            variant="ghost"
            onClick={onRemove}
            className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="size-4" />
          </Button>
        )}
        {(!sideloaded && onUninstall && !isRunning) && (
          <Button
            size="icon"
            variant="ghost"
            onClick={onUninstall}
            className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="size-4" />
          </Button>
        )}
      </div>
    </Card>
  );
}
