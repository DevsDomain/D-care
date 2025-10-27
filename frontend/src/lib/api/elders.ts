import type { Elder } from "@/lib/types";
import { API_BASE } from "./config";

function pickFamilyIdFromUser(u: any): string | null {
  return (
    u?.familyId ??
    u?.family?.id ??
    (Array.isArray(u?.family) ? u.family[0]?.id : null) ??
    u?.family_id ??
    null
  );
}

export async function createElder(elder: Partial<Elder>) {
  const formData = new FormData();

  // ——— Descobre o familyId do usuário logado (sem mudar o backend)
  let familyId: string | null = null;
  let currentUser: any = null;

  try {
    const rawUser = localStorage.getItem("user");
    currentUser = rawUser ? JSON.parse(rawUser) : null;
    familyId = (elder as any)?.familyId ?? pickFamilyIdFromUser(currentUser);
  } catch {
    /* ignore */
  }

  if (familyId) formData.append("familyId", familyId);

  // ——— Campos básicos
  formData.append("name", elder.name ?? "");
  if (elder.birthDate) formData.append("birthdate", elder.birthDate.toISOString());

  if (elder.conditions) formData.append("conditions", JSON.stringify(elder.conditions));
  if (elder.medications) formData.append("medications", JSON.stringify(elder.medications));

  // Endereço
  const addressLine = [
    elder.address?.street?.trim(),
    elder.address?.number ? String(elder.address.number).trim() : "",
  ]
    .filter(Boolean)
    .join(" ");
  if (addressLine) formData.append("address", addressLine);
  if (elder.address?.city) formData.append("city", elder.address.city);
  if (elder.address?.state) formData.append("state", elder.address.state);
  if (elder.address?.zipCode) formData.append("zipCode", elder.address.zipCode);

  // Arquivo (backend espera a chave "avatar")
  if (elder.avatarFile) {
    formData.append("avatar", elder.avatarFile);
  }

  // Token (não setar Content-Type manualmente com FormData)
  const headers: Record<string, string> = {};
  const token = localStorage.getItem("accessToken");
  if (token) headers.Authorization = `Bearer ${token}`;

  // (Opcional) passa familyId também na query
  const url =
    familyId ? `${API_BASE}/idosos?familyId=${encodeURIComponent(familyId)}` : `${API_BASE}/idosos`;

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Erro ao registrar idoso");
  }

  const created = await response.json();

  // ——— Fallback front-only: guarda o idoso criado para este usuário (se não houver familyId, a Home usa isso)
  try {
    const userId = currentUser?.id ?? currentUser?.userId ?? null;
    if (userId && created?.id) {
      const key = `elders:${userId}`;
      const raw = localStorage.getItem(key);
      const arr = raw ? JSON.parse(raw) : [];

      // salva uma versão enxuta (com os campos que a Home usa)
      const minimal = {
        id: created.id,
        name: created.name,
        birthdate: created.birthdate ?? created.birthDate ?? null,
        avatarPath: created.avatarPath ?? created.photo ?? null,
        photo: created.photo ?? null,
        familyId: created.familyId ?? created.family_id ?? created.family?.id ?? familyId ?? null,
        conditions:
          created.medicalConditions ??
          created.conditions ??
          [], // a Home normaliza depois
      };

      const exists = Array.isArray(arr) && arr.some((x: any) => x?.id === created.id);
      const next = exists ? arr : [...(Array.isArray(arr) ? arr : []), minimal];
      localStorage.setItem(key, JSON.stringify(next));
    }
  } catch {
    /* ignore */
  }

  return created;
}
