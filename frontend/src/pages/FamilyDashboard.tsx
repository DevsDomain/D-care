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
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button-variants";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/stores/appStore";
import { ListSkeleton } from "@/components/common/LoadingSkeleton";
import { useLogout } from "@/components/hooks/use-logout";
import { AgeCalculator } from "@/components/hooks/useAge";
import { api } from "@/lib/api/api";
import type { Elder } from "@/lib/types";

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

  // variações possíveis para condições
  conditions?: any[] | string | null;
  healthConditions?: any[] | string | null;
  medicalConditions?: any[] | string | null;
  clinicalConditions?: any[] | string | null;
  comorbidities?: any[] | string | null;
  medicalHistory?: { conditions?: any[] | string | null } | null;
  health?: { conditions?: any[] | string | null } | null;
  medical?: { conditions?: any[] | string | null } | null;
};

function pickFamilyIdFromUser(u: any): string | null {
  return (
    u?.familyId ??
    u?.family?.id ??
    (Array.isArray(u?.family) ? u.family[0]?.id : null) ??
    u?.family_id ??
    null
  );
}

function pickFamilyIdFromElder(e: ElderApi): string | null {
  return e?.familyId ?? e?.family_id ?? e?.family?.id ?? null;
}

/** Converte diferentes formatos (array, JSON string, CSV) para array */
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
      /* not json, tenta CSV */
    }
    return s
      .split(/[;,]/)
      .map((x) => x.trim())
      .filter(Boolean);
  }
  return [val];
}

/** Extrai condições de várias chaves possíveis e normaliza */
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

/** Pega um label amigável para a condição */
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

/** Normalização final do idoso */
function normalizeElder(e: ElderApi) {
  return {
    ...e,
    familyId: pickFamilyIdFromElder(e),
    birthDate: e.birthDate ?? e.birthdate ?? "",
    photo: e.photo ?? e.avatarPath ?? null,
    conditions: extractConditions(e),
  };
}

export default function FamilyDashboard() {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser, setSelectedElder } = useAppStore();
  const handleLogout = useLogout();

  const [isLoading, setIsLoading] = useState(true);
  const [loadingElders, setLoadingElders] = useState(false);

  // avatar do usuário logado (vindo do backend)
  const userAvatar =
    (currentUser as any)?.avatarPath ??
    (currentUser as any)?.photo ??
    null;

  // tira o skeleton do topo quando já temos o nome
  useEffect(() => {
    if (currentUser?.name) setIsLoading(false);
  }, [currentUser?.name]);

  // Busca a lista de idosos (inclui condições normalizadas)
  useEffect(() => {
    const fetchElders = async () => {
      // 1. Garante que temos um usuário e que ele é um familiar
      if (
        !currentUser ||
        (currentUser.role !== "FAMILY" && currentUser.role !== "family")
      ) {
        return;
      }

      // 2. Pega o ID da família.
      const familyId =
        (currentUser as any)?.id ?? (currentUser as any)?.userId ?? null;

      if (!familyId) return;

      try {
        setLoadingElders(true);

        // 3. Constroi a URL correta
        const url = `idosos/family?familyId=${familyId}`;
        console.log("Buscando idosos em:", url);

        const { data } = await api.get<ElderApi[]>(url);

        // 4. Normaliza
        const fetchedElders = (data ?? []).map(normalizeElder);
        console.log("IDOSOS ENCONTRADOS E NORMALIZADOS:", fetchedElders);

        // 5. Atualiza o usuário ATUAL com a lista de idosos
        const updatedUser = { ...currentUser, elders: fetchedElders };

        setCurrentUser(updatedUser);

        // 6. Salva no localStorage
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

  if (isLoading) {
    return (
      <div className="p-4 space-y-6">
        <ListSkeleton type="profile" count={1} />
      </div>
    );
  }

  if (!currentUser || !currentUser.elders?.length) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-gradient-to-r from-healthcare-dark to-healthcare-light text-white">
          <div className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Heart className="w-8 h-8" />
              <h1 className="text-2xl font-bold">D-care</h1>
            </div>
            <p className="text-healthcare-accent">
              Cuidado especializado para quem você ama
            </p>
          </div>
        </header>

        {/* Welcome Content */}
        <div className="p-6">
          <div className="healthcare-card text-center mb-6">
            <div className="p-8">
              <Shield className="w-16 h-16 mx-auto mb-4 text-healthcare-light" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Bem-vindo ao D-care
              </h2>
              <p className="text-muted-foreground mb-6">
                Para começar, vamos cadastrar as informações da pessoa que você
                cuida
              </p>
              <Button
                variant="healthcare"
                size="lg"
                onClick={handleAddElder}
                className="w-full"
              >
                <Plus className="w-5 h-5 mr-2" />
                Cadastrar Pessoa
              </Button>
            </div>
          </div>

          {/* Features Preview */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-healthcare-soft/30 border-healthcare-light/20">
              <CardContent className="p-4 text-center">
                <Search className="w-8 h-8 mx-auto mb-2 text-healthcare-dark" />
                <h3 className="font-medium text-sm">Buscar Cuidadores</h3>
                <p className="text-xs text-muted-foreground">
                  Profissionais verificados
                </p>
              </CardContent>
            </Card>

            <Card className="bg-healthcare-soft/30 border-healthcare-light/20">
              <CardContent className="p-4 text-center">
                <Activity className="w-8 h-8 mx-auto mb-2 text-healthcare-dark" />
                <h3 className="font-medium text-sm">Avaliação IVCF-20</h3>
                <p className="text-xs text-muted-foreground">
                  Avalie a independência
                </p>
              </CardContent>
            </Card>

            <Card className="bg-healthcare-soft/30 border-healthcare-light/20">
              <CardContent className="p-4 text-center">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 text-healthcare-dark" />
                <h3 className="font-medium text-sm">Guia IA</h3>
                <p className="text-xs text-muted-foreground">
                  Orientações especializadas
                </p>
              </CardContent>
            </Card>

            <Card className="bg-healthcare-soft/30 border-healthcare-light/20">
              <CardContent className="p-4 text-center">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-healthcare-dark" />
                <h3 className="font-medium text-sm">Agendamentos</h3>
                <p className="text-xs text-muted-foreground">
                  Gerencie consultas
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-healthcare-dark to-healthcare-light text-white">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold">Olá, {currentUser.name}</h1>
              <p className="text-healthcare-accent text-sm">
                Como posso ajudar hoje?
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Avatar className="border-2 border-white/20">
                <AvatarImage
                  src={userAvatar || undefined}
                  alt={currentUser.name || "userName"}
                />
                <AvatarFallback className="bg-white/20 text-white">
                  {getInitials(currentUser.name)}
                </AvatarFallback>
              </Avatar>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-white hover:bg-white/20"
              >
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Ações rápidas */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="healthcare"
            className="h-auto py-4 flex-col gap-2"
            onClick={handleFindCaregiver}
          >
            <Search className="w-6 h-6" />
            <span className="text-xs">Buscar Cuidador</span>
          </Button>

          <Button
            variant="trust"
            className="h-auto py-4 flex-col gap-2"
            onClick={handleOpenGuide}
          >
            <MessageCircle className="w-6 h-6" />
            <span className="text-xs">Guia IA</span>
          </Button>

          <Button
            variant="soft"
            className="h-auto py-4 flex-col gap-2"
            onClick={handleViewBookings}
          >
            <Calendar className="w-6 h-6" />
            <span className="text-xs">Agendamentos</span>
          </Button>

          <Button
            variant="soft"
            className="h-auto py-4 flex-col gap-2"
            onClick={handleAddElder}
          >
            <Plus className="w-6 h-6" />
            <span className="text-xs">Cadastrar Idoso</span>
          </Button>
        </div>

        {/* Cards de Idosos */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Pessoas sob seus cuidados
            </h2>
          </div>

          {loadingElders ? (
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Carregando...</p>
            </Card>
          ) : (
            (currentUser.elders ?? []).map((elder: any) => {
              const age =
                elder?.birthDate || elder?.birthdate
                  ? `${AgeCalculator(elder.birthDate ?? elder.birthdate)} anos`
                  : "Idade não informada";

              const conditions = Array.isArray(elder?.conditions)
                ? elder.conditions
                : [];

              return (
                <Card key={elder.id} className="healthcare-card">
                  <CardContent className="px-0 py-6">
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
            })
          )}
        </div>

        {/* Status */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">
            Atividade Recente
          </h2>

          <Card className="bg-gradient-to-r from-medical-success/10 to-healthcare-soft/30 border-medical-success/20">
            <CardContent className="px-10 py-6">
              <div className="flex items-center gap-3">
                <div className="bg-medical-success/20 p-2 rounded-full">
                  <Shield className="w-5 h-5 text-medical-success" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-sm">Sistema Ativo</h3>
                  <p className="text-xs text-muted-foreground">
                    Monitoramento 24h funcionando normalmente
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
