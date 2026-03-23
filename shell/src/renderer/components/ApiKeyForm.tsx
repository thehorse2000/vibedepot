import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Key, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  Trash2,
  Lock
} from 'lucide-react';
import { toast } from 'sonner';

interface ApiKeyFormProps {
  provider: string;
  label: string;
}

export function ApiKeyForm({ provider, label }: ApiKeyFormProps): React.ReactElement {
  const [key, setKey] = useState('');
  const [exists, setExists] = useState(false);
  const [masked, setMasked] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    window.shellAPI.keys.get(provider).then((res) => {
      setExists(res.exists);
      setMasked(res.masked);
    }).catch(console.error);
  }, [provider]);

  const handleSave = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!key) return;

    setLoading(true);
    try {
      await window.shellAPI.keys.set(provider, key);
      const res = await window.shellAPI.keys.get(provider);
      setExists(res.exists);
      setMasked(res.masked);
      setKey('');
      setShowKey(false);
      toast.success(`${label} API key saved successfully`);
    } catch (err) {
      console.error('Failed to save key:', err);
      toast.error(`Failed to save key: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (!confirm(`Are you sure you want to delete your ${label} API key?`)) return;

    try {
      await window.shellAPI.keys.delete(provider);
      setExists(false);
      setMasked(null);
      toast.info(`${label} API key removed`);
    } catch (err) {
      console.error('Failed to delete key:', err);
      toast.error(`Failed to delete key: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${exists ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
            <Lock className="size-4" />
          </div>
          <Label className="text-lg font-bold">{label}</Label>
        </div>
        {exists && (
          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-2 py-0.5 flex gap-1.5 items-center">
            <CheckCircle2 className="size-3" />
            Active
          </Badge>
        )}
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-3">
        <div className="relative group">
          <Input
            type={showKey ? 'text' : 'password'}
            value={exists && !key ? masked || '' : key}
            onChange={(e) => setKey(e.target.value)}
            placeholder={exists ? '••••••••••••••••' : `Enter your ${label} API key`}
            disabled={loading || (exists && !key && !showKey)}
            className={`pr-10 h-11 transition-all ${exists && !key ? 'bg-muted/50 border-transparent text-muted-foreground font-mono' : 'bg-card border-border shadow-sm'}`}
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
            disabled={loading || (exists && !key)}
          >
            {showKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>

        <div className="flex gap-2">
          {!exists || key ? (
            <Button 
              type="submit" 
              disabled={loading || !key} 
              className="flex-1 font-bold h-10 shadow-sm"
            >
              {loading ? 'Saving...' : 'Save API Key'}
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => setKey('')}
              className="flex-1 font-bold h-10 border-dashed"
            >
              Update Key
            </Button>
          )}

          {exists && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              className="h-10 w-10 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="size-4" />
            </Button>
          )}
        </div>
      </form>
      {!exists && (
        <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 px-1">
          <AlertCircle className="size-3" />
          Get your key from the <a href="#" className="text-primary hover:underline font-medium">OpenAI Dashboard</a>
        </p>
      )}
    </div>
  );
}
