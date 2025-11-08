import { api } from "./api";

type bookingData =  {
    caregiverId: string;
    elderId: string;
    familyId: string;
    date: Date;
    startTime: string;
    duration: number;
    emergency: boolean;
    notes: string;
    totalPrice: number;
}
export async function requestAppointment(formData:bookingData){
    console.log("chamou",formData)
    const response = await api.post('/appointments', {
        ...formData,
        date: formData.date.toISOString().split('T')[0],
    })
    console.log("RESPOSTA",response);
    return response
}