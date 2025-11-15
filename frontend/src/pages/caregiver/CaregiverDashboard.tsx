// src/pages/caregiver/CaregiverDashboard.tsx
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Bell,
  AlertCircle,
  Check,
  X,
  Phone,
  Avatar as LucideAvatar,
} from "lucide-react";
import { Button } from "@/components/ui/button-variants";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CaregiverCardSkeleton } from "@/components/common/LoadingSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { useToast } from "@/components/hooks/use-toast";
import type { Caregiver, Booking } from "@/lib/types";
import { useAppStore } from "@/lib/stores/appStore";
import { useNavigate } from "react-router-dom";
import {
  fetchCaregiverProfile,
  toggleCaregiverAvailability,
  toggleCaregiverEmergencyAvailability,
} from "@/lib/api/caregiver";
import {
  fetchAppointments,
  updateAppointmentStatus,
} from "@/lib/api/appointment";
import { api } from "@/lib/api/api";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/* ===========================
   Backend types (used in mapping)
   =========================== */
type AppointmentApiStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "CANCELLED"
  | "COMPLETED";

type AppointmentApi = {
  id: string;
  familyId: string | null;
  elderId: string | null;
  caregiverId: string | null;
  datetimeStart: string;
  datetimeEnd: string;
  status: AppointmentApiStatus;
  emergency: boolean | null;
  notes: string | null;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;

  elder?: {
    id: string;
    name: string | null;
    avatarPath?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    zipCode?: string | null;
  } | null;

  family?: {
    user?: {
      userProfile: Array<{ id: string; name: string | null; phone?: string }>;
    };
  } | null;
};

/* ===========================
   Front status map
   =========================== */
type BookingStatus = "requested" | "accepted" | "canceled" | "completed";

const statusConfig: Record<BookingStatus, { label: string; color: string }> = {
  requested: { label: "Solicitado", color: "bg-yellow-300 text-black" },
  accepted: { label: "Aceito", color: "bg-green-600 text-white" },
  canceled: { label: "Cancelado", color: "bg-red-600 text-white" },
  completed: { label: "Concluído", color: "bg-neutral-600 text-white" },
};

/* API <-> Front maps */
function mapStatusFromApi(s: AppointmentApiStatus): BookingStatus {
  switch (s) {
    case "PENDING":
      return "requested";
    case "ACCEPTED":
      return "accepted";
    case "REJECTED":
    case "CANCELLED":
      return "canceled";
    case "COMPLETED":
      return "completed";
    default:
      return "requested";
  }
}
function mapStatusToApi(s: BookingStatus): AppointmentApiStatus {
  switch (s) {
    case "requested":
      return "PENDING";
    case "accepted":
      return "ACCEPTED";
    case "canceled":
      return "CANCELLED";
    case "completed":
      return "COMPLETED";
    default:
      return "PENDING";
  }
}

/* Duração em horas (a partir de ISO start/end) */
function calcDurationHours(startISO: string, endISO: string) {
  const s = new Date(startISO).getTime();
  const e = new Date(endISO).getTime();
  return Math.max(1, Math.round((e - s) / 3600000));
}

/* ===========================
   Component
   =========================== */
export default function CaregiverDashboard() {
  // local UI state
  const [bookingRequests, setBookingRequests] = useState<Booking[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [caregiverUser, setCaregiverUser] = useState<Partial<Caregiver>>({});
  const [emergencyAvailable, setEmergencyAvailable] = useState<
    boolean | undefined
  >(caregiverUser?.emergency);
  const [activeToday, setActiveToday] = useState<boolean | undefined>(
    caregiverUser?.availability
  );
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { currentUser, setCurrentUser } = useAppStore();
  const [processingBookingIds, setProcessingBookingIds] = useState<string[]>(
    []
  );
  const [appointments, setAppointments] = useState<any[]>([]);
  const [tab, setTab] = useState<"requests" | "accepted" | "completed">(
    "requests"
  );

  const navigate = useNavigate();

  /* -------------------------
     Debug helper
     ------------------------- */
  const log = (...args: any[]) => {
    // visible and consistent prefix
    // eslint-disable-next-line no-console
    console.debug("[CaregiverDashboard]", ...args);
  };

  /* -------------------------
     Fetch caregiver profile (first load)
     ------------------------- */
  /* -------------------------
   Fetch caregiver profile (first load)
   ------------------------- */
  // -----------------------------------------------------
  // Fetch caregiver profile once we know currentUser.id
  // -----------------------------------------------------
  useEffect(() => {
    async function loadCaregiver() {
      if (!currentUser?.id) {
        log("No currentUser yet. Waiting...");
        return;
      }
      if (currentUser.role !== "CAREGIVER") {
        log("User is not caregiver:", currentUser.role);
        return;
      }

      try {
        log("Fetching caregiver profile for userId:", currentUser.id);

        const caregiver = await fetchCaregiverProfile(currentUser.id);

        log("Caregiver fetched:", caregiver);

        if (!caregiver) {
          log("No caregiver record found for this user.");
          return;
        }

        setCaregiverUser(caregiver);

        setActiveToday(!!caregiver?.availability);
        setEmergencyAvailable(!!caregiver?.emergency);

        // After we know caregiver info -> load appointments
        await loadAppointmentsForCaregiver(caregiver);
      } catch (err) {
        console.error(err);
        toast({
          title: "Erro",
          description: "Falha ao carregar perfil do cuidador",
          variant: "destructive",
        });
      }
    }

    loadCaregiver();
  }, [currentUser]);

  // -----------------------------------------------------
  // Load appointments using caregiver.userId
  // -----------------------------------------------------
  async function loadAppointmentsForCaregiver(caregiver: any) {
    if (!caregiver) {
      log("loadAppointmentsForCaregiver: caregiver is null");
      return;
    }

    const caregiverId = caregiver.userId; // <-- ✔ correto!

    if (!caregiverId) {
      log("loadAppointmentsForCaregiver: caregiver.userId is missing");
      return;
    }

    try {
      setLoading(true);
      const url = `appointments?caregiverId=${caregiverId}`;
      log("GET", url);

      const { data } = await api.get(url);

      log("Appointments fetched:", data);

      const mapped = data.map((a: any) => ({
        id: a.id,
        elderName: a.elder?.name ?? "Paciente",
        elderPhoto: a.elder?.avatarPath ?? "",
        familyName: a.family?.user?.userProfile?.[0]?.name ?? "Familiar",
        familyPhone: a.family?.user?.userProfile?.[0]?.phone ?? "",
        dateISO: a.datetimeStart,
        duration: calcDurationHours(a.datetimeStart, a.datetimeEnd),
        status: mapStatusFromApi(a.status),
        emergency: Boolean(a.emergency),
        totalPrice: a.totalPrice ?? 0,
        notes: a.notes ?? "",
      }));

      setAppointments(mapped);
    } catch (err) {
      console.error(err);
      toast({
        title: "Erro",
        description: "Falha ao carregar solicitações",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  /* ========================
     Update status (PATCH)
     ======================== */
  async function updateStatus(id: string, newStatus: BookingStatus) {
    try {
      log("updateStatus called:", { id, newStatus });
      setProcessingBookingIds((prev) => [...prev, id]);

      await api.patch(`appointments/${id}/status`, {
        status: mapStatusToApi(newStatus),
      });

      // update local state
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
      );
      setBookingRequests((prev) => prev.filter((b) => b.id !== id));
      if (newStatus === "accepted") {
        const accepted = appointments.find((x) => x.id === id);
        if (accepted)
          setUpcomingBookings((prev) => [
            ...prev,
            { ...accepted, status: "accepted" },
          ]);
      }

      log("updateStatus success, updated local states.");
      toast({ title: "Sucesso", description: "Status atualizado!" });
    } catch (err) {
      console.error("[CaregiverDashboard] updateStatus error:", err);
      toast({
        title: "Erro",
        description: "Falha ao atualizar status",
        variant: "destructive",
      });
    } finally {
      setProcessingBookingIds((prev) => prev.filter((x) => x !== id));
    }
  }

  /* Toggle availability */
  const handleActive = async () => {
    try {
      log("Toggling availability (current caregiverUser):", caregiverUser);
      await toggleCaregiverAvailability(caregiverUser.userId!, !activeToday);
      setActiveToday((v) => !v);
      toast({ title: "Sucesso", description: "Disponibilidade atualizada" });
    } catch (err) {
      console.error("handleActive error:", err);
      toast({
        title: "Erro",
        description: "Falha ao alterar disponibilidade",
        variant: "destructive",
      });
    }
  };

  const handleEmergency = async () => {
    try {
      log("Toggling emergency availability (current):", caregiverUser);
      await toggleCaregiverEmergencyAvailability(
        caregiverUser.userId!,
        !emergencyAvailable
      );
      setEmergencyAvailable((v) => !v);
      toast({
        title: "Sucesso",
        description: "Disponibilidade de emergência atualizada",
      });
    } catch (err) {
      console.error("handleEmergency error:", err);
      toast({
        title: "Erro",
        description: "Falha ao alterar disponibilidade",
        variant: "destructive",
      });
    }
  };

  /* Filters by tab */
  const filtered = appointments.filter((a) => {
    switch (tab) {
      case "requests":
        return a.status === "requested";
      case "accepted":
        return a.status === "accepted";
      case "completed":
        return a.status === "completed" || a.status === "canceled";
      default:
        return true;
    }
  });

  /* Date / Time format helpers (single definition) */
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

  /* Loading skeleton */
  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="p-4">
          <CaregiverCardSkeleton />
        </div>
      </div>
    );
  }

  /* ===========================
     Render
     =========================== */
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-6">
        <div className="flex items-center justify-around">
          <Avatar className="border-2 border-white/20 w-16 h-16">
            <AvatarImage
              width={200}
              height={200}
              src={(caregiverUser as any)?.avatarUrl}
              alt={(caregiverUser as any)?.name || "userName"}
            />
            <AvatarFallback className="bg-white/20 text-white">
              {(caregiverUser as any)?.name ?? "Cuidador"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Painel do Cuidador
            </h1>
            <p className="text-muted-foreground">
              Bem-vindo de volta, {currentUser?.name}
            </p>
          </div>
          <Button variant="outline" size="icon" title="Editar Cuidador">
            <User
              className="w-5 h-5"
              onClick={() => navigate("/editCaregiver")}
            />
          </Button>
        </div>

        {/* Status toggles */}
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between p-4 bg-healthcare-soft rounded-2xl">
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  activeToday ? "bg-medical-success" : "bg-neutral-400"
                }`}
              />
              <div>
                <p className="font-medium text-foreground">Ativo hoje</p>
                <p className="text-sm text-muted-foreground">
                  Aceitar novas solicitações
                </p>
              </div>
            </div>
            <Switch
              checked={Boolean(activeToday)}
              onCheckedChange={handleActive}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-medical-critical/10 rounded-2xl border border-medical-critical/20">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-medical-critical" />
              <div>
                <p className="font-medium text-foreground">Emergências</p>
                <p className="text-sm text-muted-foreground">
                  Disponível para chamadas urgentes
                </p>
              </div>
            </div>
            <Switch
              checked={Boolean(emergencyAvailable)}
              onCheckedChange={handleEmergency}
            />
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Tabs */}
        <Tabs
          value={tab}
          onValueChange={(v: any) => setTab(v)}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3 bg-muted rounded-xl p-1">
            <TabsTrigger value="requests">Solicitações</TabsTrigger>
            <TabsTrigger value="accepted">Aceitas</TabsTrigger>
            <TabsTrigger value="completed">Finalizadas</TabsTrigger>
          </TabsList>

          <TabsContent value={tab}>
            {loading ? (
              <p className="text-center">Carregando...</p>
            ) : filtered.length === 0 ? (
              <p className="text-center text-muted-foreground">
                Nenhuma reserva
              </p>
            ) : (
              filtered.map((a) => (
                <Card key={a.id} className="mb-4 healthcare-card">
                  <CardHeader>
                    <div className="flex items-center gap-3 w-full">
                      <Avatar>
                        <AvatarImage src={a.elderPhoto} />
                        <AvatarFallback>
                          {(a.elderName || "P").slice(0, 1)}
                        </AvatarFallback>
                      </Avatar>

                      <div>
                        <h3 className="font-semibold">{a.elderName}</h3>
                        <p className="text-sm text-muted-foreground">
                          Familiar: {a.familyName}
                        </p>
                      </div>

                      <Badge
                        className={`${
                          statusConfig[a.status].color
                        } ml-auto px-3 py-1`}
                      >
                        {statusConfig[a.status].label}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-healthcare-light" />
                      <span>{formatDate(a.dateISO)}</span>
                      <Clock className="w-4 h-4 text-healthcare-light ml-4" />
                      <span>
                        {formatTime(a.dateISO)} ({a.duration}h)
                      </span>
                    </div>

                    {a.emergency && (
                      <Badge className="bg-red-600 text-white">
                        EMERGÊNCIA
                      </Badge>
                    )}

                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-lg font-semibold">
                        R$ {Number(a.totalPrice || 0).toFixed(2)}
                      </span>

                      {/* ACTIONS */}
                      {a.status === "requested" && (
                        <div className="flex gap-2">
                          <Button
                            variant="healthcare"
                            size="sm"
                            onClick={() => updateStatus(a.id, "accepted")}
                            disabled={processingBookingIds.includes(a.id)}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Aceitar
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateStatus(a.id, "canceled")}
                            disabled={processingBookingIds.includes(a.id)}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Recusar
                          </Button>
                        </div>
                      )}

                      {a.status === "accepted" && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <a href={`tel:${a.familyPhone}`}>
                              <Phone className="w-4 h-4" />
                            </a>
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatus(a.id, "canceled")}
                            disabled={processingBookingIds.includes(a.id)}
                          >
                            Cancelar
                          </Button>
                        </div>
                      )}
                    </div>

                    {a.notes && (
                      <div className="p-3 rounded-xl bg-muted">
                        <p className="text-sm">
                          <strong>Observações:</strong> {a.notes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
