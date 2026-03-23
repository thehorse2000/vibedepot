import React from 'react';
import type { RegistryEntry } from '@vibedepot/shared';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { 
  Download, 
  CheckCircle2, 
  Loader2, 
  User, 
  Calendar, 
  Globe, 
  Shield,
  Cpu,
  Layers,
  Sparkles
} from "lucide-react";

interface AppDetailModalProps {
  entry: RegistryEntry;
  isInstalled: boolean;
  isInstalling: boolean;
  onClose: () => void;
  onInstall: () => void;
}

export function AppDetailModal({
  entry,
  isInstalled,
  isInstalling,
  onClose,
  onInstall,
}: AppDetailModalProps): React.ReactElement {
  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden border-none shadow-2xl bg-background rounded-3xl">
        <ScrollArea className="max-h-[90vh]">
          {/* Header Image */}
          <div className="relative h-64 w-full bg-muted">
            {entry.thumbnail ? (
              <img
                src={entry.thumbnail}
                alt={entry.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-indigo-900">
                <Sparkles className="size-20 text-white/20" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
            
            <div className="absolute bottom-6 left-8 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-primary hover:bg-primary font-bold uppercase tracking-wider px-2 py-0.5 border-none">
                  {entry.category || 'App'}
                </Badge>
                <Badge variant="outline" className="bg-background/50 backdrop-blur-md text-foreground border-white/20 font-mono">
                  v{entry.version}
                </Badge>
              </div>
              <DialogTitle className="text-4xl font-black text-foreground drop-shadow-sm">
                {entry.name}
              </DialogTitle>
            </div>
          </div>

          <div className="p-8 flex flex-col gap-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left Column: Description */}
              <div className="md:col-span-2 flex flex-col gap-6">
                <div className="flex flex-col gap-3">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Layers className="size-5 text-primary" />
                    Description
                  </h3>
                  <p className="text-muted-foreground leading-relaxed font-medium">
                    {entry.description}
                  </p>
                </div>

                <Separator className="opacity-50" />

                <div className="flex flex-col gap-3">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Cpu className="size-5 text-primary" />
                    Providers
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {entry.providers?.map((p) => (
                      <Badge key={p} variant="secondary" className="px-3 py-1 font-bold bg-secondary/50">
                        {p}
                      </Badge>
                    ))}
                    {!entry.providers?.length && (
                      <span className="text-sm text-muted-foreground italic">No providers specified</span>
                    )}
                  </div>
                </div>

                {entry.permissions && (
                  <>
                    <Separator className="opacity-50" />
                    <div className="flex flex-col gap-3">
                      <h3 className="text-lg font-bold flex items-center gap-2 text-amber-500">
                        <Shield className="size-5" />
                        Permissions
                      </h3>
                      <div className="grid grid-cols-1 gap-2">
                        {entry.permissions.map((perm) => (
                          <div key={perm} className="flex items-center gap-2 text-sm text-muted-foreground bg-amber-500/5 p-2 rounded-lg border border-amber-500/10">
                            <div className="size-1.5 rounded-full bg-amber-500" />
                            <span className="font-mono text-xs">{perm}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Right Column: Metadata */}
              <div className="flex flex-col gap-6">
                <Card className="bg-muted/30 border-none shadow-none">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">App Details</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <User className="size-3" />
                        Developer
                      </div>
                      <span className="text-sm font-bold">{entry.author}</span>
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="size-3" />
                        Published
                      </div>
                      <span className="text-sm font-bold">Recently</span>
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Globe className="size-3" />
                        Source
                      </div>
                      <a href="#" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
                        Registry
                        <Globe className="size-3" />
                      </a>
                    </div>
                  </CardContent>
                </Card>

                <Button
                  className="w-full h-12 font-black text-lg shadow-xl shadow-primary/20"
                  size="lg"
                  disabled={isInstalled || isInstalling}
                  onClick={onInstall}
                >
                  {isInstalled ? (
                    <>
                      <CheckCircle2 className="size-5 mr-2" />
                      Installed
                    </>
                  ) : isInstalling ? (
                    <>
                      <Loader2 className="size-5 mr-2 animate-spin" />
                      Installing...
                    </>
                  ) : (
                    <>
                      <Download className="size-5 mr-2" />
                      Install App
                    </>
                  )}
                </Button>
                
                <p className="text-[10px] text-center text-muted-foreground font-mono uppercase tracking-tighter">
                  Bundle Checksum: {entry.checksum.substring(0, 12)}...
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
