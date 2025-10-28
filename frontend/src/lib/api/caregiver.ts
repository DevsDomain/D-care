import type { Caregiver } from "@/lib/types";
import { api } from "./api";

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

export async function fetchCaregiverProfile(userId: string) {
  try {
    const { data } = await api.get(`/perfis/${userId}`);
    const caregiver = data.caregiver?.[0];

    if (!caregiver) {
      throw new Error("Caregiver not found for this user.");
    }

    // Normalize fields to match your Caregiver type
    return {
      crm_coren: caregiver.crmCoren,
      bio: caregiver.bio,
      address: caregiver.address,
      city: caregiver.city,
      state: caregiver.state,
      zipCode: caregiver.zipCode,
      avatarPath: caregiver.avatarPath,
      userId: caregiver.id,
      avatarUrl: caregiver.avatarPath,
      skills: caregiver.skills || [],
      specializations: caregiver.specializations || [],
      priceRange: caregiver.priceRange || "",
      experience: caregiver.experience || "",
      availability: data.caregiver[0].availability,
      emergency: data.caregiver[0].emergency,
    } as Partial<Caregiver>;
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
