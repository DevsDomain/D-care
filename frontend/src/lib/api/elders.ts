import type { Elder } from "@/lib/types";
import { API_BASE } from "./config";

export async function createElder(elder: Partial<Elder>) {
  const elderPayload = {
    name: elder.name,
    birthdate: elder.birthDate?.toISOString(),
    conditions: elder.conditions,
    medications: elder.medications,
    address: elder.address?.street,
    city: elder.address?.city,
    state: elder.address?.state,
    zipCode: elder.address?.zipCode,
  };

  const response = await fetch(`${API_BASE}/idosos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(elderPayload),
  });

  if (!response.ok) {
    throw new Error("Erro ao registrar idoso");
  }

  return response.json();
}
