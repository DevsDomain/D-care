import { useState } from 'react';
import { 
  User, 
  Phone, 
  Mail, 
  Settings, 
  Bell, 
  Shield, 
  HelpCircle, 
  LogOut,
  Edit3,
  Save,
  X,
  FileText,
  Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button-variants';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from "@/components/hooks/use-toast";
import { useAppStore } from '@/lib/stores/appStore';
import { mockApi } from '@/lib/api/mock';

export default function Profile() {
  const { toast } = useToast();
  const { currentUser, setCurrentUser } = useAppStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [showPrivacyDialog, setShowPrivacyDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    email: currentUser?.email || ''
  });
  const [preferences, setPreferences] = useState({
    notifications: currentUser?.preferences?.notifications ?? true,
    emailUpdates: currentUser?.preferences?.emailUpdates ?? true,
    emergencyAlerts: currentUser?.preferences?.emergencyAlerts ?? true
  });

  const handleSave = async () => {
    try {
      const updatedUser = {
        ...currentUser!,
        ...formData,
        preferences
      };

      const response = await mockApi.updateProfile(updatedUser);
      
      if (response.success && response.data) {
        setCurrentUser(response.data);
        setIsEditing(false);
        toast({
          title: "Perfil atualizado",
          description: "Suas informações foram salvas com sucesso",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao atualizar perfil",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    setFormData({
      name: currentUser?.name || '',
      phone: currentUser?.phone || '',
      email: currentUser?.email || ''
    });
    setIsEditing(false);
  };

  const handleLogout = () => {
    // In a real app, this would clear authentication
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso",
    });
    // Redirect to login would happen here
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Usuário não encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Perfil</h1>
            <p className="text-muted-foreground">
              Gerencie suas informações e preferências
            </p>
          </div>
          {!isEditing ? (
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setIsEditing(true)}
            >
              <Edit3 className="w-5 h-5" />
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleCancel}
              >
                <X className="w-5 h-5" />
              </Button>
              <Button 
                variant="healthcare" 
                size="icon"
                onClick={handleSave}
              >
                <Save className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Profile Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-healthcare-light" />
              Informações Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={currentUser.photo} />
                <AvatarFallback className="text-lg">
                  {currentUser.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground">{currentUser.name}</h3>
                  <Badge 
                    variant="secondary"
                    className="bg-healthcare-soft text-healthcare-dark text-xs"
                  >
                    {currentUser.role === 'family' ? 'Família' : 'Cuidador'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Membro desde {new Date(currentUser.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>

            <Separator />

            {/* Editable Fields */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome completo</Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                ) : (
                  <p className="text-foreground mt-1">{currentUser.name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Telefone</Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                ) : (
                  <p className="text-foreground mt-1">{currentUser.phone}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">E-mail</Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                ) : (
                  <p className="text-foreground mt-1">{currentUser.email}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Elder Info (for family users) */}
        {currentUser.role === 'family' && currentUser.elders && currentUser.elders.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-healthcare-light" />
                Idosos Cadastrados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentUser.elders.map(elder => (
                  <div key={elder.id} className="flex items-center justify-between p-3 bg-muted rounded-xl">
                    <div>
                      <p className="font-medium text-foreground">{elder.name}</p>
                      <p className="text-sm text-muted-foreground">{elder.age} anos</p>
                    </div>
                    <Badge variant="secondary" className="bg-healthcare-soft text-healthcare-dark">
                      {elder.conditions.length} condições
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-healthcare-light" />
              Notificações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Notificações push</p>
                <p className="text-sm text-muted-foreground">
                  Receber notificações no dispositivo
                </p>
              </div>
              <Switch
                checked={preferences.notifications}
                onCheckedChange={(checked) => 
                  setPreferences(prev => ({ ...prev, notifications: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">E-mails informativos</p>
                <p className="text-sm text-muted-foreground">
                  Dicas de cuidados e novidades
                </p>
              </div>
              <Switch
                checked={preferences.emailUpdates}
                onCheckedChange={(checked) => 
                  setPreferences(prev => ({ ...prev, emailUpdates: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Alertas de emergência</p>
                <p className="text-sm text-muted-foreground">
                  Notificações urgentes importantes
                </p>
              </div>
              <Switch
                checked={preferences.emergencyAlerts}
                onCheckedChange={(checked) => 
                  setPreferences(prev => ({ ...prev, emergencyAlerts: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Settings & Legal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-healthcare-light" />
              Configurações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="ghost" 
              className="w-full justify-start p-4 h-auto"
              onClick={() => setShowPrivacyDialog(true)}
            >
              <Shield className="w-5 h-5 mr-3 text-muted-foreground" />
              <div className="flex-1 text-left">
                <p className="font-medium">Privacidade e LGPD</p>
                <p className="text-sm text-muted-foreground">
                  Como tratamos seus dados
                </p>
              </div>
            </Button>

            <Button 
              variant="ghost" 
              className="w-full justify-start p-4 h-auto"
              onClick={() => setShowTermsDialog(true)}
            >
              <FileText className="w-5 h-5 mr-3 text-muted-foreground" />
              <div className="flex-1 text-left">
                <p className="font-medium">Termos de Uso</p>
                <p className="text-sm text-muted-foreground">
                  Condições de utilização
                </p>
              </div>
            </Button>

            <Button 
              variant="ghost" 
              className="w-full justify-start p-4 h-auto"
            >
              <HelpCircle className="w-5 h-5 mr-3 text-muted-foreground" />
              <div className="flex-1 text-left">
                <p className="font-medium">Ajuda e Suporte</p>
                <p className="text-sm text-muted-foreground">
                  Central de ajuda
                </p>
              </div>
            </Button>

            <Separator />

            <Button 
              variant="outline" 
              className="w-full justify-start p-4 h-auto text-medical-critical hover:text-medical-critical"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5 mr-3" />
              <div className="flex-1 text-left">
                <p className="font-medium">Sair da conta</p>
                <p className="text-sm text-muted-foreground">
                  Fazer logout do aplicativo
                </p>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Privacy Dialog */}
      <Dialog open={showPrivacyDialog} onOpenChange={setShowPrivacyDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-healthcare-light" />
              Privacidade e LGPD
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <p>
              A D-care está comprometida com a proteção de seus dados pessoais, seguindo 
              rigorosamente a Lei Geral de Proteção de Dados (LGPD).
            </p>
            <div className="space-y-2">
              <h4 className="font-medium">Seus direitos incluem:</h4>
              <ul className="space-y-1 text-muted-foreground ml-4">
                <li>• Acesso aos seus dados</li>
                <li>• Correção de informações</li>
                <li>• Exclusão de dados</li>
                <li>• Portabilidade</li>
                <li>• Revogação de consentimento</li>
              </ul>
            </div>
            <p className="text-muted-foreground">
              Para exercer seus direitos ou esclarecer dúvidas sobre privacidade, 
              entre em contato conosco através do e-mail: privacidade@dcare.com.br
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Terms Dialog */}
      <Dialog open={showTermsDialog} onOpenChange={setShowTermsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-healthcare-light" />
              Termos de Uso
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <p>
              Ao utilizar a plataforma D-care, você concorda com nossos termos de uso 
              e políticas de privacidade.
            </p>
            <div className="space-y-2">
              <h4 className="font-medium">Responsabilidades:</h4>
              <ul className="space-y-1 text-muted-foreground ml-4">
                <li>• Fornecer informações verdadeiras</li>
                <li>• Usar a plataforma de forma responsável</li>
                <li>• Respeitar outros usuários</li>
                <li>• Seguir as diretrizes de segurança</li>
              </ul>
            </div>
            <p className="text-muted-foreground">
              Para ver os termos completos, acesse: www.dcare.com.br/termos
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}