import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  CalendarDays,
  FileText,
  AlertTriangle,
  ArrowLeft,
  Check,
  CalendarIcon,
  Users,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";

import { Button } from "@/components/ui/button-variants";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/hooks/use-toast";
import { useAppStore } from "@/lib/stores/appStore";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ptBR } from "date-fns/locale/pt-BR";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api } from "@/lib/api/api";
import { AgeCalculator } from "@/components/hooks/useAge";
import { requestAppointment } from "@/lib/api/appointment";

const timeSlots = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
  "22:00",
  "23:00",
];

export default function BookingForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { selectedElder, setLoading } = useAppStore();
  const { currentUser, setCurrentUser } = useAppStore();
  const { caregiverId } = useParams<{ caregiverId: string }>();
  const { caregiverPrice } = useParams<{ caregiverPrice: string }>();
  const [loadingElders, setLoadingElders] = useState(false);
  const [elderSelected, setElderSelected] = useState<ElderApi>();
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    date: new Date(),
    startTime: "",
    duration: 4,
    emergency: false,
    elderId: selectedElder?.id || "",
    caregiverId: caregiverId || "",
    familyId: currentUser?.id || "",
    notes: "",
    address: {
      street: selectedElder?.address.street || "",
      city: selectedElder?.address.city || "",
      state: selectedElder?.address.state || "",
      zipCode: selectedElder?.address.zipCode || "",
    },
  });

  type ElderApi = {
    id: string;
    familyId?: string | null;
    family?: { id?: string | null } | null;
    name: string;
    birthdate?: Date | undefined;
    birthDate?: Date | undefined;
    avatarPath?: string | undefined;
  };

  // Busca a lista de idosos (inclui condições normalizadas)
  useEffect(() => {
    const fetchElders = async () => {
      try {
        setLoadingElders(true);

        // 3. Constroi a URL correta (com query param, como definimos antes)
        const url = `idosos/family?familyId=${currentUser?.id}`;

        const { data } = await api.get<ElderApi[]>(url);

        // 5. Atualiza o usuário ATUAL com a lista de idosos vinda da API
        const updatedUser = { ...currentUser, elders: data };

        setCurrentUser(updatedUser);

        // 6. Salva a versão atualizada no localStorage
        try {
          localStorage.setItem("user", JSON.stringify(updatedUser));
        } catch (err) {
          console.warn("Falha ao salvar usuário no localStorage:", err);
        }
      } catch (err: any) {
        console.error("Falha ao buscar idosos:", err?.message ?? err);
      } finally {
        setLoadingElders(false);
      }
    };

    fetchElders();
  }, [currentUser?.id, currentUser?.role, setCurrentUser]); // Dependências estão corretas

  const handleSubmit = async () => {
    if (!currentUser!.id || !currentUser?.elders) {
      toast({
        title: "Error",
        description: "Missing booking information",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log("FORM DATA", formData);
      const bookingData = {
        caregiverId: caregiverId!,
        elderId: elderSelected!.id,
        familyId: elderSelected!.familyId!,
        date: formData.date,
        startTime: formData.startTime,
        duration: formData.duration,
        emergency: formData.emergency,
        notes: formData.notes,
        totalPrice: formData.duration * Number(caregiverPrice),
      };

      const response = await requestAppointment(bookingData);

      if (response.status === 201) {
        toast({
          title: "Solicitação de agendamento enviada",
          description: "O cuidador será notificado sobre sua solicitação!",
        });
        navigate("/bookings");
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to create booking",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isStep1Valid = formData.date && formData.startTime;
  const isStep2Valid = formData.notes.length >= 0;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => (step === 1 ? navigate(-1) : setStep(1))}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              Nova Reserva
            </h1>
            <p className="text-sm text-muted-foreground">Passo {step} de 3</p>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-4 flex gap-2">
          {[1, 2, 3].map((num) => (
            <div
              key={num}
              className={`h-2 flex-1 rounded-full transition-colors ${
                step >= num ? "bg-healthcare-light" : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="p-4 space-y-6">
        {step === 1 && (
          <div className="space-y-6">
            {/* Date & Time */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CalendarDays className="w-5 h-5 text-healthcare-light" />
                  Data e Horário
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="birthDate">Data</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.date
                          ? formData.date.toLocaleDateString("pt-BR")
                          : "Selecione a data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.date}
                        initialFocus
                        captionLayout="dropdown-years"
                        fromYear={new Date().getFullYear() - 100}
                        toYear={new Date().getFullYear()}
                        locale={ptBR}
                        onSelect={(date) =>
                          setFormData((prev) => ({
                            ...prev,
                            date: date || prev.date,
                          }))
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startTime">Horário de Início</Label>
                    <Select
                      value={formData.startTime}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, startTime: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="duration">Duração (horas)</Label>
                    <Select
                      value={formData.duration.toString()}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          duration: parseInt(value),
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[2, 3, 4, 6, 8, 12].map((hours) => (
                          <SelectItem key={hours} value={hours.toString()}>
                            {hours}h
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-medical-critical/5 rounded-xl border border-medical-critical/20">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-medical-critical" />
                    <div>
                      <p className="font-medium text-foreground">
                        Atendimento de Emergência
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Resposta prioritária
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={formData.emergency}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, emergency: checked }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={() => setStep(2)}
              disabled={!isStep1Valid}
              className="w-full"
              variant="healthcare"
            >
              Continuar
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="w-5 h-5 text-healthcare-light" />
                  Observações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  placeholder="Informações importantes sobre o atendimento, medicações, preferências, etc."
                  rows={4}
                />
              </CardContent>
            </Card>

            <CardHeader className="flex">
              <Users className="w-5 h-5 text-healthcare-light" />
              <CardTitle>Selecione um idoso:</CardTitle>
            </CardHeader>
            {/* Select Elder */}
            {loadingElders ? (
              <Card className="p-4">
                <p className="text-sm text-muted-foreground">Carregando...</p>
              </Card>
            ) : (
              (currentUser?.elders ?? []).map((elder: ElderApi) => {
                const age = elder?.birthdate
                  ? `${AgeCalculator(elder.birthdate)} anos`
                  : "Idade não informada";

                return (
                  <Card
                    key={elder.id}
                    className={`healthcare-card cursor-pointer ${
                      elderSelected?.id === elder.id
                        ? "border-2 border-healthcare-light"
                        : ""
                    }`}
                    onClick={() => setElderSelected(elder)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-16 w-16 border-2 border-healthcare-light/20">
                          <AvatarImage
                            src={elder.avatarPath}
                            alt={elder.name}
                          />
                          <AvatarFallback className="bg-healthcare-soft text-healthcare-dark font-semibold text-lg">
                            {elder.name}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg text-foreground mb-1 truncate">
                            {elder.name}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {age}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}

            <Button
              onClick={() => setStep(3)}
              disabled={!isStep2Valid}
              className="w-full"
              variant="healthcare"
            >
              Continuar
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            {/* Confirmation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Check className="w-5 h-5 text-medical-success" />
                  Confirmar Reserva
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Data:</span>
                    <span className="font-medium">
                      {new Date(formData.date).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Horário:</span>
                    <span className="font-medium">
                      {formData.startTime} -{" "}
                      {String(
                        parseInt(formData.startTime.split(":")[0]) +
                          formData.duration
                      ).padStart(2, "0")}
                      :00
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duração:</span>
                    <span className="font-medium">{formData.duration}h</span>
                  </div>

                  {formData.emergency && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Emergência:</span>
                      <span className="font-medium text-medical-critical">
                        Sim
                      </span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-border">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total estimado:</span>
                      <span className="text-healthcare-dark">
                        R${" "}
                        {(formData.duration * Number(caregiverPrice)).toFixed(
                          2
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button
                onClick={handleSubmit}
                className="w-full"
                variant="healthcare"
              >
                Enviar Solicitação
              </Button>
              <Button
                onClick={() => setStep(2)}
                variant="outline"
                className="w-full"
              >
                Voltar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
