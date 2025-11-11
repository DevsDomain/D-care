import { useState, useEffect } from 'react';
import { Plus, Calendar, Clock, MapPin, Phone, MessageCircle } from 'lucide-react';
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
  datetimeEnd: string;   // ISO
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
  caregiver?: {
    id: string;
    avatarPath?: string | null;
    user?: {
      userProfile: Array<{ id: string; name: string | null }>;
    } | null;
  } | null;
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
    // se algum dia usar, dá pra mapear para ACCEPTED/CANCELLED, etc.
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

  useEffect(() => {
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadBookings = async () => {
    if (!currentUser) return;
    setLoading(true);

    try {
      const isFamily =
        currentUser.role === 'FAMILY' || currentUser.role === 'family';

      // familyId do banco = id da tabela "families".
      // você já usa elder.familyId, então derivamos daqui
      const derivedFamilyId =
        (currentUser as any)?.elders?.[0]?.familyId ??
        (currentUser as any)?.familyId ??
        currentUser.id;

      const queryParam = isFamily
        ? `familyId=${derivedFamilyId}`
        : `caregiverId=${(currentUser as any)?.caregiverProfile?.id ?? currentUser.id
        }`;

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
          // futuras que ainda não foram canceladas/finalizadas
          return (
            isFuture &&
            (isRequested || isAccepted)
          );

        case 'active':
          // acontecendo agora e efetivamente "ativas"
          return isOngoing && isAccepted;

        case 'completed':
          // tudo que já terminou OU foi cancelado
          return (
            isPast ||
            isCanceled ||
            isCompleted
          );

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
              getTabBookings(activeTab).map((booking) => (
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
                        className={`${statusConfig[booking.status].color
                          } text-xs font-medium`}
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

                      <div className="flex gap-2">
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

                        {['requested', 'accepted'].includes(booking.status) && (
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

                        {booking.status === 'completed' && (
                          <Button variant="healthcare" size="sm">
                            Avaliar
                          </Button>
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
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
