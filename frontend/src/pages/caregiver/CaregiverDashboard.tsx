import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Settings,
  Bell,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button-variants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CaregiverCardSkeleton } from "@/components/common/LoadingSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { useToast } from "@/components/hooks/use-toast";
import { mockApi } from "@/lib/api/mock";
import type { Booking } from "@/lib/types";
import { useAppStore } from "@/lib/stores/appStore";

export default function CaregiverDashboard() {
  const [bookingRequests, setBookingRequests] = useState<Booking[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [emergencyAvailable, setEmergencyAvailable] = useState(true);
  const [activeToday, setActiveToday] = useState(true);
  const { toast } = useToast();
  const { currentUser } = useAppStore();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    if (!currentUser) return;

    try {
      // Mock data for caregiver dashboard
      const mockRequests: Booking[] = [
        {
          id: "3",
          caregiverId: currentUser.id,
          elderId: "1",
          dateISO: "2024-09-10T14:00:00Z",
          duration: 4,
          status: "requested",
          emergency: false,
          notes: "Cuidados regulares da tarde, administração de medicamentos",
          address: {
            street: "Rua das Flores, 123",
            city: "São Paulo",
            state: "SP",
            zipCode: "01234-567",
          },
          totalPrice: 140,
          services: ["Personal Care", "Medication Management"],
          createdAt: "2024-09-08T10:00:00Z",
          updatedAt: "2024-09-08T10:00:00Z",
          elder: {
            id: "1",
            name: "José da Silva",
            age: 78,
            conditions: ["Diabetes", "Hypertension"],
            medications: ["Metformin", "Losartan"],
            emergencyContact: {
              name: "Maria da Silva",
              phone: "+55 11 98888-0001",
              relation: "Daughter",
            },
            address: {
              street: "Rua das Flores, 123",
              city: "São Paulo",
              state: "SP",
              zipCode: "01234-567",
            },
            preferences: {
              gender: "female",
              language: ["Portuguese"],
            },
            createdAt: "2024-01-15T10:00:00Z",
          },
        },
      ];

      const mockUpcoming: Booking[] = [
        {
          id: "4",
          caregiverId: currentUser.id,
          elderId: "1",
          dateISO: "2024-09-11T09:00:00Z",
          duration: 3,
          status: "accepted",
          emergency: false,
          address: {
            street: "Rua das Flores, 123",
            city: "São Paulo",
            state: "SP",
            zipCode: "01234-567",
          },
          totalPrice: 105,
          services: ["Companionship", "Light Housekeeping"],
          createdAt: "2024-09-07T15:00:00Z",
          updatedAt: "2024-09-08T09:00:00Z",
          elder: {
            id: "1",
            name: "José da Silva",
            age: 78,
            conditions: ["Diabetes"],
            medications: ["Metformin"],
            emergencyContact: {
              name: "Maria da Silva",
              phone: "+55 11 98888-0001",
              relation: "Daughter",
            },
            address: {
              street: "Rua das Flores, 123",
              city: "São Paulo",
              state: "SP",
              zipCode: "01234-567",
            },
            preferences: {},
            createdAt: "2024-01-15T10:00:00Z",
          },
        },
      ];

      setBookingRequests(mockRequests);
      setUpcomingBookings(mockUpcoming);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao carregar dados do painel",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBookingResponse = async (
    bookingId: string,
    action: "accept" | "decline"
  ) => {
    try {
      const status = action === "accept" ? "accepted" : "canceled";
      const response = await mockApi.updateBookingStatus(bookingId, status);

      if (response.success) {
        setBookingRequests((prev) => prev.filter((b) => b.id !== bookingId));

        if (action === "accept") {
          const acceptedBooking = bookingRequests.find(
            (b) => b.id === bookingId
          );
          if (acceptedBooking) {
            setUpcomingBookings((prev) => [
              ...prev,
              { ...acceptedBooking, status: "accepted" },
            ]);
          }
        }

        toast({
          title: "Sucesso",
          description: `Solicitação ${
            action === "accept" ? "aceita" : "recusada"
          } com sucesso`,
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao processar solicitação",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateISO: string) => {
    return new Date(dateISO).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="p-4">
          <CaregiverCardSkeleton  />
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
              Painel do Cuidador
            </h1>
            <p className="text-muted-foreground">
              Bem-vindo de volta, {currentUser?.name}
            </p>
          </div>
          <Button variant="outline" size="icon">
            <Settings className="w-5 h-5" />
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
            <Switch checked={activeToday} onCheckedChange={setActiveToday} />
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
              checked={emergencyAvailable}
              onCheckedChange={setEmergencyAvailable}
            />
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="text-center">
            <CardContent className="pt-6">
              <TrendingUp className="w-8 h-8 text-medical-success mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">4.9</p>
              <p className="text-xs text-muted-foreground">Avaliação</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <Calendar className="w-8 h-8 text-healthcare-light mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">12</p>
              <p className="text-xs text-muted-foreground">Este mês</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <Bell className="w-8 h-8 text-medical-warning mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">
                {bookingRequests.length}
              </p>
              <p className="text-xs text-muted-foreground">Pendentes</p>
            </CardContent>
          </Card>
        </div>

        {/* New requests */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Novas Solicitações ({bookingRequests.length})
          </h2>

          {bookingRequests.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="Nenhuma solicitação pendente"
              description="Você está em dia! Novas solicitações aparecerão aqui."
              variant="default"
            />
          ) : (
            <div className="space-y-4">
              {bookingRequests.map((booking) => (
                <Card key={booking.id} className="healthcare-card">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={booking.elder?.photo} />
                        <AvatarFallback>
                          <User className="w-6 h-6" />
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 space-y-3">
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {booking.elder?.name}, {booking.elder?.age} anos
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(booking.dateISO)}</span>
                            <Clock className="w-4 h-4 ml-2" />
                            <span>{booking.duration}h</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-healthcare-light" />
                          <span className="text-muted-foreground">
                            {booking.address.street}, {booking.address.city}
                          </span>
                        </div>

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

                        {booking.emergency && (
                          <Badge className="emergency-badge w-fit">
                            Emergência
                          </Badge>
                        )}

                        {booking.notes && (
                          <div className="p-3 rounded-xl bg-muted">
                            <p className="text-sm text-muted-foreground">
                              <strong>Observações:</strong> {booking.notes}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2">
                          <span className="text-lg font-semibold text-foreground">
                            R$ {booking.totalPrice.toFixed(2)}
                          </span>

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleBookingResponse(booking.id, "decline")
                              }
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Recusar
                            </Button>
                            <Button
                              variant="healthcare"
                              size="sm"
                              onClick={() =>
                                handleBookingResponse(booking.id, "accept")
                              }
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Aceitar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming bookings */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Próximos Atendimentos ({upcomingBookings.length})
          </h2>

          {upcomingBookings.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="Nenhum atendimento agendado"
              description="Seus próximos atendimentos aparecerão aqui."
              variant="default"
            />
          ) : (
            <div className="space-y-4">
              {upcomingBookings.map((booking) => (
                <Card key={booking.id} className="healthcare-card">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={booking.elder?.photo} />
                        <AvatarFallback>
                          <User className="w-6 h-6" />
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">
                          {booking.elder?.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(booking.dateISO)}</span>
                          <Clock className="w-4 h-4 ml-2" />
                          <span>{booking.duration}h</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm mt-2">
                          <MapPin className="w-4 h-4 text-healthcare-light" />
                          <span className="text-muted-foreground">
                            {booking.address.city}
                          </span>
                        </div>

                        <div className="flex justify-between items-center mt-3">
                          <Badge className="available-badge">Confirmado</Badge>
                          <span className="font-semibold text-foreground">
                            R$ {booking.totalPrice.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
