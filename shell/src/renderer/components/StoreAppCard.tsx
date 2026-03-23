import React from 'react';
import type { RegistryEntry } from '@vibedepot/shared';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, CheckCircle2, Loader2, User } from 'lucide-react';

interface StoreAppCardProps {
  entry: RegistryEntry;
  isInstalled: boolean;
  isInstalling: boolean;
  onInstall: () => void;
  onClick: () => void;
}

export function StoreAppCard({
  entry,
  isInstalled,
  isInstalling,
  onInstall,
  onClick,
}: StoreAppCardProps): React.ReactElement {
  return (
    <Card
      className="group overflow-hidden border border-border bg-card hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col h-full"
      onClick={onClick}
    >
      <div className="relative aspect-video overflow-hidden bg-muted">
        {entry.thumbnail ? (
          <img
            src={entry.thumbnail}
            alt={entry.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/20">
            <span className="text-4xl font-bold opacity-20">
              {entry.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        {entry.category && (
          <Badge className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm text-foreground border-none text-[10px] px-2 py-0">
            {entry.category}
          </Badge>
        )}
      </div>

      <CardHeader className="p-4 pb-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-base leading-none truncate group-hover:text-primary transition-colors">
              {entry.name}
            </h3>
            <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
              <User className="size-3" />
              <span className="truncate">{entry.author}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 py-2 flex-1">
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {entry.description}
        </p>
        <div className="flex flex-wrap gap-1 mt-3">
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
            v{entry.version}
          </Badge>
          {entry.providers?.slice(0, 2).map((p) => (
            <Badge key={p} variant="outline" className="text-[10px] px-1.5 py-0 h-4">
              {p}
            </Badge>
          ))}
          {(entry.providers?.length ?? 0) > 2 && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
              +{(entry.providers?.length ?? 0) - 2}
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          size="sm"
          className="w-full font-semibold"
          variant={isInstalled ? "secondary" : "default"}
          disabled={isInstalled || isInstalling}
          onClick={(e) => {
            e.stopPropagation();
            if (!isInstalled && !isInstalling) onInstall();
          }}
        >
          {isInstalled ? (
            <>
              <CheckCircle2 className="size-3 mr-1" />
              Installed
            </>
          ) : isInstalling ? (
            <>
              <Loader2 className="size-3 mr-1 animate-spin" />
              Installing...
            </>
          ) : (
            <>
              <Download className="size-3 mr-1" />
              Install
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
