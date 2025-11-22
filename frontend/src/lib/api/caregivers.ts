import { API_BASE } from "./config";

interface SearchCaregiversParams {
  zipCode?: string;
  maxDistance?: number;
  minRating?: number;
  specialization?: string;
  availableForEmergency?: boolean;
}

/**
 * Faz uma busca por cuidadores próximos com base no CEP do usuário logado
 * ou no CEP passado via parâmetro.
 */
export async function searchCaregivers(params: SearchCaregiversParams = {}) {
  let currentUser: any = null;

  try {
    const rawUser = localStorage.getItem("user");
    currentUser = rawUser ? JSON.parse(rawUser) : null;
  } catch {
    console.warn("⚠️ Não foi possível ler o usuário do localStorage");
  }

  // Se o usuário for uma família e tiver CEP de algum idoso, usamos como fallback
  const fallbackZip =
    currentUser?.elders?.[0]?.zipCode ?? currentUser?.zipCode ?? null;

  const zipCode = params.zipCode ?? fallbackZip;
  if (!zipCode) {
    throw new Error(
      "CEP não encontrado. Informe manualmente ou associe um idoso com endereço."
    );
  }

  // Token de autenticação
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
  return data;
}
