
import { useState } from "react";
import NavBar from "@/components/NavBar";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const SettingsPage = () => {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    streamTitle: "Minha Stream de Gaming",
    autoCompleteRedemptions: false,
    notifyNewRedemptions: true,
    cooldownDefault: 30
  });

  const handleSaveSettings = () => {
    setSaving(true);
    
    // Simulando uma chamada de API
    setTimeout(() => {
      setSaving(false);
      toast.success("Configurações salvas com sucesso");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold animate-fade-in">Configurações</h1>
          <p className="text-muted-foreground animate-fade-in animate-delay-100">
            Gerencie as configurações do sistema de benefícios
          </p>
        </header>

        <div className="grid grid-cols-1 gap-8 max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
              <CardDescription>
                Ajuste as configurações gerais do sistema de benefícios
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="streamTitle">Título da Stream</Label>
                <Input 
                  id="streamTitle" 
                  value={settings.streamTitle}
                  onChange={(e) => setSettings({...settings, streamTitle: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cooldownDefault">Tempo de Espera Padrão (dias)</Label>
                <Input 
                  id="cooldownDefault" 
                  type="number"
                  min="1"
                  value={settings.cooldownDefault}
                  onChange={(e) => setSettings({...settings, cooldownDefault: parseInt(e.target.value)})}
                />
              </div>
              
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="autoComplete">Completar Resgates Automaticamente</Label>
                <Switch 
                  id="autoComplete"
                  checked={settings.autoCompleteRedemptions}
                  onCheckedChange={(checked) => setSettings({...settings, autoCompleteRedemptions: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="notifications">Notificações de Resgates</Label>
                <Switch 
                  id="notifications"
                  checked={settings.notifyNewRedemptions}
                  onCheckedChange={(checked) => setSettings({...settings, notifyNewRedemptions: checked})}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleSaveSettings}
                className="bg-twitch hover:bg-twitch-dark"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Configurações
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
