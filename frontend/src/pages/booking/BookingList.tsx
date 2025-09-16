
import { useState, useEffect } from 'react';
import { Plus, Calendar, Clock, MapPin, Phone, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button-variants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BookingCardSkeleton } from '@/components/common/LoadingSkeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { useToast } from '@/components/hooks/use-toast'
import { mockApi } from '@/lib/api/mock';
import type { Booking, BookingStatus } from '@/lib/types';
import { useAppStore } from '@/lib/stores/appStore';

const statusConfig = {
  requested: { 
    label: 'Solicitado', 
    color: 'bg-medical-warning text-neutral-900',
    description: 'Aguardando resposta do cuidador'
  },
  accepted: { 
    label: 'Aceito', 
    color: 'bg-medical-success text-white',
    description: 'Confirmado pelo cuidador'
  },
  'in-progress': { 
    label: 'Em Andamento', 
    color: 'bg-trust-blue text-white',
    description: 'Atendimento em curso'
  },
  completed: { 
    label: 'Concluído', 
    color: 'bg-neutral-600 text-white',
    description: 'Atendimento finalizado'
  },
  canceled: { 
    label: 'Cancelado', 
    color: 'bg-medical-critical text-white',
    description: 'Cancelado'
  },
  expired: { 
    label: 'Expirado', 
    color: 'bg-neutral-400 text-white',
    description: 'Prazo expirado'
  }
};

export default function BookingList() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();
  const { currentUser } = useAppStore();

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    if (!currentUser) return;
    
    try {
      const response = await mockApi.getBookings(currentUser.id);
      if (response.success && response.data) {
        setBookings(response.data);
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao carregar reservas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId: string, status: BookingStatus) => {
    try {
      const response = await mockApi.updateBookingStatus(bookingId, status);
      if (response.success) {
        setBookings(prev => prev.map(booking => 
          booking.id === bookingId ? { ...booking, status } : booking
        ));
        toast({
          title: "Sucesso",
          description: `Reserva ${status === 'canceled' ? 'cancelada' : 'atualizada'} com sucesso`,
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao atualizar reserva",
        variant: "destructive"
      });
    }
  };

  const filterBookings = (status?: BookingStatus) => {
    if (status) {
      return bookings.filter(booking => booking.status === status);
    }
    return bookings;
  };

  const getTabBookings = (tab: string) => {
    switch (tab) {
      case 'upcoming':
        return bookings.filter(b => ['requested', 'accepted'].includes(b.status));
      case 'active':
        return bookings.filter(b => b.status === 'in-progress');
      case 'completed':
        return bookings.filter(b => ['completed', 'canceled', 'expired'].includes(b.status));
      default:
        return bookings;
    }
  };

  const formatDate = (dateISO: string) => {
    return new Date(dateISO).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (dateISO: string) => {
    return new Date(dateISO).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
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
            <h1 className="text-2xl font-bold text-foreground">Minhas Reservas</h1>
            <p className="text-muted-foreground">
              {bookings.length} {bookings.length === 1 ? 'reserva' : 'reservas'}
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-muted rounded-2xl p-1">
            <TabsTrigger value="all" className="rounded-xl">Todas</TabsTrigger>
            <TabsTrigger value="upcoming" className="rounded-xl">Próximas</TabsTrigger>
            <TabsTrigger value="active" className="rounded-xl">Ativas</TabsTrigger>
            <TabsTrigger value="completed" className="rounded-xl">Finalizadas</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {getTabBookings(activeTab).length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="Nenhuma reserva encontrada"
                description={
                  activeTab === 'all' 
                    ? "Você ainda não tem reservas. Comece procurando um cuidador."
                    : `Não há reservas ${activeTab === 'upcoming' ? 'próximas' : activeTab === 'active' ? 'ativas' : 'finalizadas'}.`
                }
                actionLabel={activeTab === 'all' ? "Buscar Cuidador" : undefined}
                onAction={activeTab === 'all' ? () => window.location.href = '/search' : undefined}
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
                            {booking.caregiver?.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {booking.caregiver?.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Para {booking.elder?.name}
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
                      <span>{formatTime(booking.dateISO)} ({booking.duration}h)</span>
                    </div>

                    {/* Address */}
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-healthcare-light" />
                      <span className="text-muted-foreground">
                        {booking.address.street}, {booking.address.city}
                      </span>
                    </div>

                    {/* Services */}
                    <div className="flex flex-wrap gap-2">
                      {booking.services.map(service => (
                        <Badge 
                          key={service} 
                          variant="secondary" 
                          className="text-xs bg-healthcare-soft text-healthcare-dark"
                        >
                          {service}
                        </Badge>
                      ))}
                    </div>

                    {/* Emergency Badge */}
                    {booking.emergency && (
                      <Badge className="emergency-badge w-fit">
                        Emergência
                      </Badge>
                    )}

                    {/* Price */}
                    <div className="flex justify-between items-center pt-2 border-t border-border">
                      <span className="text-lg font-semibold text-foreground">
                        R$ {booking.totalPrice.toFixed(2)}
                      </span>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        {booking.status === 'accepted' && (
                          <>
                            <Button variant="outline" size="sm" asChild>
                              <a href={`tel:${booking.caregiver?.phone}`}>
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
                            onClick={() => handleStatusUpdate(booking.id, 'canceled')}
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