import { useState, useEffect } from "react";
import {
  Clock,
  MapPin,
  Phone,
  Star,
  AlertCircle,
  Activity,
  Power,
  ClipboardList,
  CalendarCheck,
  History,
  Wallet,
  UserRoundPen,
} from "lucide-react";
import { Button } from "@/components/ui/button-variants"; // Using your custom variants
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CaregiverCardSkeleton } from "@/components/common/LoadingSkeleton";
import { useToast } from "@/components/hooks/use-toast";
import type { Caregiver } from "@/lib/types";
import { useAppStore } from "@/lib/stores/appStore";
import { useNavigate } from "react-router-dom";
import {
  fetchCaregiverProfile,
  toggleCaregiverAvailability,
  toggleCaregiverEmergencyAvailability,
} from "@/lib/api/caregiver";
import { api } from "@/lib/api/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/* ===========================
   Types & Maps
   =========================== */
type BookingStatus = "requested" | "accepted" | "canceled" | "completed";

function mapStatus(apiStatus: string): BookingStatus {
  const map: Record<string, BookingStatus> = {
    PENDING: "requested",
    ACCEPTED: "accepted",
    REJECTED: "canceled",
    CANCELLED: "canceled",
    COMPLETED: "completed",
  };
  return map[apiStatus] || "requested";
}

function mapApiStatus(status: BookingStatus) {
  const map: Record<string, string> = {
    requested: "PENDING",
    accepted: "ACCEPTED",
    canceled: "CANCELLED",
    completed: "COMPLETED",
  };
  return map[status] || "PENDING";
}

function calcDuration(start: string, end: string) {
  return Math.max(
    1,
    Math.round((new Date(end).getTime() - new Date(start).getTime()) / 3600000)
  );
}

export default function CaregiverDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser } = useAppStore();

  const [caregiver, setCaregiver] = useState<Partial<Caregiver>>({});
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Availability State
  const [isAvailable, setIsAvailable] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);

  // UI State
  const [tab, setTab] = useState<"requests" | "accepted" | "history">(
    "requests"
  );
  const [processingIds, setProcessingIds] = useState<string[]>([]);

  // --- Data Loading ---
  useEffect(() => {
    if (currentUser?.role !== "CAREGIVER" || !currentUser.id) return;

    const init = async () => {
      try {
        const profile = await fetchCaregiverProfile(currentUser.id);
        if (!profile) return;

        setCaregiver(profile);
        setIsAvailable(!!profile.availability);
        setIsEmergency(!!profile.emergency);

        if (profile.userId) {
          loadAppointments(profile.userId);
        }
      } catch (e) {
        console.error(e);
      }
    };
    init();
  }, [currentUser]);

  const loadAppointments = async (caregiverUserId: string) => {
    try {
      setLoading(true);
      const { data } = await api.get(
        `appointments?caregiverId=${caregiverUserId}`
      );

      const mapped = data.map((a: any) => ({
        id: a.id,
        elderName: a.elder?.name ?? "Paciente",
        elderPhoto: a.elder?.avatarPath,
        familyPhone: a.family?.user?.userProfile?.[0]?.phone,
        dateISO: a.datetimeStart,
        duration: calcDuration(a.datetimeStart, a.datetimeEnd),
        status: mapStatus(a.status),
        emergency: Boolean(a.emergency),
        totalPrice: a.totalPrice ?? 0,
        notes: a.notes,
        ivcfResult: a.latestResponse?.result,
        ivcfScore: a.latestResponse?.score, // Getting the score as well
        city: a.elder?.city || "Endereço não informado",
      }));

      // Sort: Newest first
      mapped.sort(
        (a: any, b: any) =>
          new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime()
      );

      setAppointments(mapped);
    } finally {
      setLoading(false);
    }
  };

  // --- Actions ---
  const handleStatusChange = async (id: string, status: BookingStatus) => {
    setProcessingIds((prev) => [...prev, id]);
    try {
      await api.patch(`appointments/${id}/status`, {
        status: mapApiStatus(status),
      });

      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a))
      );
      toast({
        title: "Atualizado",
        description: "Status da reserva alterado.",
      });

      if (status === "accepted") setTab("accepted");
    } catch (e) {
      toast({ title: "Erro", variant: "destructive" });
    } finally {
      setProcessingIds((prev) => prev.filter((x) => x !== id));
    }
  };

  const toggleStatus = async (type: "availability" | "emergency") => {
    if (!caregiver.userId) return;
    try {
      if (type === "availability") {
        await toggleCaregiverAvailability(caregiver.userId, !isAvailable);
        setIsAvailable(!isAvailable);
      } else {
        await toggleCaregiverEmergencyAvailability(
          caregiver.userId,
          !isEmergency
        );
        setIsEmergency(!isEmergency);
      }
    } catch (e) {
      toast({ title: "Erro ao atualizar status", variant: "destructive" });
    }
  };

  // --- Stats Calculation ---
  // --- Stats Calculation ---
  const stats = {
    rating: caregiver.rating?.toFixed(1) || "5.0",

    completedMonth: appointments.filter((a) => {
      const d = new Date(a.dateISO);
      const n = new Date();
      return (
        d.getMonth() === n.getMonth() &&
        d.getFullYear() === n.getFullYear() &&
        a.status === "completed"
      );
    }).length,

    // New Metric: Earnings this month
    earningsMonth: appointments
      .filter((a) => {
        const d = new Date(a.dateISO);
        const n = new Date();
        return (
          d.getMonth() === n.getMonth() &&
          d.getFullYear() === n.getFullYear() &&
          a.status === "completed"
        );
      })
      .reduce((sum, current) => sum + (Number(current.totalPrice) || 0), 0),

    pending: appointments.filter((a) => a.status === "requested").length,
  };

  // --- Filter ---
  const filtered = appointments.filter((a) => {
    if (tab === "requests") return a.status === "requested";
    if (tab === "accepted") return a.status === "accepted";
    return ["completed", "canceled"].includes(a.status);
  });

  // --- Formatters ---
  const getDay = (iso: string) => new Date(iso).getDate();
  const getMonth = (iso: string) =>
    new Date(iso)
      .toLocaleDateString("pt-BR", { month: "short" })
      .toUpperCase()
      .replace(".", "");
  const getTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

  if (loading)
    return (
      <div className="p-4 space-y-4">
        <CaregiverCardSkeleton />
        <CaregiverCardSkeleton />
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24">
      {/* Header Section */}
      <header className="bg-white pt-6 pb-6 px-4 sticky top-0 z-20 shadow-sm border-b border-slate-100 rounded-b-3xl">
        <div className="max-w-lg mx-auto">
          {/* Profile Row */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <Avatar className="w-14 h-14 border-2 border-slate-100">
                <AvatarImage src={(caregiver as any)?.avatarUrl} />
                <AvatarFallback>{currentUser?.name?.[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-md text-slate-500 font-medium">
                  Bem-vindo(a),
                </p>
                <h1 className="text-xl font-bold text-slate-900 leading-none">
                  {currentUser?.name}
                </h1>
              </div>
            </div>
            <Button
              variant="trust"
              size="icon-sm"
              onClick={() => navigate("/editCaregiver")}
            >
              <UserRoundPen className="w-6 h-6 text-white" />
            </Button>
          </div>

          {/* Metrics / Stats Row */}
          {/* Metrics / Stats Row */}
          {/* Metrics / Stats Row */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {/* 1. Rating */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center flex flex-col items-center justify-center">
              <div className="flex items-center gap-1 text-amber-500 mb-1">
                <Star className="w-4 h-4 fill-current" />
              </div>
              <span className="text-lg font-bold text-slate-800 leading-none">
                {stats.rating}
              </span>
              <span className="text-xs text-slate-400 font-medium mt-1">
                Avaliação
              </span>
            </div>

            {/* 2. New Metric: Earnings */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center flex flex-col items-center justify-center">
              <div className="flex items-center gap-1 text-emerald-600 mb-1">
                <Wallet className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-slate-800 leading-none">
                R${" "}
                {stats.earningsMonth.toLocaleString("pt-BR", {
                  minimumFractionDigits: 0,
                })}
              </span>
              <span className="text-xs text-slate-400 font-medium mt-1">
                Ganhos (Mês)
              </span>
            </div>

            {/* 3. Completed Count */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center flex flex-col items-center justify-center">
              <div className="flex items-center gap-1 text-blue-600 mb-1">
                <CalendarCheck className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-slate-800 leading-none">
                {stats.completedMonth}
              </span>
              <span className="text-xs text-slate-400 font-medium mt-1">
                Finalizados (Mês)
              </span>
            </div>

            {/* 4. Pending */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center flex flex-col items-center justify-center">
              <div className="flex items-center gap-1 text-slate-500 mb-1">
                <ClipboardList className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-slate-800 leading-none">
                {stats.pending}
              </span>
              <span className="text-xs text-slate-400 font-medium mt-1">
                Pendentes
              </span>
            </div>
          </div>

          {/* Status Toggles */}
          <div className="flex gap-3">
            <button
              onClick={() => toggleStatus("availability")}
              className={`
                      flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold transition-all border
                      ${
                        isAvailable
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm"
                          : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                      }
                  `}
            >
              <div
                className={`w-2 h-2 rounded-full transition-colors ${
                  isAvailable ? "bg-emerald-500" : "bg-slate-300"
                }`}
              />
              {isAvailable ? "Disponível" : "Indisponível"}
            </button>

            <button
              onClick={() => toggleStatus("emergency")}
              className={`
                      flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold transition-all border
                      ${
                        isEmergency
                          ? "bg-rose-50 border-rose-200 text-rose-700 shadow-sm"
                          : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                      }
                  `}
            >
              <Power
                className={`w-3.5 h-3.5 ${
                  isEmergency ? "text-rose-500" : "text-slate-400"
                }`}
              />
              Plantão {isEmergency ? "ON" : "OFF"}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-6 space-y-6">
        <Tabs
          value={tab}
          onValueChange={(v: any) => setTab(v)}
          className="w-full"
        >
          <TabsList className="w-full grid grid-cols-3 bg-slate-200/50 p-1 rounded-xl mb-6">
            <TabsTrigger value="requests" className="text-xs py-2 rounded-lg">
              Novos ({stats.pending})
            </TabsTrigger>
            <TabsTrigger value="accepted" className="text-xs py-2 rounded-lg">
              Agenda
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs py-2 rounded-lg">
              Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value={tab} className="space-y-3 focus-visible:ring-0">
            {filtered.length === 0 ? (
              <div className="text-center py-10 opacity-50">
                <History className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-medium text-slate-500">
                  Nenhum agendamento nesta lista
                </p>
              </div>
            ) : (
              filtered.map((item) => (
                <Card
                  key={item.id}
                  className="border-none shadow-sm ring-1 ring-slate-100 overflow-hidden"
                >
                  <CardContent className="p-0 flex">
                    {/* Left Column: Date Ticket */}
                    <div className="w-16 bg-slate-50 border-r border-slate-100 flex flex-col items-center justify-center py-4 shrink-0">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {getMonth(item.dateISO)}
                      </span>
                      <span className="text-2xl font-bold text-slate-800 leading-none mt-0.5">
                        {getDay(item.dateISO)}
                      </span>
                    </div>

                    {/* Right Column: Content */}
                    <div className="flex-1 flex flex-col">
                      {/* Top Row: Time & Price */}
                      <div className="p-3 pb-2 flex justify-between items-start border-b border-slate-50">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                          <Clock className="w-4 h-4 text-healthcare-dark" />
                          {getTime(item.dateISO)}{" "}
                          <span className="text-slate-300 font-light">|</span>{" "}
                          {item.duration}h
                        </div>
                        <span className="font-bold text-slate-900 text-sm">
                          R$ {Math.floor(item.totalPrice)}
                        </span>
                      </div>

                      <div className="p-3 flex flex-col gap-3">
                        {/* Patient Info */}
                        <div className="flex items-start gap-3">
                          <Avatar className="w-11 h-11 border border-slate-100 shrink-0">
                            <AvatarImage src={item.elderPhoto} />
                            <AvatarFallback className="bg-slate-100 text-slate-500">
                              {item.elderName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0 flex flex-col justify-center h-11">
                            <h4 className="text-sm font-bold text-slate-800 truncate leading-tight">
                              {item.elderName}
                            </h4>
                            <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                              <MapPin className="w-3 h-3 shrink-0" />
                              <span className="truncate">{item.city}</span>
                            </div>
                          </div>
                        </div>

                        {/* IVCF-20 & Emergency Alerts Block */}
                        {(item.ivcfResult || item.emergency) && (
                          <div className="flex flex-col gap-2">
                            {/* IVCF-20 Explicit Info */}
                            {item.ivcfResult && (
                              <div className="bg-blue-50/60 border border-blue-100 rounded-lg p-2.5">
                                <div className="flex items-center gap-1.5 mb-1">
                                  <Activity className="w-3.5 h-3.5 text-blue-600" />
                                  <span className="text-[10px] font-bold  text-blue-600 tracking-wide">
                                    Índice de vulnerabilidade clínico funcional
                                  </span>
                                </div>
                                <div className="flex items-baseline gap-2 pl-0.5">
                                  <span className="text-xs font-semibold text-slate-700">
                                    {item.ivcfResult}
                                  </span>
                                  {item.ivcfScore !== undefined && (
                                    <span className="text-[10px] text-slate-500">
                                      ({item.ivcfScore} pontos)
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Emergency Badge */}
                            {item.emergency && (
                              <div className="bg-red-50 border border-red-100 rounded-lg px-2.5 py-2 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                                <span className="text-xs font-bold text-red-700">
                                  EMERGÊNCIA MÉDICA
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Notes */}
                        {item.notes && (
                          <p className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded border border-slate-100">
                            "Obs: {item.notes}"
                          </p>
                        )}

                        {/* Actions Grid */}
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          {item.status === "requested" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 w-full text-xs text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100"
                                onClick={() =>
                                  handleStatusChange(item.id, "canceled")
                                }
                                disabled={processingIds.includes(item.id)}
                              >
                                Recusar
                              </Button>
                              <Button
                                variant="healthcare" // Blue variant per request
                                size="sm"
                                className="h-9 w-full text-xs shadow-sm"
                                onClick={() =>
                                  handleStatusChange(item.id, "accepted")
                                }
                                disabled={processingIds.includes(item.id)}
                              >
                                Aceitar
                              </Button>
                            </>
                          )}

                          {item.status === "accepted" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 w-full text-xs text-slate-500 hover:text-red-600"
                                onClick={() =>
                                  handleStatusChange(item.id, "canceled")
                                }
                              >
                                Cancelar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-9 w-full text-xs border-slate-200"
                                asChild
                              >
                                <a
                                  href={`https://wa.me/${item.familyPhone}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Phone className="w-3 h-3 mr-2" /> WhatsApp
                                </a>
                              </Button>
                            </>
                          )}

                          {item.status === "canceled" && (
                            <div className="col-span-2 text-center text-xs font-medium text-red-500 bg-red-50 py-2 rounded-md border border-red-100">
                              Cancelado
                            </div>
                          )}
                          {item.status === "completed" && (
                            <div className="col-span-2 text-center text-xs font-medium text-slate-500 bg-slate-100 py-2 rounded-md border border-slate-200">
                              Atendimento Finalizado
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
