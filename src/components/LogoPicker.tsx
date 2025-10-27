import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { khlLogos } from '@/data/khlLogos';
import Icon from '@/components/ui/icon';

interface LogoPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  currentLogo?: string;
}

export default function LogoPicker({ open, onClose, onSelect, currentLogo }: LogoPickerProps) {
  const [uploadingFile, setUploadingFile] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingFile(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const response = await fetch('https://functions.poehali.dev/8f2aa7eb-f52a-4303-bc7d-28dd1173e4cd', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: reader.result })
          });
          const data = await response.json();
          if (data.url) {
            onSelect(data.url);
            onClose();
          }
        } catch (error) {
          console.error('Upload error:', error);
        } finally {
          setUploadingFile(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoSelect = (url: string) => {
    onSelect(url);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-primary/20 max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Выбрать логотип</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="khl" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="khl">КХЛ команды</TabsTrigger>
            <TabsTrigger value="upload">Загрузить файл</TabsTrigger>
          </TabsList>

          <TabsContent value="khl" className="mt-4">
            <div className="grid grid-cols-4 gap-4">
              {khlLogos.map((team) => (
                <button
                  key={team.name}
                  onClick={() => handleLogoSelect(team.url)}
                  className={`p-4 border rounded-lg hover:border-accent transition-all flex flex-col items-center gap-2 ${
                    currentLogo === team.url ? 'border-accent bg-accent/10' : 'border-primary/20'
                  }`}
                >
                  <img 
                    src={team.url} 
                    alt={team.name}
                    className="w-16 h-16 object-contain"
                    crossOrigin="anonymous"
                  />
                  <span className="text-xs text-center">{team.name}</span>
                </button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="upload" className="mt-4">
            <div className="space-y-4">
              <div>
                <Label>Загрузить с компьютера</Label>
                <Input 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploadingFile}
                />
                {uploadingFile && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <Icon name="Loader2" className="animate-spin" size={16} />
                    Загружаю...
                  </div>
                )}
              </div>
              
              {currentLogo && (
                <div>
                  <Label>Текущий логотип:</Label>
                  <div className="mt-2 p-4 border border-primary/20 rounded-lg inline-block">
                    <img 
                      src={currentLogo} 
                      alt="Current"
                      className="w-24 h-24 object-contain"
                      crossOrigin="anonymous"
                    />
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>Отмена</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
