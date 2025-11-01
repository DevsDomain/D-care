// src/lib/api/elders.ts
import type { Elder } from "@/lib/types";
import { API_BASE } from "./config";

/** Header Authorization, se houver token salvo */
function authHeaders() {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** Monta um familyId a partir do usuário armazenado (várias formas possíveis) */
function pickFamilyIdFromUser(u: any): string | null {
  return (
    u?.familyId ??
    u?.family?.id ??
    (Array.isArray(u?.family) ? u.family[0]?.id : null) ??
    u?.family_id ??
    null
  );
}

/** Parse seguro de string JSON para array */
function safeParseArray(v: unknown): string[] {
  try {
    if (Array.isArray(v)) return v as string[];
    if (typeof v === "string") {
      const parsed = JSON.parse(v);
      return Array.isArray(parsed) ? parsed : [];
    }
    return [];
  } catch {
    return [];
  }
}

/** Transforma caminho relativo do backend em URL absoluta; mantém se já for http(s) */
function toAbsoluteUrl(path?: string | null): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const base = API_BASE.replace(/\/api\/v1$/, "");
  return `${base}/${String(path).replace(/^\/+/, "")}`;
}

/** Normaliza o objeto vindo do backend para sempre expor avatarUrl */
export function normalizeElder(raw: any): Elder {
  const avatarUrl =
    raw?.avatarUrl ??
    raw?.photo ??
    toAbsoluteUrl(raw?.avatarPath);

  const conditions =
    Array.isArray(raw?.medicalConditions)
      ? raw.medicalConditions
      : typeof raw?.medicalConditions === "string"
      ? safeParseArray(raw.medicalConditions)
      : raw?.conditions ?? [];

  const medicationsArr =
    Array.isArray(raw?.medications)
      ? raw.medications
      : typeof raw?.medications === "string"
      ? safeParseArray(raw.medications)
      : [];

  // birthdate pode vir como string ISO; front usa birthDate: Date
  const birthDate =
    raw?.birthdate ? new Date(raw.birthdate) :
    raw?.birthDate ? new Date(raw.birthDate) :
    null;

  return {
    id: raw.id,
    name: raw.name ?? "",
    birthDate: birthDate || undefined,
    avatarFile: null, // arquivo só vive no client
    photo: avatarUrl ?? undefined,

    conditions,
    medications: medicationsArr,

    address: {
      street: raw.address ?? "",
      number: raw.number ?? "",
      city: raw.city ?? "",
      state: raw.state ?? "",
      zipCode: raw.zipCode ?? "",
    },

    preferences: raw.preferences ?? { gender: "any", language: ["Portuguese"], specialNeeds: [] },

    createdAt: raw.createdAt,
    familyId: raw.familyId ?? raw?.family?.id ?? null,
  } as Elder;
}

/* ==============================
 * CREATE
 * ============================== */
export async function createElder(elder: Partial<Elder>) {
  const formData = new FormData();

  // Descobre familyId do usuário logado
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

  // Campos básicos
  formData.append("name", elder.name ?? "");
  if (elder.birthDate) formData.append("birthdate", elder.birthDate.toISOString());

  if (elder.conditions) formData.append("conditions", JSON.stringify(elder.conditions));
  if (elder.medications) formData.append("medications", JSON.stringify(elder.medications));

  // Endereço
  const addressLine = [
    elder.address?.street?.trim(),
    elder.address?.number ? String(elder.address.number).trim() : "",
  ].filter(Boolean).join(" ");
  if (addressLine) formData.append("address", addressLine);
  if (elder.address?.city) formData.append("city", elder.address.city);
  if (elder.address?.state) formData.append("state", elder.address.state);
  if (elder.address?.zipCode) formData.append("zipCode", elder.address.zipCode);

  // Arquivo (backend espera "avatar")
  if (elder.avatarFile) {
    formData.append("avatar", elder.avatarFile);
  }

  const headers: Record<string, string> = { ...authHeaders() };

  const url = familyId
    ? `${API_BASE}/idosos?familyId=${encodeURIComponent(familyId)}`
    : `${API_BASE}/idosos`;

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Erro ao registrar idoso: ${response.status} ${text}`);
  }

  const created = await response.json();

  // Fallback: guarda local se não houver familyId
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
        familyId: created.familyId ?? created.family_id ?? created.family?.id ?? familyId ?? null,
        conditions: created.medicalConditions ?? created.conditions ?? [],
      };

      const exists = Array.isArray(arr) && arr.some((x: any) => x?.id === created.id);
      const next = exists ? arr : [...(Array.isArray(arr) ? arr : []), minimal];
      localStorage.setItem(key, JSON.stringify(next));
    }
  } catch {
    /* ignore */
  }

  return normalizeElder(created);
}

/* ==============================
 * READ (by id)
 * ============================== */
export async function getElderById(id: string): Promise<Elder> {
  const res = await fetch(`${API_BASE}/idosos/${encodeURIComponent(id)}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    method: "GET",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Erro ao buscar idoso: ${res.status} ${text}`);
  }
  const data = await res.json();
  return normalizeElder(data);
}

/* ==============================
 * LIST (todos)
 * ============================== */
export async function listElders(): Promise<Elder[]> {
  const res = await fetch(`${API_BASE}/idosos`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    method: "GET",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Erro ao listar idosos: ${res.status} ${text}`);
  }
  const arr = await res.json();
  return Array.isArray(arr) ? arr.map(normalizeElder) : [];
}

/* ==============================
 * UPDATE
 * - Se houver avatarFile, envia multipart (FileInterceptor no PATCH)
 * - Senão, envia JSON
 * ============================== */
export async function updateElder(
  id: string,
  payload: {
    name?: string;
    birthdate?: string; // ISO
    medicalConditions?: string; // JSON string
    medications?: string; // JSON string
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  },
  avatarFile?: File | null
): Promise<Elder> {
  const url = `${API_BASE}/idosos/${encodeURIComponent(id)}`;

  if (avatarFile) {
    const fd = new FormData();
    Object.entries(payload).forEach(([k, v]) => {
      if (v !== undefined && v !== null) fd.append(k, String(v));
    });
    fd.append("avatar", avatarFile);

    const res = await fetch(url, {
      method: "PATCH",
      headers: {
        ...authHeaders(), // não setar Content-Type com FormData
      },
      body: fd,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Erro ao atualizar idoso (multipart): ${res.status} ${text}`);
    }
    const data = await res.json();
    return normalizeElder(data);
  } else {
    const res = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Erro ao atualizar idoso: ${res.status} ${text}`);
    }
    const data = await res.json();
    return normalizeElder(data);
  }
}

/* ==============================
 * DELETE
 * ============================== */
export async function deleteElder(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/idosos/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: {
      ...authHeaders(),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Erro ao deletar idoso: ${res.status} ${text}`);
  }
}
