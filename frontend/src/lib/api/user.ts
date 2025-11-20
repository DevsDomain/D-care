// src/lib/api/user.ts
import { api } from "@/lib/api/api";

export type UpdateUserPayload = {
  name?: string;
  email?: string;
  phone?: string;
  preferences?: {
    notifications?: boolean;
    emailUpdates?: boolean;
    emergencyAlerts?: boolean;
  };
};

export async function updateUserProfile(
  userId: string,
  payload: UpdateUserPayload,
  avatarFile?: File
) {
  const formData = new FormData();

  if (payload.name !== undefined) formData.append("name", payload.name);
  if (payload.email !== undefined) formData.append("email", payload.email);
  if (payload.phone !== undefined) formData.append("phone", payload.phone);

  if (payload.preferences) {
    formData.append(
      "preferences",
      JSON.stringify(payload.preferences)
    );
  }

  if (avatarFile) {
    formData.append("avatar", avatarFile);
  }

  // ⚠️ AQUI É A ROTA REAL DO BACKEND
  // Use o mesmo padrão que você seguiu no resto da API:
  // Exemplo mais provável:
  //   PATCH /users/:id
  const { data } = await api.patch(
    `/users/${userId}`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );

  return data; // deve ser o usuário atualizado
}
