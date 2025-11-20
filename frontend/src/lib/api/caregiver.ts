import type { Caregiver } from "@/lib/types";
import { api } from "./api";
import { API_BASE } from "./config";

interface SearchCaregiversParams {
  zipCode?: string;
  maxDistance?: number;
  minRating?: number;
  specialization?: string;
  availableForEmergency?: boolean;
}

export async function toggleCaregiverAvailability(id: string, status: boolean) {
  try {
    const res = await api.patch<Caregiver>(
      `/perfis/caregiver/${id}/availability`,
      {
        available: status,
      }
    );
    return res.data;
  } catch (err) {
    console.error("Error toggling caregiver availability:", err);
    throw err;
  }
}

export async function toggleCaregiverEmergencyAvailability(
  id: string,
  status: boolean
) {
  try {
    const res = await api.patch<Caregiver>(
      `/perfis/caregiver/${id}/emergency-availability`,
      {
        available: status,
      }
    );
    return res.data;
  } catch (err) {
    console.error("Error toggling caregiver emergency-availability`,:", err);
    throw err;
  }
}

/**
 * Busca perfil do cuidador a partir do **userId** (auth.users.id).
 * Essa rota /perfis/:userId retorna user + caregiver + userProfile.
 */
export async function fetchCaregiverProfile(userId: string) {
  try {
    const { data } = await api.get(`/perfis/${userId}`);
    const caregiver = data.caregiver?.[0];

    if (!caregiver) {
      throw new Error("Caregiver not found for this user.");
    }

    // ⚠️ Aqui colocamos *também* o id do cuidador
    return {
      // id REAL do cuidador (tabela caregiver.caregivers)
      id: caregiver.id,
      // mantém compatível com o resto do código (Dashboard usa userId como caregiverId)
      userId: caregiver.id,

      crm_coren: caregiver.crmCoren,
      bio: caregiver.bio,
      address: caregiver.address,
      city: caregiver.city,
      state: caregiver.state,
      zipCode: caregiver.zipCode,
      avatarPath: caregiver.avatarPath,
      avatarUrl: caregiver.avatarPath,

      skills: caregiver.skills || [],
      specializations: caregiver.specializations || [],
      priceRange: caregiver.priceRange || "",
      experience: caregiver.experience || "",
      availability: caregiver.availability,
      emergency: caregiver.emergency,

      // ⭐ importantíssimo para o /profile
      rating: caregiver.rating ?? 0,
      reviewCount: caregiver.reviewCount ?? 0,
    } as Partial<Caregiver> & { id: string };
  } catch (err) {
    console.error("Error fetching caregiver profile:", err);
    throw err;
  }
}

/**
 * Perfil público do cuidador (usado em /caregiver/:id e em bookings)
 * Aqui o parâmetro é o **caregiverId**.
 * Mantive como você já tinha, porque essa parte está funcionando.
 */
export async function fetchCaregiverProfileFromAPI(userId: string) {
  try {
    const { data } = await api.get(`/perfis/${userId}`);
    const caregiver = data.caregiver?.[0];
    const profile = data.userProfile?.[0];

    return {
      id: caregiver?.id,
      userId: data.userId,
      name: profile?.name ?? "Sem nome",
      phone: profile?.phone ?? "",
      email: data.email,
      crm_coren: caregiver?.crmCoren,
      bio: caregiver?.bio,
      address: caregiver?.address,
      city: caregiver?.city,
      state: caregiver?.state,
      zipCode: caregiver?.zipCode,
      avatarPath: caregiver?.avatarPath,
      validated: caregiver?.validated,
      emergency: caregiver?.emergency,
      availability: caregiver?.availability,
      experience: caregiver?.experience,
      price_range: caregiver?.priceRange,
      rating: caregiver?.rating,
      reviewCount: caregiver?.reviewCount,
      skills: caregiver?.skills,
      specializations: caregiver?.specializations,
      verificationBadges: caregiver?.verificationBadges,
    };
  } catch (err) {
    console.error("Error fetching caregiver profile:", err);
    throw err;
  }
}

/**
 * Update caregiver profile.
 */
export async function updateCaregiverProfile(
  userId: string,
  formData: Partial<Caregiver>,
  avatarFile?: File
) {
  try {
    const form = new FormData();
    form.append("crm_coren", formData.crm_coren || "");
    form.append("bio", formData.bio || "");
    form.append("address", formData.address || "");
    form.append("city", formData.city || "");
    form.append("state", formData.state || "");
    form.append("zipCode", formData.zipCode || "");
    form.append("skills", JSON.stringify(formData.skills || []));
    form.append(
      "specializations",
      JSON.stringify(formData.specializations || [])
    );
    form.append("priceRange", formData.priceRange || "");
    form.append("experience", formData.experience || "");

    if (avatarFile) {
      form.append("avatar", avatarFile);
    }

    const { data } = await api.patch(`/perfis/caregiver/${userId}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return data;
  } catch (err) {
    console.error("Error updating caregiver profile:", err);
    throw err;
  }
}

/**
 * Busca cuidadores por CEP / filtros
 */
export async function searchCaregivers(params: SearchCaregiversParams = {}) {
  let currentUser: any = null;

  try {
    const rawUser = localStorage.getItem("user");
    currentUser = rawUser ? JSON.parse(rawUser) : null;
  } catch {
    console.warn("⚠️ Não foi possível ler o usuário do localStorage");
  }

  const fallbackZip =
    currentUser?.elders?.[0]?.zipCode ?? currentUser?.zipCode ?? null;

  const zipCode = params.zipCode ?? fallbackZip;
  if (!zipCode) {
    throw new Error(
      "CEP não encontrado. Informe manualmente ou associe um idoso com endereço."
    );
  }

  const token = localStorage.getItem("accessToken");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const queryParams = new URLSearchParams();

  if (zipCode) queryParams.append("zipCode", zipCode);
  if (params.maxDistance)
    queryParams.append("maxDistance", params.maxDistance.toString());
  if (params.minRating)
    queryParams.append("minRating", params.minRating.toString());
  if (params.specialization)
    queryParams.append("specialization", params.specialization);
  if (params.availableForEmergency)
    queryParams.append("availableForEmergency", "true");

  const url = `${API_BASE}/perfis/caregivers/search?${queryParams.toString()}`;

  const response = await fetch(url, { headers });
  if (!response.ok) {
    const msg = await response.text();
    throw new Error(`Erro ao buscar cuidadores: ${msg}`);
  }

  const data = await response.json();
  console.log("✅ Cuidadores encontrados:", data);
  return data;
}
