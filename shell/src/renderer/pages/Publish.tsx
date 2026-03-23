import React, { useState } from 'react';
import { StepIndicator } from '../components/publish/StepIndicator';
import { DropStep } from '../components/publish/DropStep';
import { ReviewStep } from '../components/publish/ReviewStep';
import { PermsStep } from '../components/publish/PermsStep';
import { ValidateStep } from '../components/publish/ValidateStep';
import { SubmitStep } from '../components/publish/SubmitStep';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Rocket, Loader2, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function Publish(): React.ReactElement {
  const [step, setStep] = useState(1);
  const [folderPath, setFolderPath] = useState('');
  const [manifest, setManifest] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(false);

  const handleFolderSelected = async (path: string): Promise<void> => {
    setLoading(true);
    try {
      const result = await window.shellAPI.publish.readFolder(path);
      setFolderPath(path);
      setManifest(result.manifest);
      setStep(2);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to read folder');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = (): void => {
    setStep(1);
    setFolderPath('');
    setManifest({});
  };

  return (
    <div className="flex flex-col gap-8 p-8 max-w-5xl mx-auto animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-primary">
          <Rocket className="size-5" />
          <span className="text-sm font-bold uppercase tracking-wider">Developer Center</span>
        </div>
        <h1 className="text-4xl font-black tracking-tight">Publish an App</h1>
        <p className="text-muted-foreground font-medium">
          Share your creation with the VibeDepot community in 5 easy steps.
        </p>
      </div>

      <StepIndicator current={step} />

      <Card className="border-border shadow-lg bg-card overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 bg-muted/20">
              <Loader2 className="size-10 animate-spin text-primary" />
              <div className="text-center">
                <p className="text-lg font-bold">Reading your project...</p>
                <p className="text-sm text-muted-foreground">Parsing manifest and scanning files</p>
              </div>
            </div>
          ) : (
            <div className="p-8">
              {step === 1 && <DropStep onFolderSelected={handleFolderSelected} />}
              {step === 2 && (
                <ReviewStep
                  manifest={manifest}
                  onUpdate={setManifest}
                  onNext={() => setStep(3)}
                  onBack={() => setStep(1)}
                />
              )}
              {step === 3 && (
                <PermsStep
                  manifest={manifest}
                  onNext={() => setStep(4)}
                  onBack={() => setStep(2)}
                />
              )}
              {step === 4 && (
                <ValidateStep
                  folderPath={folderPath}
                  manifest={manifest}
                  onNext={() => setStep(5)}
                  onBack={() => setStep(3)}
                />
              )}
              {step === 5 && (
                <SubmitStep
                  folderPath={folderPath}
                  manifest={manifest}
                  onBack={() => setStep(4)}
                  onReset={handleReset}
                />
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Alert className="bg-primary/5 border-primary/20">
        <Info className="size-4 text-primary" />
        <AlertTitle className="text-primary font-bold">Heads up!</AlertTitle>
        <AlertDescription className="text-muted-foreground font-medium">
          Publishing creates a bundle and opens a Pull Request on the VibeDepot Registry. 
          Make sure your code is ready for public review.
        </AlertDescription>
      </Alert>
    </div>
  );
}
