/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import {
  User,
  Settings,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  Edit3,
  Save,
  X,
  FileText,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button-variants";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/hooks/use-toast";
import { useAppStore } from "@/lib/stores/appStore";
import { mockApi } from "@/lib/api/mock";
import { useLogout } from "@/components/hooks/use-logout";

export default function Profile() {
  const { toast } = useToast();
  const { currentUser, setCurrentUser } = useAppStore();
  const logout = useLogout();

  // Nome e iniciais para o header e avatar grande
  const firstName = (currentUser?.name ?? "").trim().split(/\s+/)[0] || "";
  const getInitials = (name?: string) =>
    (name ?? "")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((p) => p[0]!.toUpperCase())
      .slice(0, 3)
      .join("");

  const [isEditing, setIsEditing] = useState(false);
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [showPrivacyDialog, setShowPrivacyDialog] = useState(false);

  const [formData, setFormData] = useState({
    name: currentUser?.name || "",
    phone: currentUser?.phone || "",
    email: currentUser?.email || "",
  });
  const [preferences, setPreferences] = useState({
    notifications: currentUser?.preferences?.notifications ?? true,
    emailUpdates: currentUser?.preferences?.emailUpdates ?? true,
    emergencyAlerts: currentUser?.preferences?.emergencyAlerts ?? true,
  });

  // Mantém os campos do formulário sincronizados se o usuário mudar
  useEffect(() => {
    setFormData({
      name: currentUser?.name || "",
      phone: currentUser?.phone || "",
      email: currentUser?.email || "",
    });
    setPreferences({
      notifications: currentUser?.preferences?.notifications ?? true,
      emailUpdates: currentUser?.preferences?.emailUpdates ?? true,
      emergencyAlerts: currentUser?.preferences?.emergencyAlerts ?? true,
    });
  }, [currentUser?.id]);

  const handleSave = async () => {
    try {
      const updatedUser = {
        ...currentUser!,
        ...formData,
        preferences,
      };

      const response = await mockApi.updateProfile(updatedUser);

      if (response.success && response.data) {
        setCurrentUser(response.data);
        try {
          localStorage.setItem("user", JSON.stringify(response.data));
        } catch {
          /* ignore */
        }
        setIsEditing(false);
        toast({
          title: "Perfil atualizado",
          description: "Suas informações foram salvas com sucesso",
        });
      }
    } catch {
      toast({
        title: "Erro",
        description: "Falha ao atualizar perfil",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setFormData({
      name: currentUser?.name || "",
      phone: currentUser?.phone || "",
      email: currentUser?.email || "",
    });
    setIsEditing(false);
  };

  if (!currentUser) {
    return (
      <div className="min-h-dvh bg-background overflow-x-hidden flex items-center justify-center">
        <p className="text-muted-foreground">Usuário não encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background overflow-x-hidden flex flex-col">
      {/* HEADER (sem avatar, só saudação + editar) */}
      <header className="sticky top-0 z-20 bg-gradient-to-r from-healthcare-dark to-healthcare-light text-white pt-[env(safe-area-inset-top)]">
        <div className="px-3 py-2 sm:px-4 sm:py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Heart className="w-6 h-6" />
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-semibold truncate">
                  {firstName ? `Olá, ${firstName}!` : "Olá!"}
                </h1>
                <p className="text-xs sm:text-sm text-white/90">
                  Como posso ajudar hoje?
                </p>
              </div>
            </div>

            {!isEditing ? (
              <Button
                variant="outline"
                size="icon"
                className="bg-white/10 hover:bg-white/20 text-white border-white/30"
                onClick={() => setIsEditing(true)}
                aria-label="Editar perfil"
              >
                <Edit3 className="w-5 h-5" />
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/30"
                  onClick={handleCancel}
                  aria-label="Cancelar edição"
                >
                  <X className="w-5 h-5" />
                </Button>
                <Button
                  variant="healthcare"
                  size="icon"
                  className="shadow-md"
                  onClick={handleSave}
                  aria-label="Salvar alterações"
                >
                  <Save className="w-5 h-5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* CONTEÚDO */}
      <main className="flex-1 px-4 sm:px-6 py-4 pb-[max(env(safe-area-inset-bottom),theme(spacing.6))]">
        {/* Profile Info */}
        <Card className="mb-6 healthcare-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-healthcare-light" />
              Informações Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar grande + dados */}
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={currentUser.photo} />
                <AvatarFallback className="text-lg">
                  {getInitials(currentUser.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground">
                    {currentUser.name}
                  </h3>
                  <Badge
                    variant="secondary"
                    className="bg-healthcare-soft text-healthcare-dark text-xs"
                  >
                    {currentUser.role === "FAMILY" ? "Família" : "Cuidador"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Membro desde{" "}
                  {new Date(currentUser.createdAt).toLocaleDateString("pt-BR")}
                </p>
              </div>
            </div>

            <Separator />

            {/* Campos editáveis */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome completo</Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
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
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
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
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                  />
                ) : (
                  <p className="text-foreground mt-1">{currentUser.email}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notificações */}
        <Card className="mb-6">
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
                  setPreferences((prev) => ({
                    ...prev,
                    notifications: checked,
                  }))
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
                  setPreferences((prev) => ({ ...prev, emailUpdates: checked }))
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
                  setPreferences((prev) => ({
                    ...prev,
                    emergencyAlerts: checked,
                  }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Configurações / Legal */}
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

            <Button variant="ghost" className="w-full justify-start p-4 h-auto">
              <HelpCircle className="w-5 h-5 mr-3 text-muted-foreground" />
              <div className="flex-1 text-left">
                <p className="font-medium">Ajuda e Suporte</p>
                <p className="text-sm text-muted-foreground">Central de ajuda</p>
              </div>
            </Button>

            <Separator />

            <Button
              variant="outline"
              className="w-full justify-start p-4 h-auto text-medical-critical hover:text-medical-critical"
              onClick={logout}
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
      </main>

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
              A D-care está comprometida com a proteção de seus dados pessoais,
              seguindo rigorosamente a Lei Geral de Proteção de Dados (LGPD).
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
              entre em contato conosco através do e-mail:
              privacidade@dcare.com.br
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
              Ao utilizar a plataforma D-care, você concorda com nossos termos
              de uso e políticas de privacidade.
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
