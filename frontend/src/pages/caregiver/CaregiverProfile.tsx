import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Star,
  Shield,
  Phone,
  Calendar,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button-variants";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RatingStars } from "@/components/common/RatingStars";
import { EmptyState } from "@/components/common/EmptyState";
import { ListSkeleton } from "@/components/common/LoadingSkeleton";

import type { Caregiver } from "@/lib/types";
import { fetchCaregiverProfileFromAPI } from "@/lib/api/caregiver";
import { api } from "@/lib/api/api";

type CaregiverReview = {
  id: string;
  rating: number | null;
  comment: string | null;
  createdAt: string | null;
  appointmentDate: string | null;
  elderName: string | null;
  familyName: string | null;
};

export default function CaregiverProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [caregiver, setCaregiver] = useState<Caregiver | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [reviews, setReviews] = useState<CaregiverReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  useEffect(() => {
    if (id) {
      void loadCaregiverData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadCaregiverData = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      const data = await fetchCaregiverProfileFromAPI(id);
      console.log("Caregiver data:", data);

      if (data) {
        const caregiverData: Caregiver = {
          id: data.id,
          userId: data.userId,
          name: data.name || "Sem nome",
          phone: data.phone || "",
          email: data.email,
          bio: data.bio || "",
          crmCorem: data.crm_coren || "",
          verified: data.validated || false,
          emergency: data.emergency || false,
          experience: data.experience || "",
          price_range: data.price_range || "",
          rating: data.rating || 0,
          reviewCount: data.reviewCount || 0,
          skills: data.skills || [],
          specializations: data.specializations || [],
          verificationBadges: data.verificationBadges || [],
          photo: data.avatarPath || null,
          distanceKm: 0,
          availability: data.availability ?? true,
        };

        setCaregiver(caregiverData);

        // 👇 carrega as avaliações desse cuidador
        void loadReviews(caregiverData.id);
      }
    } catch (error) {
      console.error("❌ Falha ao carregar cuidador:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadReviews = async (caregiverId: string) => {
    try {
      setLoadingReviews(true);
      const { data } = await api.get<CaregiverReview[]>(
        `/appointments/reviews?caregiverId=${caregiverId}`,
      );
      setReviews(data);
    } catch (error) {
      console.error("❌ Falha ao carregar avaliações:", error);
    } finally {
      setLoadingReviews(false);
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
        onAction={() => navigate("/search")}
        variant="error"
      />
    );
  }

  const handleBookCaregiver = (caregiver: Caregiver) => {
    navigate(`/book/${caregiver.id}/${caregiver.price_range}`);
  };

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
                  <AvatarImage
                    src={caregiver.photo || undefined}
                    alt={caregiver.name}
                  />
                  <AvatarFallback className="bg-healthcare-soft text-healthcare-dark font-semibold text-xl">
                    {caregiver.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
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
                    Jacareí - SP
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
                  R${caregiver.price_range}
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
              <Button
                variant="healthcare"
                size="lg"
                onClick={() => handleBookCaregiver(caregiver)}
              >
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
              {caregiver.bio || "Nenhuma descrição disponível."}
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
                  <Badge
                    key={index}
                    variant="outline"
                    className="bg-healthcare-soft/30"
                  >
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
                  <Badge
                    key={index}
                    variant="outline"
                    className="bg-trust-blue/10 text-trust-blue border-trust-blue/20"
                  >
                    {spec}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verification Badges */}
        {caregiver.verificationBadges.length > 0 && (
          <Card className="healthcare-card">
            <CardHeader>
              <CardTitle>Verificações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {caregiver.verificationBadges.map((badge, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-3 bg-trust-blue/10 rounded-xl"
                  >
                    <Shield className="w-5 h-5 text-trust-blue" />
                    <span className="text-sm font-medium">{badge}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reviews */}
        <Card className="healthcare-card">
          <CardHeader>
            <CardTitle>Avaliações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingReviews ? (
              <p className="text-sm text-muted-foreground">
                Carregando avaliações...
              </p>
            ) : reviews.length === 0 ? (
              <EmptyState
                icon={Star}
                title="Nenhuma avaliação ainda"
                description="Este cuidador ainda não recebeu avaliações."
                variant="default"
              />
            ) : (
              reviews.map((review) => (
                <div
                  key={review.id}
                  className="border border-border rounded-xl p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {review.familyName || "Família"}
                      </p>
                      {review.elderName && (
                        <p className="text-xs text-muted-foreground">
                          Paciente: {review.elderName}
                        </p>
                      )}
                    </div>
                    <RatingStars
                      rating={review.rating ?? 0}
                      size="sm"
                      showNumber={false}
                      interactive={false}
                    />
                  </div>

                  {review.comment && (
                    <p className="text-sm text-muted-foreground">
                      {review.comment}
                    </p>
                  )}

                  <p className="text-xs text-muted-foreground">
                    {review.appointmentDate
                      ? `Atendimento em ${new Date(
                          review.appointmentDate,
                        ).toLocaleDateString("pt-BR")}`
                      : review.createdAt
                      ? `Avaliação em ${new Date(
                          review.createdAt,
                        ).toLocaleDateString("pt-BR")}`
                      : null}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
