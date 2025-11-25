import { RatingStars } from "@/components/common/RatingStars";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import {
  Plus,
  Calendar,
  Clock,
  MapPin,
  Phone,
  MessageCircle,
  ChevronRight,
  AlertCircle,
  History,
  Star,
  XCircle,
  User,
  StickyNote,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button-variants";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookingCardSkeleton } from "@/components/common/LoadingSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { useToast } from "@/components/hooks/use-toast";
import type { Booking, BookingStatus } from "@/lib/types";
import { useAppStore } from "@/lib/stores/appStore";
import { api } from "@/lib/api/api";
import { Separator } from "@/components/ui/separator";

// ===== Types & Enums =====
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
  datetimeStart: string; // ISO
  datetimeEnd: string; // ISO
  status: AppointmentApiStatus;
  emergency: boolean | null;
  notes: string | null;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  hasReview?: boolean | null;
  elder?: {
    id: string;
    name: string | null;
    avatarPath?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    zipCode?: string | null;
  } | null;
  caregiver?: {
    id: string;
    avatarPath?: string | null;
    user?: {
      userProfile: Array<{ id: string; name: string | null }>;
    } | null;
  } | null;
};

// ========= Helpers =========

const REVIEWED_APPOINTMENTS_KEY = "dcare_reviewed_appointments";

function getReviewedAppointments(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(REVIEWED_APPOINTMENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function addReviewedAppointment(id: string) {
  if (typeof window === "undefined") return;
  const current = getReviewedAppointments();
  if (current.includes(id)) return;
  const updated = [...current, id];
  window.localStorage.setItem(
    REVIEWED_APPOINTMENTS_KEY,
    JSON.stringify(updated)
  );
}

// Config visual de status no front
const statusConfig = {
  requested: {
    label: "Aguardando",
    badgeStyle: "bg-amber-100 text-amber-700 border-amber-200",
    borderStyle: "border-amber-200",
    icon: Clock,
  },
  accepted: {
    label: "Confirmado",
    badgeStyle: "bg-emerald-100 text-emerald-700 border-emerald-200",
    borderStyle: "border-emerald-200",
    icon: Calendar,
  },
  completed: {
    label: "Concluído",
    badgeStyle: "bg-slate-100 text-slate-600 border-slate-200",
    borderStyle: "border-slate-200",
    icon: History,
  },
  canceled: {
    label: "Cancelado",
    badgeStyle: "bg-red-50 text-red-600 border-red-100",
    borderStyle: "border-red-100",
    icon: XCircle,
  },
  expired: {
    label: "Expirado",
    badgeStyle: "bg-neutral-100 text-neutral-500 border-neutral-200",
    borderStyle: "border-neutral-200",
    icon: AlertCircle,
  },
} as const;

function mapStatusFromApi(status: AppointmentApiStatus): BookingStatus {
  switch (status) {
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

function mapStatusToApi(status: BookingStatus): AppointmentApiStatus {
  switch (status) {
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

function calcDurationHours(startISO: string, endISO: string): number {
  const s = new Date(startISO).getTime();
  const e = new Date(endISO).getTime();
  const diff = Math.max(0, e - s);
  return Math.max(1, Math.round(diff / 3600000));
}

// ========= Component =========

export default function BookingList() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();
  const { currentUser } = useAppStore();

  // ⭐ Review States
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(0);
  const [reviewComment, setReviewComment] = useState<string>("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Logic Handlers ---
  const handleOpenReview = (booking: Booking) => {
    if (booking.hasReview) {
      toast({
        title: "Avaliação já registrada",
        description: "Você já avaliou esta reserva.",
        variant: "destructive",
      });
      return;
    }
    setReviewBooking(booking);
    setReviewRating(0);
    setReviewComment("");
  };

  const handleSubmitReview = async () => {
    if (!reviewBooking || reviewRating === 0) {
      toast({
        title: "Nota necessária",
        description: "Por favor, selecione de 1 a 5 estrelas.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmittingReview(true);
      await api.post(`/appointments/${reviewBooking.id}/review`, {
        caregiverId: reviewBooking.caregiverId,
        rating: reviewRating,
        comment: reviewComment || null,
      });

      addReviewedAppointment(reviewBooking.id);

      setBookings((prev) =>
        prev.map((b) => {
          if (b.id !== reviewBooking.id) return b;
          // Optimistic update
          if (!b.caregiver) return { ...b, hasReview: true };
          const { caregiver } = b;
          const newReviewCount = (caregiver.reviewCount || 0) + 1;
          const newRating =
            caregiver.rating && caregiver.reviewCount
              ? (caregiver.rating * caregiver.reviewCount + reviewRating) /
                newReviewCount
              : reviewRating;

          return {
            ...b,
            hasReview: true,
            caregiver: {
              ...caregiver,
              rating: newRating,
              reviewCount: newReviewCount,
            },
          };
        })
      );

      toast({
        title: "Obrigado!",
        description: "Sua avaliação foi registrada com sucesso.",
      });
      setReviewBooking(null);
      setReviewRating(0);
      setReviewComment("");
    } catch (error: any) {
      const message = error?.response?.data?.message || "";
      if (message.includes("Já existe")) {
        if (reviewBooking) addReviewedAppointment(reviewBooking.id);
        setBookings((prev) =>
          prev.map((b) =>
            b.id === reviewBooking?.id ? { ...b, hasReview: true } : b
          )
        );
        toast({
          title: "Já avaliado",
          description: "Esta avaliação já foi registrada.",
        });
        setReviewBooking(null);
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível salvar.",
          variant: "destructive",
        });
      }
    } finally {
      setSubmittingReview(false);
    }
  };

  const loadBookings = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const isFamily =
        currentUser.role === "FAMILY" || currentUser.role === "family";
      const derivedFamilyId =
        (currentUser as any)?.elders?.[0]?.familyId ??
        (currentUser as any)?.familyId ??
        currentUser.id;
      const queryParam = isFamily
        ? `familyId=${derivedFamilyId}`
        : `caregiverId=${
            (currentUser as any)?.caregiverProfile?.id ?? currentUser.id
          }`;

      const { data } = await api.get<AppointmentApi[]>(
        `appointments?${queryParam}`
      );
      const reviewedFromStorage = getReviewedAppointments();

      const mapped: Booking[] = data.map((a) => {
        const status = mapStatusFromApi(a.status);
        const duration = calcDurationHours(a.datetimeStart, a.datetimeEnd);
        const caregiverName =
          a.caregiver?.user?.userProfile?.[0]?.name ?? "Cuidador";
        const elderName = a.elder?.name ?? "Paciente";
        const hasReview =
          Boolean(a.hasReview) || reviewedFromStorage.includes(a.id);

        return {
          id: a.id,
          caregiverId: a.caregiverId ?? "",
          elderId: a.elderId ?? "",
          dateISO: a.datetimeStart,
          duration,
          status,
          emergency: Boolean(a.emergency),
          notes: a.notes ?? "",
          address: {
            street: a.elder?.address ?? "",
            city: a.elder?.city ?? "",
            state: a.elder?.state ?? "",
            zipCode: a.elder?.zipCode ?? "",
          },
          totalPrice: a.totalPrice ?? 0,
          createdAt: a.createdAt,
          updatedAt: a.updatedAt,
          completedAt: a.status === "COMPLETED" ? a.updatedAt : undefined,
          services: [],
          hasReview,
          caregiver: {
            id: a.caregiverId ?? "",
            name: caregiverName,
            photo: a.caregiver?.avatarPath ?? "",
            rating: 0,
            reviewCount: 0,
            phone: currentUser.phone ?? "",
          } as any,
          elder: {
            id: a.elderId ?? "",
            name: elderName,
            photo: a.elder?.avatarPath ?? null,
          } as any,
        };
      });
      mapped.sort(
        (a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime()
      );
      setBookings(mapped);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (
    bookingId: string,
    status: BookingStatus
  ) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (booking?.hasReview && status === "canceled") return;

    if (!window.confirm("Tem certeza que deseja cancelar este agendamento?")) {
      return;
    }

    try {
      const apiStatus = mapStatusToApi(status);
      await api.patch(`appointments/${bookingId}/status`, {
        status: apiStatus,
      });
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status } : b))
      );
      toast({
        title: "Sucesso",
        description: `Reserva cancelada com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao atualizar.",
        variant: "destructive",
      });
    }
  };

  // --- Filter Logic ---
  const getTabBookings = (tab: string) => {
    const now = Date.now();
    return bookings.filter((b) => {
      const start = new Date(b.dateISO).getTime();
      const end = start + b.duration * 60 * 60 * 1000;
      const isFuture = start > now;
      const isOngoing = start <= now && end >= now;
      const isPast = end < now;

      if (tab === "upcoming")
        return (
          (isFuture || isOngoing) &&
          b.status !== "canceled" &&
          b.status !== "completed"
        );
      if (tab === "completed")
        return b.status === "completed" || b.status === "canceled";
      return true; // all
    });
  };

  // --- Formatters ---
  const formatWeekday = (iso: string) =>
    new Date(iso).toLocaleDateString("pt-BR", { weekday: "long" });
  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  const getInitials = (n: string) =>
    n
      .split(" ")
      .slice(0, 2)
      .map((x) => x[0])
      .join("")
      .toUpperCase();

  // --- Render ---

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 pb-24 p-4 max-w-lg mx-auto">
        <div className="space-y-4 mt-6">
          <BookingCardSkeleton />
          <BookingCardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Minhas Reservas
            </h1>
          </div>
          <Link to="/search">
            <Button
              size="sm"
              className="bg-healthcare-dark hover:bg-healthcare-dark/90 rounded-full px-4"
            >
              <Plus className="w-4 h-4 mr-1" /> Nova
            </Button>
          </Link>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 pt-6 space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-3 bg-slate-200/50 p-1 rounded-xl h-auto">
            <TabsTrigger
              value="all"
              className="rounded-lg text-xs font-medium py-2 data-[state=active]:bg-white data-[state=active]:text-healthcare-dark data-[state=active]:shadow-sm transition-all"
            >
              Todas
            </TabsTrigger>
            <TabsTrigger
              value="upcoming"
              className="rounded-lg text-xs font-medium py-2 data-[state=active]:bg-white data-[state=active]:text-healthcare-dark data-[state=active]:shadow-sm transition-all"
            >
              Próximas
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="rounded-lg text-xs font-medium py-2 data-[state=active]:bg-white data-[state=active]:text-healthcare-dark data-[state=active]:shadow-sm transition-all"
            >
              Concluídas
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value={activeTab}
            className="space-y-4 mt-6 focus-visible:ring-0"
          >
            {getTabBookings(activeTab).length === 0 ? (
              <div className="py-10">
                <EmptyState
                  icon={Calendar}
                  title="Lista vazia"
                  description={
                    activeTab === "all"
                      ? "Você ainda não possui agendamentos."
                      : "Nenhuma reserva encontrada nesta categoria."
                  }
                  actionLabel={
                    activeTab === "all" ? "Buscar Profissional" : undefined
                  }
                  onAction={() => (window.location.href = "/search")}
                />
              </div>
            ) : (
              getTabBookings(activeTab).map((booking) => {
                const StatusIcon = statusConfig[booking.status]?.icon || Clock;
                const start = new Date(booking.dateISO).getTime();
                const end = start + booking.duration * 60 * 60 * 1000;
                const isPast = end < Date.now();
                const canReview =
                  ["accepted"].includes(booking.status) &&
                  isPast &&
                  !booking.hasReview;
                const canCancel =
                  ["requested", "accepted"].includes(booking.status) && !isPast;

                return (
                  <Card
                    key={booking.id}
                    className={`border shadow-sm hover:shadow-md transition-all overflow-hidden bg-white ${
                      statusConfig[booking.status].borderStyle
                    }`}
                  >
                    {/* Status Bar */}
                    <div
                      className={`h-1.5 w-full ${statusConfig[
                        booking.status
                      ].badgeStyle
                        .split(" ")[0]
                        .replace("bg-", "bg-")}`}
                    />

                    <CardContent className="p-0">
                      {/* Header Info */}
                      <div className="p-4 flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-12 h-12 border border-slate-100 shadow-sm">
                            <AvatarImage
                              src={booking.caregiver?.photo}
                              className="object-cover"
                            />
                            <AvatarFallback className="bg-slate-100 text-slate-500 font-bold">
                              {getInitials(
                                booking.caregiver?.name || "Cuidador"
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-slate-900 leading-tight">
                              {booking.caregiver?.name || "Cuidador"}
                            </h3>
                            {/* Elder Name RESTORED */}
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                              Cuidando de:{" "}
                              <span className="font-medium text-slate-700">
                                {booking.elder?.name || "Paciente"}
                              </span>
                            </p>

                            <div className="flex items-center gap-2 mt-2">
                              <Badge
                                variant="outline"
                                className={`text-[10px] font-medium px-2 py-0 h-5 rounded-full ${
                                  statusConfig[booking.status].badgeStyle
                                }`}
                              >
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {statusConfig[booking.status].label}
                              </Badge>
                              {booking.emergency && (
                                <Badge
                                  variant="destructive"
                                  className="text-[10px] px-2 h-5"
                                >
                                  Emergência
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="block text-sm font-bold text-slate-900">
                            R$ {Number(booking.totalPrice).toFixed(0)}
                          </span>
                        </div>
                      </div>

                      {/* Logistics Box */}
                      <div className="mx-4 bg-slate-50 rounded-lg p-3 border border-slate-100 flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                          <div className="min-w-[40px] text-center border-r border-slate-200 pr-3">
                            <span className="block text-xs text-slate-500 uppercase">
                              {new Date(booking.dateISO)
                                .toLocaleDateString("pt-BR", { month: "short" })
                                .replace(".", "")}
                            </span>
                            <span className="block text-lg font-bold text-slate-800 leading-none">
                              {new Date(booking.dateISO).getDate()}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center text-sm font-medium text-slate-700">
                              <Clock className="w-3.5 h-3.5 mr-1.5 text-healthcare-dark" />
                              {formatTime(booking.dateISO)}{" "}
                              <span className="text-slate-400 mx-1">•</span>{" "}
                              {booking.duration}h
                            </div>
                            <div className="text-xs text-slate-500 capitalize">
                              {formatWeekday(booking.dateISO)}
                            </div>
                          </div>
                        </div>

                        <Separator className="bg-slate-200/60" />

                        <div className="flex items-start gap-2 text-xs text-slate-600 pt-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                          <span className="line-clamp-1">
                            {[booking.address?.street, booking.address?.city]
                              .filter(Boolean)
                              .join(", ") || "Endereço não informado"}
                          </span>
                        </div>
                      </div>

                      {/* Observations / Notes RESTORED */}
                      {booking.notes && (
                        <div className="mx-4 mt-3 p-3 bg-amber-50/50 border border-amber-100/80 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <StickyNote className="w-3 h-3 text-amber-500" />
                            <span className="text-xs font-semibold text-amber-700">
                              Observações
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {booking.notes}
                          </p>
                        </div>
                      )}

                      {/* Actions Footer */}
                      <div className="p-4 flex items-center gap-2 mt-1">
                        {/* Active Booking Actions */}
                        {booking.status === "accepted" && !isPast && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 h-9 text-xs border-slate-200"
                            asChild
                          >
                            <a
                              href={`https://wa.me/${booking.caregiver?.phone}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Phone className="w-3.5 h-3.5 mr-2 text-slate-500" />
                              Whatsapp
                            </a>
                          </Button>
                        )}

                        {/* Cancel Option RESTORED & VISIBLE */}
                        {canCancel && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex-1 h-9 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-100"
                            onClick={() =>
                              handleStatusUpdate(booking.id, "canceled")
                            }
                          >
                            <XCircle className="w-3.5 h-3.5 mr-2" />
                            Cancelar
                          </Button>
                        )}

                        {/* Review Action */}
                        {canReview && (
                          <Button
                            className="flex-1 h-9 text-xs bg-healthcare-dark hover:bg-healthcare-dark/90 shadow-sm"
                            onClick={() => handleOpenReview(booking)}
                          >
                            <Star className="w-3.5 h-3.5 mr-2 fill-current" />
                            Avaliar
                          </Button>
                        )}

                        {/* Just Details (Cancelled state) */}
                        {booking.status === "canceled" && (
                          <div className="w-full text-center py-1 bg-red-50 rounded-md border border-red-100">
                            <span className="text-xs font-medium text-red-600">
                              Agendamento cancelado
                            </span>
                          </div>
                        )}

                        {/* Already Reviewed */}
                        {booking.hasReview && (
                          <div className="w-full flex items-center justify-center py-1 gap-1 text-amber-500 bg-amber-50 rounded-md border border-amber-100">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span className="text-xs font-medium">
                              Avaliado
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* --- Modal de Avaliação --- */}
      <Dialog
        open={!!reviewBooking}
        onOpenChange={(o) => !o && setReviewBooking(null)}
      >
        <DialogContent className="w-[90%] max-w-sm rounded-2xl p-6">
          <DialogHeader className="text-center">
            <DialogTitle className="text-lg">Avaliar Experiência</DialogTitle>
            <DialogDescription className="text-sm">
              Como foi o atendimento de <br />
              <span className="font-semibold text-slate-800">
                {reviewBooking?.caregiver?.name}
              </span>
              ?
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 flex flex-col items-center space-y-6">
            <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
              <AvatarImage src={reviewBooking?.caregiver?.photo} />
              <AvatarFallback className="text-2xl">
                {getInitials(reviewBooking?.caregiver?.name || "")}
              </AvatarFallback>
            </Avatar>

            <RatingStars
              rating={reviewRating}
              maxRating={5}
              size="lg"
              interactive
              onRatingChange={setReviewRating}
              showNumber={false}
            />

            <textarea
              className="w-full min-h-[100px] rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm focus:ring-2 focus:ring-healthcare-dark/20 focus:border-healthcare-dark outline-none resize-none"
              placeholder="Escreva um breve comentário..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
            />
          </div>

          <DialogFooter className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="w-full rounded-xl"
              onClick={() => setReviewBooking(null)}
            >
              Pular
            </Button>
            <Button
              className="w-full rounded-xl bg-healthcare-dark"
              onClick={handleSubmitReview}
              disabled={submittingReview || reviewRating === 0}
            >
              {submittingReview ? "Enviando..." : "Enviar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
