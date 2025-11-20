import { RatingStars } from '@/components/common/RatingStars'; // ajuste o path
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useState, useEffect } from 'react';
import {
  Plus,
  Calendar,
  Clock,
  MapPin,
  Phone,
  MessageCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button-variants';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BookingCardSkeleton } from '@/components/common/LoadingSkeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { useToast } from '@/components/hooks/use-toast';
import type { Booking, BookingStatus } from '@/lib/types';
import { useAppStore } from '@/lib/stores/appStore';
import { api } from '@/lib/api/api';

// ===== Resposta mínima do backend =====
type AppointmentApiStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'COMPLETED';

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
  elder?:
  | {
    id: string;
    name: string | null;
    avatarPath?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    zipCode?: string | null;
  }
  | null;
  caregiver?:
  | {
    id: string;
    avatarPath?: string | null;
    user?:
    | {
      userProfile: Array<{ id: string; name: string | null }>;
    }
    | null;
  }
  | null;
};

// Config visual de status no front
const statusConfig = {
  requested: {
    label: 'Solicitado',
    color: 'bg-medical-warning text-neutral-900',
    description: 'Aguardando resposta do cuidador',
  },
  accepted: {
    label: 'Aceito',
    color: 'bg-medical-success text-white',
    description: 'Confirmado pelo cuidador',
  },
  'in-progress': {
    label: 'Em Andamento',
    color: 'bg-trust-blue text-white',
    description: 'Atendimento em curso',
  },
  completed: {
    label: 'Concluído',
    color: 'bg-neutral-600 text-white',
    description: 'Atendimento finalizado',
  },
  canceled: {
    label: 'Cancelado',
    color: 'bg-medical-critical text-white',
    description: 'Cancelado',
  },
  expired: {
    label: 'Expirado',
    color: 'bg-neutral-400 text-white',
    description: 'Prazo expirado',
  },
};

// Map enum backend -> front
function mapStatusFromApi(status: AppointmentApiStatus): BookingStatus {
  switch (status) {
    case 'PENDING':
      return 'requested';
    case 'ACCEPTED':
      return 'accepted';
    case 'REJECTED':
    case 'CANCELLED':
      return 'canceled';
    case 'COMPLETED':
      return 'completed';
    default:
      return 'requested';
  }
}

// Map enum front -> backend (para PATCH)
function mapStatusToApi(status: BookingStatus): AppointmentApiStatus {
  switch (status) {
    case 'requested':
      return 'PENDING';
    case 'accepted':
      return 'ACCEPTED';
    case 'canceled':
      return 'CANCELLED';
    case 'completed':
      return 'COMPLETED';
    // 'in-progress' e 'expired' não temos no backend;
    default:
      return 'PENDING';
  }
}

// Duração (h) a partir de início/fim
function calcDurationHours(startISO: string, endISO: string): number {
  const s = new Date(startISO).getTime();
  const e = new Date(endISO).getTime();
  const diff = Math.max(0, e - s);
  return Math.max(1, Math.round(diff / 3600000));
}

export default function BookingList() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();
  const { currentUser } = useAppStore();

  // ⭐ estados da avaliação
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(0);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // abre o modal
  const handleOpenReview = (booking: Booking) => {
    if (booking.hasReview) {
      toast({
        title: 'Avaliação já registrada',
        description: 'Você já avaliou esta reserva. Não é possível avaliá-la novamente.',
        variant: 'destructive',
      });
      return;
    }

    setReviewBooking(booking);
    setReviewRating(0);
    setReviewComment('');
  };

  // envia avaliação
  const handleSubmitReview = async () => {
    if (!reviewBooking || reviewRating === 0) {
      toast({
        title: 'Ops',
        description: 'Escolha uma nota de 1 a 5 estrelas antes de salvar.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmittingReview(true);

      // ajuste essa rota/payload conforme sua API
      await api.post(`/appointments/${reviewBooking.id}/review`, {
        caregiverId: reviewBooking.caregiverId,
        rating: reviewRating,
        comment: reviewComment || null,
      });

      setBookings((prev) =>
        prev.map((b) => {
          if (b.id !== reviewBooking.id) return b;

          // se não tiver caregiver (por alguma razão), só marca como avaliado
          if (!b.caregiver) {
            return { ...b, hasReview: true };
          }

          const { caregiver } = b;
          const newReviewCount = (caregiver.reviewCount || 0) + 1;
          const newRating =
            caregiver.rating && caregiver.reviewCount
              ? (caregiver.rating * caregiver.reviewCount + reviewRating) /
              newReviewCount
              : reviewRating;

          return {
            ...b,
            hasReview: true, // 👈 chave da lógica
            caregiver: {
              ...caregiver,
              rating: newRating,
              reviewCount: newReviewCount,
            },
          };
        }),
      );


      toast({
        title: 'Obrigado!',
        description: 'Sua avaliação foi registrada com sucesso.',
      });

      setReviewBooking(null);
      setReviewRating(0);
      setReviewComment('');
    } catch (error) {
      console.error(error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar sua avaliação.',
        variant: 'destructive',
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  const loadBookings = async () => {
    if (!currentUser) return;
    setLoading(true);

    try {
      const isFamily =
        currentUser.role === 'FAMILY' || currentUser.role === 'family';

      const derivedFamilyId =
        (currentUser as any)?.elders?.[0]?.familyId ??
        (currentUser as any)?.familyId ??
        currentUser.id;

      const queryParam = isFamily
        ? `familyId=${derivedFamilyId}`
        : `caregiverId=${(currentUser as any)?.caregiverProfile?.id ?? currentUser.id}`;

      const { data } = await api.get<AppointmentApi[]>(
        `appointments?${queryParam}`,
      );

      const mapped: Booking[] = data.map((a) => {
        const status = mapStatusFromApi(a.status);
        const duration = calcDurationHours(a.datetimeStart, a.datetimeEnd);

        const caregiverName =
          a.caregiver?.user?.userProfile?.[0]?.name ?? 'Cuidador';
        const caregiverPhoto = a.caregiver?.avatarPath ?? undefined;

        const elderName = a.elder?.name ?? 'Paciente';
        const elderPhoto = a.elder?.avatarPath ?? undefined;

        return {
          id: a.id,
          caregiverId: a.caregiverId ?? '',
          elderId: a.elderId ?? '',
          dateISO: a.datetimeStart,
          duration,
          status,
          emergency: Boolean(a.emergency),
          notes: a.notes ?? '',
          address: {
            street: a.elder?.address ?? '',
            city: a.elder?.city ?? '',
            state: a.elder?.state ?? '',
            zipCode: a.elder?.zipCode ?? '',
          },
          totalPrice: a.totalPrice ?? 0,
          createdAt: a.createdAt,
          updatedAt: a.updatedAt,
          completedAt: a.status === 'COMPLETED' ? a.updatedAt : undefined,
          services: [],
          hasReview: Boolean(a.hasReview),

          caregiver:
            caregiverPhoto || caregiverName
              ? ({
                id: a.caregiverId ?? '',
                userId: '',
                name: caregiverName,
                photo: caregiverPhoto || '',
                verified: false,
                address: '',
                city: '',
                state: '',
                zipCode: '',
                avatarPath: null,
                rating: 0,
                reviewCount: 0,
                distanceKm: 0,
                skills: [],
                experience: '',
                price_range: '',
                emergency: false,
                availability: true,
                bio: '',
                phone: '',
                languages: [],
                specializations: [],
                verificationBadges: [],
              } as any)
              : undefined,

          elder:
            elderPhoto || elderName
              ? ({
                id: a.elderId ?? '',
                name: elderName,
                birthDate: new Date(a.datetimeStart),
                familyId: a.familyId ?? '',
                photo: elderPhoto || undefined,
                avatarFile: null,
                conditions: [],
                medications: [],
                address: {
                  street: a.elder?.address ?? '',
                  city: a.elder?.city ?? '',
                  state: a.elder?.state ?? '',
                  zipCode: a.elder?.zipCode ?? '',
                  number: '',
                },
                preferences: {},
                createdAt: a.createdAt,
              } as any)
              : undefined,
        };
      });

      // 👇 agora só os dados reais da API
      setBookings(mapped);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Erro',
        description: 'Falha ao carregar reservas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  // ✅ Atualiza status usando o PATCH real no backend
  const handleStatusUpdate = async (
    bookingId: string,
    status: BookingStatus,
  ) => {
    try {
      const apiStatus = mapStatusToApi(status);

      await api.patch(`appointments/${bookingId}/status`, {
        status: apiStatus,
      });

      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status } : b)),
      );

      toast({
        title: 'Sucesso',
        description: `Reserva ${status === 'canceled' ? 'cancelada' : 'atualizada'
          } com sucesso`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Erro',
        description: 'Falha ao atualizar reserva',
        variant: 'destructive',
      });
    }
  };

  // 🔎 Abas por DATA (próximas, em andamento, finalizadas)
  const getTabBookings = (tab: string) => {
    const now = Date.now();

    return bookings.filter((b) => {
      const start = new Date(b.dateISO).getTime();
      const end = start + b.duration * 60 * 60 * 1000;

      const isFuture = start > now;
      const isOngoing = start <= now && end >= now;
      const isPast = end < now;

      const isCanceled = b.status === 'canceled';
      const isCompleted = b.status === 'completed';
      const isAccepted =
        b.status === 'accepted' || b.status === 'in-progress';
      const isRequested = b.status === 'requested';

      switch (tab) {
        case 'upcoming':
          return isFuture && (isRequested || isAccepted);

        case 'active':
          return isOngoing && isAccepted;

        case 'completed':
          // tudo que já terminou OU foi cancelado
          return isPast || isCanceled || isCompleted;

        default: // 'all'
          return true;
      }
    });
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });

  const getCaregiverName = (b: Booking) => b.caregiver?.name || 'Cuidador';
  const getElderName = (b: Booking) => b.elder?.name || 'Paciente';
  const getCaregiverInitials = (b: Booking) => {
    const n = getCaregiverName(b);
    const i = n
      .split(' ')
      .filter(Boolean)
      .map((x) => x[0])
      .join('');
    return i || 'C';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="p-4">
          <BookingCardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Minhas Reservas
            </h1>
            <p className="text-muted-foreground">
              {bookings.length}{' '}
              {bookings.length === 1 ? 'reserva' : 'reservas'}
            </p>
          </div>
          <Link to="/search">
            <Button variant="healthcare" size="icon">
              <Plus className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="p-4">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4 bg-muted rounded-2xl p-1">
            <TabsTrigger value="all" className="rounded-xl">
              Todas
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="rounded-xl">
              Próximas
            </TabsTrigger>
            <TabsTrigger value="active" className="rounded-xl">
              Ativas
            </TabsTrigger>
            <TabsTrigger value="completed" className="rounded-xl">
              Finalizadas
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {getTabBookings(activeTab).length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="Nenhuma reserva encontrada"
                description={
                  activeTab === 'all'
                    ? 'Você ainda não tem reservas. Comece procurando um cuidador.'
                    : `Não há reservas ${activeTab === 'upcoming'
                      ? 'próximas'
                      : activeTab === 'active'
                        ? 'ativas'
                        : 'finalizadas'
                    }.`
                }
                actionLabel={activeTab === 'all' ? 'Buscar Cuidador' : undefined}
                onAction={
                  activeTab === 'all'
                    ? () => (window.location.href = '/search')
                    : undefined
                }
              />
            ) : (
              getTabBookings(activeTab).map((booking) => {
                // ⏰ cálculo se essa reserva já terminou
                const start = new Date(booking.dateISO).getTime();
                const end = start + booking.duration * 60 * 60 * 1000;
                const now = Date.now();
                const isPast = end < now;

                // pode avaliar se está ACEITA e já passou
                const canReview =
                  booking.status === 'accepted' && isPast && !booking.hasReview;
                return (
                  <Card key={booking.id} className="healthcare-card">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={booking.caregiver?.photo} />
                            <AvatarFallback>
                              {getCaregiverInitials(booking)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-foreground">
                              {getCaregiverName(booking)}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Para {getElderName(booking)}
                            </p>
                          </div>
                        </div>
                        <Badge
                          className={`${statusConfig[booking.status].color} text-xs font-medium`}
                        >
                          {statusConfig[booking.status].label}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Date & Time */}
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-healthcare-light" />
                        <span>{formatDate(booking.dateISO)}</span>
                        <Clock className="w-4 h-4 text-healthcare-light ml-4" />
                        <span>
                          {formatTime(booking.dateISO)} ({booking.duration}h)
                        </span>
                      </div>

                      {/* Address */}
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-healthcare-light" />
                        <span className="text-muted-foreground">
                          {[booking.address?.street, booking.address?.city]
                            .filter(Boolean)
                            .join(', ')}
                        </span>
                      </div>

                      {/* Services */}
                      {Array.isArray(booking.services) &&
                        booking.services.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {booking.services.map((service) => (
                              <Badge
                                key={service}
                                variant="secondary"
                                className="text-xs bg-healthcare-soft text-healthcare-dark"
                              >
                                {service}
                              </Badge>
                            ))}
                          </div>
                        )}

                      {/* Emergency Badge */}
                      {booking.emergency && (
                        <Badge className="emergency-badge w-fit">
                          Emergência
                        </Badge>
                      )}

                      {/* Price + Actions */}
                      <div className="flex justify-between items-center pt-2 border-t border-border">
                        <span className="text-lg font-semibold text-foreground">
                          R$ {Number(booking.totalPrice || 0).toFixed(2)}
                        </span>

                        <div className="flex gap-2 items-center">
                          {booking.status === 'accepted' && (
                            <>
                              <Button variant="outline" size="sm" asChild>
                                <a href={`tel:${booking.caregiver?.phone ?? ''}`}>
                                  <Phone className="w-4 h-4" />
                                </a>
                              </Button>
                              <Button variant="outline" size="sm">
                                <MessageCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}

                          {['requested', 'accepted'].includes(booking.status) &&
                            !booking.hasReview && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleStatusUpdate(booking.id, 'canceled')
                                }
                              >
                                Cancelar
                              </Button>
                            )}

                          {canReview && (
                            <Button
                              variant="healthcare"
                              size="sm"
                              onClick={() => handleOpenReview(booking)}
                            >
                              Avaliar
                            </Button>
                          )}

                          {booking.hasReview && (
                            <span className="text-xs text-muted-foreground">
                              Você já avaliou esta reserva.
                            </span>
                          )}
                        </div>
                      </div>


                      {/* Notes */}
                      {booking.notes && (
                        <div className="p-3 rounded-xl bg-muted">
                          <p className="text-sm text-muted-foreground">
                            <strong>Observações:</strong> {booking.notes}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal de avaliação ⭐ */}
      <Dialog
        open={!!reviewBooking}
        onOpenChange={(open) => {
          if (!open) {
            setReviewBooking(null);
            setReviewRating(0);
            setReviewComment('');
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Avaliar cuidador</DialogTitle>
            <DialogDescription>
              Como foi a experiência com{' '}
              <strong>
                {reviewBooking?.caregiver?.name ?? 'o cuidador'}
              </strong>
              ?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex flex-col items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Selecione de 1 a 5 estrelas:
              </span>

              <RatingStars
                rating={reviewRating}
                maxRating={5}
                size="lg"
                showNumber={false}
                interactive
                onRatingChange={setReviewRating}
              />

              {reviewRating > 0 && (
                <span className="text-xs text-muted-foreground">
                  Você escolheu {reviewRating} estrela
                  {reviewRating > 1 ? 's' : ''}.
                </span>
              )}
            </div>

            <div className="space-y-1 w-full">
              <label className="text-sm font-medium text-foreground">
                Comentário (opcional)
              </label>
              <textarea
                className="w-full min-h-[80px] rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-healthcare-light"
                placeholder="Conte brevemente como foi o atendimento..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setReviewBooking(null);
                setReviewRating(0);
                setReviewComment('');
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="healthcare"
              onClick={handleSubmitReview}
              disabled={submittingReview}
            >
              {submittingReview ? 'Salvando...' : 'Salvar avaliação'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
