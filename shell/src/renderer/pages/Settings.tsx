import React, { useState, useEffect } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';
import { ApiKeyForm } from '../components/ApiKeyForm';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Settings as SettingsIcon, 
  Key, 
  UserCircle, 
  Rocket, 
  ShieldCheck,
  Info,
  ExternalLink,
  Cpu
} from 'lucide-react';
import { toast } from 'sonner';

export function Settings(): React.ReactElement {
  const publisherMode = useSettingsStore((s) => s.publisherMode);
  const setPublisherMode = useSettingsStore((s) => s.setPublisherMode);
  const [version, setVersion] = useState('0.1.0');

  useEffect(() => {
    window.shellAPI.shell.getVersion().then(setVersion).catch(console.error);
  }, []);

  return (
    <div className="flex flex-col gap-8 p-8 max-w-4xl mx-auto animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-primary">
          <SettingsIcon className="size-5" />
          <span className="text-sm font-bold uppercase tracking-wider">Preferences</span>
        </div>
        <h1 className="text-4xl font-black tracking-tight">Settings</h1>
        <p className="text-muted-foreground font-medium">
          Configure your API keys and system preferences.
        </p>
      </div>

      <Tabs defaultValue="keys" className="w-full">
        <TabsList className="w-full justify-start h-12 bg-muted/50 p-1 mb-6">
          <TabsTrigger value="keys" className="flex items-center gap-2 px-6 h-10 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Key className="size-4" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="general" className="flex items-center gap-2 px-6 h-10 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <UserCircle className="size-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="about" className="flex items-center gap-2 px-6 h-10 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Info className="size-4" />
            About
          </TabsTrigger>
        </TabsList>

        <TabsContent value="keys" className="animate-in fade-in slide-in-from-left-4 duration-500">
          <div className="grid gap-6">
            <Card className="border-border bg-card">
              <CardHeader>
                <div className="flex items-center gap-2 text-primary mb-1">
                  <ShieldCheck className="size-5" />
                  <CardTitle className="text-xl">Provider Configuration</CardTitle>
                </div>
                <CardDescription className="text-sm">
                  Keys are stored securely in your system's keychain. They are never sent to VibeDepot servers.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-8">
                <ApiKeyForm provider="openai" label="OpenAI" />
                <Separator />
                <ApiKeyForm provider="anthropic" label="Anthropic" />
                <Separator />
                <ApiKeyForm provider="gemini" label="Google Gemini" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="general" className="animate-in fade-in slide-in-from-left-4 duration-500">
          <Card className="border-border bg-card">
            <CardHeader>
              <div className="flex items-center gap-2 text-primary mb-1">
                <Rocket className="size-5" />
                <CardTitle className="text-xl">Developer Options</CardTitle>
              </div>
              <CardDescription>
                Advanced settings for developers and app publishers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border">
                <div className="space-y-0.5">
                  <Label className="text-base font-bold">Publisher Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Enables the Publish tab to create and validate app bundles.
                  </p>
                </div>
                <Switch
                  checked={publisherMode}
                  onCheckedChange={(checked) => {
                    setPublisherMode(checked);
                    toast.success(`Publisher mode ${checked ? 'enabled' : 'disabled'}`);
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="about" className="animate-in fade-in slide-in-from-left-4 duration-500">
          <div className="grid gap-6">
            <Card className="border-border bg-card overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Cpu className="size-32" />
              </div>
              <CardHeader>
                <CardTitle className="text-2xl font-black">VibeDepot</CardTitle>
                <CardDescription className="font-medium">
                  The Decentralized AI App Shell
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm p-3 rounded-lg bg-muted/50">
                  <span className="text-muted-foreground">Version</span>
                  <span className="font-mono font-bold text-primary">{version}</span>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  VibeDepot is a lightweight shell for running AI applications. 
                  It provides a secure bridge between your local environment and 
                  specialized AI interfaces.
                </p>
              </CardContent>
              <CardFooter className="flex gap-3">
                <Button variant="outline" size="sm" className="font-bold">
                  <ExternalLink className="size-4 mr-2" />
                  Documentation
                </Button>
                <Button variant="outline" size="sm" className="font-bold">
                  <ExternalLink className="size-4 mr-2" />
                  GitHub
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
