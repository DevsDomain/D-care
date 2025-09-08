/**
 * Caregiver Card Component
 * Displays caregiver information in a card format for search results and lists
 */

import { MapPin, Clock, Shield, AlertTriangle } from 'lucide-react';
import type { Caregiver } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button-variants';
import { RatingStars } from './RatingStars';
import { cn } from '@/lib/utils';

interface CaregiverCardProps {
  caregiver: Caregiver;
  onSelect?: (caregiver: Caregiver) => void;
  onBook?: (caregiver: Caregiver) => void;
  className?: string;
  compact?: boolean;
}

export function CaregiverCard({ 
  caregiver, 
  onSelect, 
  onBook,
  className,
  compact = false 
}: CaregiverCardProps) {
  const handleCardClick = () => {
    if (onSelect) {
      onSelect(caregiver);
    }
  };

  const handleBookClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onBook) {
      onBook(caregiver);
    }
  };

  return (
    <Card 
      className={cn(
        "healthcare-card cursor-pointer hover:shadow-healthcare transition-all duration-300 hover:-translate-y-1",
        className
      )}
      onClick={handleCardClick}
    >
      <CardContent className={cn("p-4", !compact && "p-6")}>
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative">
            <Avatar className={cn("border-2 border-healthcare-light/20", compact ? "h-12 w-12" : "h-16 w-16")}>
              <AvatarImage src={caregiver.photo} alt={caregiver.name} />
              <AvatarFallback className="bg-healthcare-soft text-healthcare-dark font-semibold">
                {caregiver.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            {/* Verification badge */}
            {caregiver.verified && (
              <div className="absolute -top-1 -right-1 bg-trust-blue rounded-full p-1">
                <Shield className="w-3 h-3 text-white" />
              </div>
            )}
            
            {/* Emergency availability indicator */}
            {caregiver.emergency && (
              <div className="absolute -bottom-1 -right-1 bg-medical-critical rounded-full p-1">
                <AlertTriangle className="w-3 h-3 text-white" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h3 className={cn("font-semibold text-foreground truncate", compact ? "text-sm" : "text-lg")}>
                  {caregiver.name}
                </h3>
                
                {!compact && caregiver.crmCorem && (
                  <p className="text-xs text-muted-foreground">
                    {caregiver.crmCorem}
                  </p>
                )}
                
                <div className="flex items-center gap-4 mt-1">
                  <RatingStars 
                    rating={caregiver.rating} 
                    size={compact ? "sm" : "md"}
                    reviewCount={caregiver.reviewCount}
                    showNumber={!compact}
                  />
                </div>
              </div>
              
              <div className="text-right">
                <p className={cn("font-medium text-healthcare-dark", compact ? "text-xs" : "text-sm")}>
                  {caregiver.priceRange}
                </p>
                <div className={cn("flex items-center text-muted-foreground mt-1", compact ? "text-xs" : "text-sm")}>
                  <MapPin className="w-3 h-3 mr-1" />
                  {caregiver.distanceKm.toFixed(1)}km
                </div>
              </div>
            </div>

            {/* Experience and skills */}
            {!compact && (
              <div className="mt-3">
                <p className="text-sm text-muted-foreground mb-2">
                  {caregiver.experience} • {caregiver.skills.slice(0, 2).join(', ')}
                  {caregiver.skills.length > 2 && ` +${caregiver.skills.length - 2}`}
                </p>
                
                {/* Verification badges */}
                <div className="flex gap-1 flex-wrap">
                  {caregiver.verificationBadges.slice(0, 3).map((badge) => (
                    <Badge 
                      key={badge} 
                      variant="outline" 
                      className="text-xs px-2 py-0.5 bg-trust-blue/10 text-trust-blue border-trust-blue/20"
                    >
                      {badge}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Availability preview */}
            {!compact && caregiver.availability.length > 0 && (
              <div className="mt-3 flex items-center text-sm text-muted-foreground">
                <Clock className="w-4 h-4 mr-1" />
                <span>
                  Disponível {caregiver.availability[0].day} {caregiver.availability[0].start}-{caregiver.availability[0].end}
                </span>
                {caregiver.availability.length > 1 && (
                  <span className="ml-1">+{caregiver.availability.length - 1}</span>
                )}
              </div>
            )}

            {/* Action buttons */}
            {!compact && (
              <div className="flex gap-2 mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={handleCardClick}
                >
                  Ver Perfil
                </Button>
                <Button 
                  variant="healthcare" 
                  size="sm" 
                  className="flex-1"
                  onClick={handleBookClick}
                >
                  Contratar
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}