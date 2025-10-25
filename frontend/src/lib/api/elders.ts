// src/lib/api/elders.ts
import type { Elder } from "@/lib/types";
import { API_BASE } from "./config";

/** Extrai um familyId de um objeto de usuário salvo localmente */
function pickFamilyIdFromUser(u: any): string | null {
  return (
    u?.familyId ??
    u?.family?.id ??
    (Array.isArray(u?.family) ? u.family[0]?.id : null) ??
    u?.family_id ??
    null
  );
}

/** Cria um idoso (FormData, inclusive avatar e endereço) */
export async function createElder(elder: Partial<Elder>) {
  const formData = new FormData();

  // Descobre familyId
  let familyId: string | null = null;
  let currentUser: any = null;
  try {
    const rawUser = localStorage.getItem("user");
    currentUser = rawUser ? JSON.parse(rawUser) : null;
    familyId = (elder as any)?.familyId ?? pickFamilyIdFromUser(currentUser);
  } catch {}

  if (familyId) formData.append("familyId", familyId);

  // Básico
  formData.append("name", elder.name ?? "");
  if (elder.birthDate) formData.append("birthdate", elder.birthDate.toISOString());

  // Saúde
  if (elder.conditions) formData.append("conditions", JSON.stringify(elder.conditions));
  if (elder.medications) formData.append("medications", JSON.stringify(elder.medications));

  // Endereço (flatten)
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

  // Avatar
  if (elder.avatarFile) formData.append("avatar", elder.avatarFile);

  // Auth
  const headers: Record<string, string> = {};
  const token = localStorage.getItem("accessToken");
  if (token) headers.Authorization = `Bearer ${token}`;

  const url =
    familyId
      ? `${API_BASE}/idosos?familyId=${encodeURIComponent(familyId)}`
      : `${API_BASE}/idosos`;

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const msg = body?.message || "Erro ao registrar idoso";
    throw new Error(Array.isArray(msg) ? msg.join(", ") : msg);
  }

  const created = await response.json();

  // Fallback local (quando não temos familyId no backend)
  try {
    const userId = currentUser?.id ?? currentUser?.userId ?? null;
    if (userId && created?.id) {
      const key = `elders:${userId}`;
      const raw = localStorage.getItem(key);
      const arr = raw ? JSON.parse(raw) : [];

      const minimal = {
        id: created.id,
        name: created.name,
        birthdate: created.birthdate ?? created.birthDate ?? null,
        avatarPath: created.avatarPath ?? created.photo ?? null,
        photo: created.photo ?? null,
        familyId:
          created.familyId ?? created.family_id ?? created.family?.id ?? familyId ?? null,
        conditions: created.medicalConditions ?? created.conditions ?? [],
      };

      const exists = Array.isArray(arr) && arr.some((x: any) => x?.id === created.id);
      const next = exists ? arr : [...(Array.isArray(arr) ? arr : []), minimal];
      localStorage.setItem(key, JSON.stringify(next));
    }
  } catch {}

  return created;
}

/** Busca 1 idoso por id */
export async function getElderById(id: string) {
  const token = localStorage.getItem("accessToken");
  const res = await fetch(`${API_BASE}/idosos/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const msg = body?.message || `Erro ao buscar idoso (${res.status})`;
    throw new Error(Array.isArray(msg) ? msg.join(", ") : msg);
  }
  return res.json();
}

export type UpdateElderPayload = {
  name?: string;
  birthDate?: Date | string;
  conditions?: string[];
  medications?: string[];
  address?: { street?: string; number?: string; city?: string; state?: string; zipCode?: string };
  avatarFile?: File | null;
};

/**
 * Atualiza TUDO em uma única chamada (sempre multipart/form-data).
 * Evita o 400 "property address should not exist" do PATCH JSON.
 */
export async function updateElder(id: string, payload: UpdateElderPayload) {
  const fd = new FormData();

  // Básico
  if (payload.name != null) fd.append("name", payload.name);
  if (payload.birthDate) {
    fd.append(
      "birthdate",
      typeof payload.birthDate === "string"
        ? payload.birthDate
        : payload.birthDate.toISOString()
    );
  }

  // Saúde
  if (payload.conditions) fd.append("conditions", JSON.stringify(payload.conditions));
  if (payload.medications) fd.append("medications", JSON.stringify(payload.medications));

  // Endereço (flatten igual ao create)
  if (payload.address) {
    const street = payload.address.street?.trim() || "";
    const number = payload.address.number ? String(payload.address.number).trim() : "";
    const addressLine = [street, number].filter(Boolean).join(" ");
    if (addressLine) fd.append("address", addressLine);
    if (payload.address.city) fd.append("city", payload.address.city);
    if (payload.address.state) fd.append("state", payload.address.state);
    if (payload.address.zipCode) fd.append("zipCode", payload.address.zipCode);
  }

  // Avatar
  if (payload.avatarFile) fd.append("avatar", payload.avatarFile);

  // Auth (não setar Content-Type)
  const token = localStorage.getItem("accessToken");
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

  const res = await fetch(`${API_BASE}/idosos/${id}`, {
    method: "PATCH",
    headers,
    body: fd,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const msg = body?.message || "Erro ao atualizar idoso";
    throw new Error(Array.isArray(msg) ? msg.join(", ") : msg);
  }
  return res.json();
}

/** (opcional) Exclui um idoso */
export async function deleteElder(id: string) {
  const token = localStorage.getItem("accessToken");
  const res = await fetch(`${API_BASE}/idosos/${id}`, {
    method: "DELETE",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const msg = body?.message || "Erro ao excluir idoso";
    throw new Error(Array.isArray(msg) ? msg.join(", ") : msg);
  }
  return res.json();
}
