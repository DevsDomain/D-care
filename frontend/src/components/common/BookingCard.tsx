/**
 * Booking Card Component
 * Displays booking information with status and actions
 */

import { Calendar, Clock, MapPin, AlertTriangle, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button-variants';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { Booking, BookingStatus } from '@/lib/types';

interface BookingCardProps {
  booking: Booking;
  userRole: 'family' | 'caregiver';
  onAccept?: (bookingId: string) => void;
  onDecline?: (bookingId: string) => void;
  onCancel?: (bookingId: string) => void;
  onReview?: (bookingId: string) => void;
  onViewDetails?: (bookingId: string) => void;
  className?: string;
}

const statusConfig: Record<BookingStatus, {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}> = {
  requested: {
    label: 'Solicitado',
    variant: 'outline',
    icon: Clock,
    color: 'text-medical-warning'
  },
  accepted: {
    label: 'Aceito',
    variant: 'secondary',
    icon: CheckCircle2,
    color: 'text-medical-success'
  },
  'in-progress': {
    label: 'Em andamento',
    variant: 'default',
    icon: Loader2,
    color: 'text-healthcare-light'
  },
  completed: {
    label: 'Concluído',
    variant: 'outline',
    icon: CheckCircle2,
    color: 'text-medical-success'
  },
  canceled: {
    label: 'Cancelado',
    variant: 'destructive',
    icon: XCircle,
    color: 'text-medical-critical'
  },
  expired: {
    label: 'Expirado',
    variant: 'outline',
    icon: XCircle,
    color: 'text-muted-foreground'
  }
};

export function BookingCard({
  booking,
  userRole,
  onAccept,
  onDecline,
  onCancel,
  onReview,
  onViewDetails,
  className
}: BookingCardProps) {
  const statusInfo = statusConfig[booking.status];
  const StatusIcon = statusInfo.icon;
  const bookingDate = parseISO(booking.dateISO);

  const handleAccept = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAccept?.(booking.id);
  };

  const handleDecline = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDecline?.(booking.id);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCancel?.(booking.id);
  };

  const handleReview = (e: React.MouseEvent) => {
    e.stopPropagation();
    onReview?.(booking.id);
  };

  const handleViewDetails = () => {
    onViewDetails?.(booking.id);
  };

  return (
    <Card 
      className={cn(
        "healthcare-card cursor-pointer hover:shadow-healthcare transition-all duration-300",
        className
      )}
      onClick={handleViewDetails}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Caregiver or Elder Avatar */}
            {userRole === 'family' && booking.caregiver && (
              <Avatar className="h-12 w-12 border-2 border-healthcare-light/20">
                <AvatarImage src={booking.caregiver.photo} alt={booking.caregiver.name} />
                <AvatarFallback className="bg-healthcare-soft text-healthcare-dark font-semibold">
                  {booking.caregiver.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            )}
            
            {userRole === 'caregiver' && booking.elder && (
              <Avatar className="h-12 w-12 border-2 border-healthcare-light/20">
                <AvatarImage src={booking.elder.photo} alt={booking.elder.name} />
                <AvatarFallback className="bg-healthcare-soft text-healthcare-dark font-semibold">
                  {booking.elder.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            )}

            <div className="flex-1">
              <h3 className="font-semibold text-foreground">
                {userRole === 'family' 
                  ? booking.caregiver?.name || 'Cuidador' 
                  : booking.elder?.name || 'Paciente'}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={statusInfo.variant} className="text-xs">
                  <StatusIcon className={cn("w-3 h-3 mr-1", statusInfo.color)} />
                  {statusInfo.label}
                </Badge>
                {booking.emergency && (
                  <Badge variant="destructive" className="text-xs">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Emergência
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <p className="font-semibold text-healthcare-dark">
              R$ {booking.totalPrice.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">
              {booking.duration}h
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Date and Time */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-healthcare-light" />
            <span>
              {format(bookingDate, "dd 'de' MMM", { locale: ptBR })}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-healthcare-light" />
            <span>
              {format(bookingDate, "HH:mm")}
            </span>
          </div>
        </div>

        {/* Services */}
        {booking.services && booking.services.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-foreground mb-1">Serviços:</p>
            <div className="flex flex-wrap gap-1">
              {booking.services.map((service, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {service}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Address */}
        <div className="flex items-start gap-2 text-sm text-muted-foreground mb-4">
          <MapPin className="w-4 h-4 mt-0.5 text-healthcare-light shrink-0" />
          <span className="line-clamp-2">
            {booking.address.street}, {booking.address.city}
          </span>
        </div>

        {/* Notes */}
        {booking.notes && (
          <div className="mb-4">
            <p className="text-sm font-medium text-foreground mb-1">Observações:</p>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {booking.notes}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {/* Family actions */}
          {userRole === 'family' && (
            <>
              {booking.status === 'requested' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={handleCancel}
                >
                  Cancelar
                </Button>
              )}
              {booking.status === 'completed' && (
                <Button 
                  variant="healthcare" 
                  size="sm" 
                  className="flex-1"
                  onClick={handleReview}
                >
                  Avaliar
                </Button>
              )}
            </>
          )}

          {/* Caregiver actions */}
          {userRole === 'caregiver' && (
            <>
              {booking.status === 'requested' && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={handleDecline}
                  >
                    Recusar
                  </Button>
                  <Button 
                    variant="healthcare" 
                    size="sm" 
                    className="flex-1"
                    onClick={handleAccept}
                  >
                    Aceitar
                  </Button>
                </>
              )}
            </>
          )}
          
          {/* Always show details button */}
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleViewDetails}
          >
            Detalhes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}