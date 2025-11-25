// frontend/src/lib/api/appointment.ts
import { api } from "@/lib/api/api";

export type AppointmentRequest = {
  caregiverId: string;
  elderId: string;
  familyId: string;
  // pode vir como Date (versão antiga) ou string 'YYYY-MM-DD' (versão nova)
  date: string | Date;
  // 'HH:MM'
  startTime: string;
  // duração em MINUTOS (já está assim no BookingForm)
  duration: number;
  emergency?: boolean;
  notes?: string;
  totalPrice: number;
};

export const requestAppointment = async (formData: AppointmentRequest) => {

  // 👉 Se vier string, usa do jeito que está (já no formato 'YYYY-MM-DD')
  // 👉 Se vier Date, converte para 'YYYY-MM-DD'
  const dateString =
    typeof formData.date === "string"
      ? formData.date
      : formData.date.toISOString().slice(0, 10); // pega só 'YYYY-MM-DD'

  const payload = {
    caregiverId: formData.caregiverId,
    elderId: formData.elderId,
    familyId: formData.familyId,
    date: dateString, // casa com o DTO: @IsISO8601 'YYYY-MM-DD'
    startTime: formData.startTime, // 'HH:MM'
    duration: formData.duration, // MINUTOS (o service já trata)
    emergency: formData.emergency ?? false,
    notes: formData.notes ?? "",
    totalPrice: formData.totalPrice,
  };

  // mesma base usada no BookingList: api.get("appointments?...").
  return api.post("appointments", payload);
};

export async function fetchAppointments(params: {
  familyId?: string;
  caregiverId?: string;
}) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v != null) as [string, string][]
  ).toString();
  const { data } = await api.get(`/appointments${qs ? `?${qs}` : ""}`);
  return data;
}

/**
 * Atualiza o status do appointment no backend.
 * statusApi deve ser um dos valores: 'PENDING'|'ACCEPTED'|'REJECTED'|'CANCELLED'|'COMPLETED'
 */
export async function updateAppointmentStatus(
  appointmentId: string,
  statusApi: string
) {
  const { data } = await api.patch(`/appointments/${appointmentId}/status`, {
    status: statusApi,
  });
  return data;
}
