
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Clock, Star, Shield, Phone, MessageCircle, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button-variants';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RatingStars } from '@/components/common/RatingStars';
import { EmptyState } from '@/components/common/EmptyState';
import { ListSkeleton } from '@/components/common/LoadingSkeleton';
import { mockApi } from '@/lib/api/mock';
import type { Caregiver, Review } from '@/lib/types';

export default function CaregiverProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [caregiver, setCaregiver] = useState<Caregiver | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadCaregiverData();
    }
  }, [id]);

  const loadCaregiverData = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      const [caregiverResponse, reviewsResponse] = await Promise.all([
        mockApi.getCaregiverById(id),
        mockApi.getCaregiverReviews(id)
      ]);

      if (caregiverResponse.success && caregiverResponse.data) {
        setCaregiver(caregiverResponse.data);
      }

      if (reviewsResponse.success && reviewsResponse.data) {
        setReviews(reviewsResponse.data);
      }
    } catch (error) {
      console.error('Failed to load caregiver data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookCaregiver = () => {
    if (caregiver) {
      navigate(`/book/${caregiver.id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <ListSkeleton type="profile" count={1} />
      </div>
    );
  }

  if (!caregiver) {
    return (
      <EmptyState
        icon={Shield}
        title="Cuidador não encontrado"
        description="O perfil solicitado não foi encontrado."
        actionLabel="Voltar à busca"
        onAction={() => navigate('/search')}
        variant="error"
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-healthcare-dark to-healthcare-light text-white sticky top-0 z-40">
        <div className="p-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="healthcare" 
              size="icon-sm" 
              onClick={() => navigate(-1)}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold">Perfil do Cuidador</h1>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Profile Card */}
        <Card className="healthcare-card">
          <CardContent className="p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="relative">
                <Avatar className="h-20 w-20 border-2 border-healthcare-light/20">
                  <AvatarImage src={caregiver.photo} alt={caregiver.name} />
                  <AvatarFallback className="bg-healthcare-soft text-healthcare-dark font-semibold text-xl">
                    {caregiver.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                {caregiver.verified && (
                  <div className="absolute -top-1 -right-1 bg-trust-blue rounded-full p-1">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h2 className="text-xl font-bold text-foreground mb-1">
                  {caregiver.name}
                </h2>
                
                {caregiver.crmCorem && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {caregiver.crmCorem}
                  </p>
                )}

                <div className="flex items-center gap-4 mb-3">
                  <RatingStars 
                    rating={caregiver.rating}
                    reviewCount={caregiver.reviewCount}
                    size="md"
                  />
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {caregiver.distanceKm.toFixed(1)}km
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {caregiver.experience}
                  </div>
                </div>
              </div>
            </div>

            {/* Price and Emergency Badge */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-2xl font-bold text-healthcare-dark">
                  {caregiver.priceRange}
                </p>
                <p className="text-sm text-muted-foreground">por hora</p>
              </div>
              
              {caregiver.emergency && (
                <Badge variant="destructive" className="px-3 py-1">
                  Disponível para emergência
                </Badge>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" size="lg">
                <Phone className="w-5 h-5 mr-2" />
                Ligar
              </Button>
              <Button variant="healthcare" size="lg" onClick={handleBookCaregiver}>
                <Calendar className="w-5 h-5 mr-2" />
                Contratar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card className="healthcare-card">
          <CardHeader>
            <CardTitle>Sobre</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              {caregiver.bio}
            </p>
          </CardContent>
        </Card>

        {/* Skills & Specializations */}
        <Card className="healthcare-card">
          <CardHeader>
            <CardTitle>Especialidades</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Habilidades</h4>
              <div className="flex flex-wrap gap-2">
                {caregiver.skills.map((skill, index) => (
                  <Badge key={index} variant="outline" className="bg-healthcare-soft/30">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-2">Especializações</h4>
              <div className="flex flex-wrap gap-2">
                {caregiver.specializations.map((spec, index) => (
                  <Badge key={index} variant="outline" className="bg-trust-blue/10 text-trust-blue border-trust-blue/20">
                    {spec}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verification Badges */}
        <Card className="healthcare-card">
          <CardHeader>
            <CardTitle>Verificações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {caregiver.verificationBadges.map((badge, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-trust-blue/10 rounded-xl">
                  <Shield className="w-5 h-5 text-trust-blue" />
                  <span className="text-sm font-medium">{badge}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Reviews */}
        <Card className="healthcare-card">
          <CardHeader>
            <CardTitle>Avaliações ({reviews.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {reviews.length === 0 ? (
              <EmptyState
                icon={Star}
                title="Nenhuma avaliação ainda"
                description="Este cuidador ainda não recebeu avaliações."
                variant="default"
              />
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-border pb-4 last:border-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-sm">{review.elderName}</p>
                        <RatingStars rating={review.rating} size="sm" showNumber={false} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                    
                    {review.services.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {review.services.map((service, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}