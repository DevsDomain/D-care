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

    console.log("FROM API CALL",caregivers[0])

    // Ajuste de formato para o frontend
    return caregivers.map((c: Caregiver) => ({
      id: c.id,
      userId: c.userId,
      name: c.name ?? "Cuidador(a) Anônimo(a)",
      photo: c.avatarPath ?? c.avatarPath ?? "",
      verified: c.verified ?? c.verificationBadges ?? false,
      crm_coren: c.crm_coren ?? c.crm_coren ?? "",
      rating: Number(c.rating ?? 0),
      reviewCount: Number(c.reviewCount ?? c.rating ?? 0),
      distanceKm: Number(c.distanceKm ?? 0),
      skills: c.skills ?? ["Companionship", "Elderly Care"],
      experience: c.experience ?? "1+ years",
      price_range: c.price_range ,
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
