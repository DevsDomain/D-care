import type { Caregiver } from "@/lib/types";
import { searchCaregivers } from "@/lib/api/caregivers";

/**
 * Busca cuidadores reais da API e os normaliza para o formato do mock.ts
 */
export async function fetchCaregiversFromAPI(
  filters: {
    maxDistance?: number;
    minRating?: number;
    specialization?: string;
    availableForEmergency?: boolean;
  } = {}
): Promise<Caregiver[]> {
  try {
    const caregivers = await searchCaregivers(filters);

    // Ajuste de formato para o frontend
    return caregivers.map((c: any) => ({
      id: c.id,
      userId: c.userId,
      name: c.name,
      photo: c.photo ?? "https://placehold.co/150x150?text=Caregiver",
      verified: c.verified ?? c.validated ?? false,
      crmCorem: c.crmCorem ?? c.crm_coren ?? "",
      rating: Number(c.rating ?? 0),
      reviewCount: Number(c.reviewCount ?? c.review_count ?? 0),
      distanceKm: Number(c.distanceKm ?? 0),
      skills: c.skills ?? ["Companionship", "Elderly Care"],
      experience: c.experience ?? "1+ years",
      priceRange: c.priceRange ?? "R$ 30-40/hora",
      emergency: c.emergency ?? false,
      availability: c.availability ?? [],
      bio: c.bio ?? "",
      phone: c.phone ?? "",
      languages: c.languages ?? ["Portuguese"],
      specializations: c.specializations ?? [],
      verificationBadges: c.verificationBadges ?? [],
    }));
  } catch (err) {
    console.error("❌ Erro ao buscar cuidadores:", err);
    return [];
  }
}
