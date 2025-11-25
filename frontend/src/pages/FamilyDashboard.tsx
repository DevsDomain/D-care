import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Activity,
  MessageCircle,
  Calendar,
  User,
  Heart,
  Shield,
  ChevronRight,
  Stethoscope,
  Sparkles,
  LogOut,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button-variants";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/stores/appStore";
import { Skeleton } from "@/components/ui/skeleton"; // Assuming standard shadcn skeleton exists
import { useLogout } from "@/components/hooks/use-logout";
import { AgeCalculator } from "@/components/hooks/useAge";
import { api } from "@/lib/api/api";
import type { Elder } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// --- HELPERS & UTILS ---

/** Helper: iniciais do nome */
const getInitials = (name?: string) => {
  const n = (name ?? "").trim();
  if (!n) return "?";
  const parts = n.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  const first = parts[0][0] ?? "";
  const last = parts[parts.length - 1][0] ?? "";
  return (first + last).toUpperCase();
};

/** Tipagem compatível com variações do backend dos idosos */
type ElderApi = {
  id: string;
  familyId?: string | null;
  family_id?: string | null;
  family?: { id?: string | null } | null;

  name: string;
  birthdate?: string;
  birthDate?: string;
  avatarPath?: string | null;
  photo?: string | null;

  conditions?: any[] | string | null;
  healthConditions?: any[] | string | null;
  medicalConditions?: any[] | string | null;
  clinicalConditions?: any[] | string | null;
  comorbidities?: any[] | string | null;
  medicalHistory?: { conditions?: any[] | string | null } | null;
  health?: { conditions?: any[] | string | null } | null;
  medical?: { conditions?: any[] | string | null } | null;
};

function pickFamilyIdFromElder(e: ElderApi): string | null {
  return e?.familyId ?? e?.family_id ?? e?.family?.id ?? null;
}

function toArray(val: any): any[] {
  if (!val && val !== 0) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    const s = val.trim();
    if (!s) return [];
    try {
      const parsed = JSON.parse(s);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      /* not json */
    }
    return s
      .split(/[;,]/)
      .map((x) => x.trim())
      .filter(Boolean);
  }
  return [val];
}

function extractConditions(e: ElderApi): any[] {
  const candidates: any[] = [
    e.conditions,
    e.healthConditions,
    e.medicalConditions,
    e.clinicalConditions,
    e.comorbidities,
    e.medicalHistory?.conditions,
    e.health?.conditions,
    e.medical?.conditions,
  ].filter((v) => v != null);

  for (const c of candidates) {
    const arr = toArray(c);
    if (arr.length) return arr;
  }
  return [];
}

function getConditionLabel(c: any): string {
  if (typeof c === "string") return c;
  return (
    c?.name ??
    c?.label ??
    c?.description ??
    c?.title ??
    c?.condition ??
    c?.condicao ??
    String(c ?? "")
  );
}

function normalizeElder(e: ElderApi) {
  return {
    ...e,
    familyId: pickFamilyIdFromElder(e),
    birthDate: e.birthDate ?? e.birthdate ?? "",
    photo: e.photo ?? e.avatarPath ?? null,
    conditions: extractConditions(e),
  };
}

// --- MAIN COMPONENT ---

export default function FamilyDashboard() {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser, setSelectedElder } = useAppStore();
  const handleLogout = useLogout();

  const [isLoading, setIsLoading] = useState(true);
  const [loadingElders, setLoadingElders] = useState(false);
  const [showPrivacyDialog, setShowPrivacyDialog] = useState(false);


  const userAvatar =
    (currentUser as any)?.avatarPath ?? (currentUser as any)?.photo ?? null;
  const hasElders = currentUser?.elders && currentUser.elders.length > 0;

  // Initial load check
  useEffect(() => {
    if (currentUser?.name) setIsLoading(false);
  }, [currentUser?.name]);

  // Fetch Elders Logic
  useEffect(() => {
    const fetchElders = async () => {
      if (
        !currentUser ||
        (currentUser.role !== "FAMILY" && currentUser.role !== "family")
      ) {
        return;
      }
      const familyId =
        (currentUser as any)?.id ?? (currentUser as any)?.userId ?? null;
      if (!familyId) return;

      try {
        setLoadingElders(true);
        const url = `idosos/family?familyId=${familyId}`;
        const { data } = await api.get<ElderApi[]>(url);
        const fetchedElders = (data ?? []).map(normalizeElder);

        const updatedUser = { ...currentUser, elders: fetchedElders };
        setCurrentUser(updatedUser);

        try {
          localStorage.setItem("user", JSON.stringify(updatedUser));
        } catch (err) {
          console.warn("Falha ao salvar usuário no localStorage:", err);
        }
      } catch (err: any) {
        console.error("Falha ao buscar idosos:", err?.message ?? err);
      } finally {
        setLoadingElders(false);
      }
    };

    fetchElders();
  }, [currentUser?.id, currentUser?.role, setCurrentUser]);

  // --- HANDLERS ---
  const handleAddElder = () => navigate("/elder/register");
  const handleStartIvcf = (elder: Elder) => {
    setSelectedElder(elder);
    navigate(`/ivcf/${elder.id}`);
  };
  const handleFindCaregiver = () => navigate("/search");
  const handleViewBookings = () => navigate("/bookings");
  const handleOpenGuide = () => navigate("/guide");
  const handleEditElder = (elderId: string) =>
    navigate(`/elders/${elderId}/edit`);

  // --- RENDER LOADING ---
  if (isLoading) {
    return (
      <div className="p-6 space-y-6 max-w-md mx-auto">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
        </div>
        <Skeleton className="h-[120px] w-full rounded-xl" />
        <Skeleton className="h-[120px] w-full rounded-xl" />
      </div>
    );
  }

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* --- HEADER --- */}
      <header className="sticky top-0 z-40 w-full bg-gradient-to-r from-healthcare-dark to-healthcare-light shadow-sm">
        <div className="absolute inset-0 bg-black/5" />{" "}
        {/* Overlay for better contrast if needed */}
        <div className="relative flex items-center justify-between px-6 py-4 max-w-3xl mx-auto text-white">
          <div className="flex flex-col">
            <h1 className="text-lg font-bold leading-tight">
              Olá, {currentUser.name?.split(" ")[0]}
            </h1>
            <p className="text-xs text-white/90 font-medium opacity-90">
              D-care Dashboard
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border-2 border-white/30 shadow-sm cursor-pointer transition-transform hover:scale-105">
              <AvatarImage src={userAvatar} alt={currentUser.name} />
              <AvatarFallback className="bg-white/20 text-white text-xs">
                {getInitials(currentUser.name)}
              </AvatarFallback>
            </Avatar>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-white hover:bg-white/20 h-9 w-9 rounded-full"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 max-w-3xl mx-auto space-y-8">
        {/* --- SEÇÃO 1: ATALHOS RÁPIDOS --- */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider ml-1">
            Acesso Rápido
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {/* Botão Buscar Cuidadores */}
            <button
              onClick={handleFindCaregiver}
              className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all active:scale-95"
            >
              <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center mb-2 text-blue-600">
                <Search className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-slate-700 text-center">
                Buscar Cuidadores
              </span>
            </button>

            {/* Botão Guia IA */}
            <button
              onClick={handleOpenGuide}
              className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all active:scale-95"
            >
              <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center mb-2 text-purple-600">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-slate-700 text-center">
                Guia IA
              </span>
            </button>

            {/* Botão Agendamentos */}
            <button
              onClick={handleViewBookings}
              className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all active:scale-95"
            >
              <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center mb-2 text-emerald-600">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-slate-700 text-center">
                Agenda
              </span>
            </button>

            {/* Botão Ajuda/Info (Placeholder) */}
            <button className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all active:scale-95"
            onClick={() => setShowPrivacyDialog(true)}>
              <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center mb-2 text-amber-600">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-slate-700 text-center">
                LGPD
              </span>
            </button>
          </div>
        </section>
         {/* Privacy Dialog */}
<Dialog open={showPrivacyDialog} onOpenChange={setShowPrivacyDialog}>
  <DialogContent className="max-w-md">
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <Shield className="w-5 h-5 text-healthcare-light" />
        Privacidade e LGPD
      </DialogTitle>
    </DialogHeader>

    <div className="space-y-4 text-sm leading-relaxed">
      <p>
        A D-Care trata seus dados seguindo a LGPD (Lei 13.709/2018). Usamos suas 
        informações apenas para cadastro, validação profissional, conexão com 
        cuidadores, agendamentos e recursos assistidos por IA.
      </p>

      <p>
        Não compartilhamos seus dados sem autorização, exceto quando exigido por 
        lei. Adotamos medidas técnicas e organizacionais para garantir segurança 
        e evitar acessos indevidos.
      </p>

      <div className="space-y-2">
        <h4 className="font-medium">Seus direitos:</h4>
        <ul className="space-y-1 text-muted-foreground ml-4">
          <li>• Acessar e consultar seus dados</li>
          <li>• Solicitar correção ou atualização</li>
          <li>• Pedir anonimização, bloqueio ou exclusão</li>
          <li>• Solicitar portabilidade</li>
          <li>• Saber com quem compartilhamos</li>
          <li>• Revogar consentimento</li>
        </ul>
      </div>

      <p>
        Para dúvidas ou solicitações, contate nosso DPO: 
        <span className="font-medium"> privacidade@dcare.com.br</span>.
      </p>

      <p className="text-muted-foreground">
        Ao continuar, você concorda com esta Política de Privacidade.
      </p>
    </div>
  </DialogContent>
</Dialog>

        {/* --- SEÇÃO 2: LISTA DE IDOSOS --- */}
        <section className="space-y-4">
          <div className="flex items-center justify-between ml-1">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Sob seus cuidados
            </h2>
            {hasElders && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-healthcare-dark hover:text-healthcare-dark/80"
                onClick={handleAddElder}
              >
                <Plus className="w-4 h-4 mr-1" /> Adicionar
              </Button>
            )}
          </div>

          {loadingElders ? (
            <div className="space-y-4">
              <Skeleton className="h-40 w-full rounded-xl" />
              <Skeleton className="h-40 w-full rounded-xl" />
            </div>
          ) : !hasElders ? (
            /* --- EMPTY STATE CARD --- */
            <Card className="border-dashed border-2 border-slate-200 shadow-none bg-slate-50/50">
              <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                  <Heart className="w-8 h-8 text-rose-400" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-1">
                  Cadastre quem você ama
                </h3>
                <p className="text-sm text-slate-500 max-w-[250px] mb-6">
                  Adicione os dados para começar a usar o monitoramento e
                  encontrar cuidadores.
                </p>
                <Button
                  onClick={handleAddElder}
                  className="bg-healthcare-dark hover:bg-healthcare-dark/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Cadastrar Pessoa
                </Button>
              </CardContent>
            </Card>
          ) : (
            /* --- LISTA DE CARDS DE IDOSOS --- */
            <div className="grid gap-4 grid-cols-1">
              {currentUser.elders?.map((elder: any) => {
                const age =
                  elder?.birthDate || elder?.birthdate
                    ? `${AgeCalculator(
                        elder.birthDate ?? elder.birthdate
                      )} anos`
                    : null;

                const conditions = Array.isArray(elder?.conditions)
                  ? elder.conditions
                  : [];

                return (
                  <Card key={elder.id} className="w-full m-auto healthcare-card">
                  <CardContent className="px-0 py-3">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16 border-2 border-healthcare-light/20">
                        <AvatarImage
                          src={elder.photo || elder.avatarPath}
                          alt={elder.name}
                        />
                        <AvatarFallback className="bg-healthcare-soft text-healthcare-dark font-semibold text-lg">
                          {getInitials(elder.name)}
                        </AvatarFallback>
                      </Avatar>
  
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-foreground mb-1 truncate">
                          {elder.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {age}
                        </p>
  
                        {/* Condições (até 3 + “+N”) */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {conditions.length ? (
                            <>
                              {conditions
                                .slice(0, 3)
                                .map((c: any, idx: number) => (
                                  <Badge
                                    key={`${elder.id}-cond-${idx}`}
                                    variant="outline"
                                    className="text-xs rounded-full px-3 py-1"
                                  >
                                    {getConditionLabel(c)}
                                  </Badge>
                                ))}
                              {conditions.length > 3 && (
                                <Badge
                                  variant="secondary"
                                  className="text-xs rounded-full px-3 py-1"
                                >
                                  +{conditions.length - 3}
                                </Badge>
                              )}
                            </>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              Sem condições cadastradas
                            </span>
                          )}
                        </div>
  
                        {/* Ações */}
                        <div className="flex gap-2">
                          <Button
                            variant="healthcare"
                            size="sm"
                            onClick={() => handleStartIvcf(elder)}
                          >
                            <Activity className="w-4 h-4 mr-1" />
                            IVCF-20
                          </Button>
  
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditElder(elder.id)}
                          >
                            <User className="w-4 h-4 mr-1" />
                            Editar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
