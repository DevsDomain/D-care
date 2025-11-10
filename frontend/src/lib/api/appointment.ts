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
  console.log("chamou", formData);

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
    date: dateString,              // casa com o DTO: @IsISO8601 'YYYY-MM-DD'
    startTime: formData.startTime, // 'HH:MM'
    duration: formData.duration,   // MINUTOS (o service já trata)
    emergency: formData.emergency ?? false,
    notes: formData.notes ?? "",
    totalPrice: formData.totalPrice,
  };

  // mesma base usada no BookingList: api.get("appointments?...").
  return api.post("appointments", payload);
};
