import type { Elder } from "@/lib/types";
import { API_BASE } from "./config";

export async function createElder(elder: Partial<Elder>) {
  const formData = new FormData();

  formData.append("name", elder.name ?? "");
  if (elder.birthDate)
    formData.append("birthdate", elder.birthDate.toISOString());
  if (elder.conditions)
    formData.append("conditions", JSON.stringify(elder.conditions));
  if (elder.medications)
    formData.append("medications", JSON.stringify(elder.medications));
  if (elder.address?.street)
    formData.append(
      "address",
      elder.address.street + " " + elder.address.number || ""
    );
  if (elder.address?.city) formData.append("city", elder.address.city);
  if (elder.address?.state) formData.append("state", elder.address.state);
  if (elder.address?.zipCode) formData.append("zipCode", elder.address.zipCode);

  // Arquivo
  if (elder.avatarFile) {
    formData.append("avatar", elder.avatarFile); // 👈 precisa ser "avatar"
  }

  console.log(formData, "PAYLOAD");

  const response = await fetch(`${API_BASE}/idosos`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Erro ao registrar idoso");
  }

  return response.json();
}
