
//pages/ElderRegistration FOR EXAMPLE OF HOW TO CREATE AN EDIT PAGE
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  MapPin,
  Heart,
  CalendarIcon,
  ArrowLeft,
  ArrowRight,
  Check,
  Plus,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button-variants";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ptBR } from "date-fns/locale"; // precisa instalar: npm i date-fns
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/hooks/use-toast";
import { useAppStore } from "@/lib/stores/appStore";
import type { Elder } from "@/lib/types";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { createElder } from "@/lib/api/elders";
import { AvatarInput } from "@/components/avatar-input";
import { getAdressByCEP } from "@/lib/api/getAdressByCEP";

const commonConditions = [
  "Diabetes",
  "Hipertensão",
  "Alzheimer",
  "Demência",
  "Artrite",
  "Osteoporose",
  "Depressão",
  "Ansiedade",
  "Problemas cardíacos",
  "AVC",
  "Parkinson",
  "Problemas de visão",
];

const commonMedications = [
  "Metformina",
  "Losartan",
  "Atenolol",
  "Sinvastatina",
  "Omeprazol",
  "Donepezil",
  "Sertralina",
  "Paracetamol",
  "Ibuprofeno",
  "Insulina",
];

export default function ElderRegistration() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setSelectedElder } = useAppStore();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<Elder>>({
    name: "",
    avatarFile: null,
    birthDate: new Date(),
    conditions: [],
    medications: [],
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      number: "",
    },
    preferences: {
      gender: "any",
      language: ["Portuguese"],
      specialNeeds: [],
    },
  });

  const [newCondition, setNewCondition] = useState("");
  const [newMedication, setNewMedication] = useState("");

  const handleGetAdress = async (cep: string) => {
    const endereco = await getAdressByCEP(cep);
    if (endereco?.address) {
      setFormData((prev) => ({
        ...prev,
        address: {
          city: endereco.city,
          state: endereco.state,
          street: endereco.address,
          zipCode: endereco.cep,
          number: "",
        },
      }));
    }
  };
  const addCondition = (condition: string) => {
    if (condition && !formData.conditions?.includes(condition)) {
      setFormData((prev) => ({
        ...prev,
        conditions: [...(prev.conditions || []), condition],
      }));
    }
    setNewCondition("");
  };

  const removeCondition = (condition: string) => {
    setFormData((prev) => ({
      ...prev,
      conditions: prev.conditions?.filter((c) => c !== condition) || [],
    }));
  };

  const addMedication = (medication: string) => {
    if (medication && !formData.medications?.includes(medication)) {
      setFormData((prev) => ({
        ...prev,
        medications: [...(prev.medications || []), medication],
      }));
    }
    setNewMedication("");
  };

  const removeMedication = (medication: string) => {
    setFormData((prev) => ({
      ...prev,
      medications: prev.medications?.filter((m) => m !== medication) || [],
    }));
  };

  const handleSubmit = async () => {
    try {
      console.log(formData);
      if (!formData.name || !formData.birthDate) {
        toast({
          title: "Erro",
          description: "Preencha os campos obrigatórios",
          variant: "destructive",
        });
        return;
      }

      const data = await createElder(formData);
      console.log(data);
      setSelectedElder(data);

      toast({
        title: "Cadastro realizado!",
        description: "Informações do idoso salvas com sucesso",
      });

      navigate("/");
    } catch {
      toast({
        title: "Erro",
        description: "Falha ao salvar informações",
        variant: "destructive",
      });
    }
  };

  const isStep1Valid = formData.name && formData.birthDate;
  const isStep2Valid = formData.address?.street && formData.address?.city;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => (step === 1 ? navigate(-1) : setStep(step - 1))}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              Cadastro do Idoso
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="w-5 h-5 text-healthcare-light" />
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <AvatarInput
                  value={formData.avatarFile}
                  label="Foto do Idoso"
                  onChange={(file) =>
                    setFormData((prev) => ({ ...prev, avatarFile: file }))
                  }
                />
                <div>
                  <Label htmlFor="name">Nome completo *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Ex: João da Silva"
                  />
                </div>

                <div>
                  <Label>Preferência de gênero do cuidador</Label>
                  <Select
                    value={formData.preferences?.gender}
                    onValueChange={(value: "male" | "female" | "any") =>
                      setFormData((prev) => ({
                        ...prev,
                        preferences: { ...prev.preferences, gender: value },
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Indiferente</SelectItem>
                      <SelectItem value="female">Feminino</SelectItem>
                      <SelectItem value="male">Masculino</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="birthDate">Data de Nascimento *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.birthDate
                          ? formData.birthDate.toLocaleDateString("pt-BR")
                          : "Selecione a data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.birthDate}
                        initialFocus
                        captionLayout="dropdown-years"
                        fromYear={new Date().getFullYear() - 100}
                        toYear={new Date().getFullYear()}
                        locale={ptBR}
                        onSelect={(date) =>
                          setFormData((prev) => ({
                            ...prev,
                            birthDate: date!,
                          }))
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={() => setStep(2)}
              disabled={!isStep1Valid}
              className="w-full"
              variant="healthcare"
            >
              <ArrowRight className="w-4 h-4 ml-2" />
              Continuar
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="w-5 h-5 text-healthcare-light" />
                  Endereço
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="zipCode">CEP</Label>
                  <Input
                    id="zipCode"
                    type="number"
                    value={formData.address?.zipCode}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        address: { ...prev.address!, zipCode: e.target.value },
                      }))
                    }
                    onBlur={() =>
                      handleGetAdress(formData.address?.zipCode || "")
                    }
                    placeholder="00000-000"
                  />
                </div>
                <div className="flex gap-4">
                  <div>
                    <Label htmlFor="street">Rua</Label>
                    <Input
                      id="street"
                      value={formData.address?.street}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          address: { ...prev.address!, street: e.target.value },
                        }))
                      }
                      placeholder="Ex: Rua das Flores"
                    />
                  </div>
                  <div className="w-16">
                    <Label htmlFor="street">Nº</Label>
                    <Input
                      id="street"
                      type="number"
                      value={formData.address?.number}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          address: { ...prev.address!, number: e.target.value },
                        }))
                      }
                      placeholder=""
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="city">Cidade *</Label>
                  <Input
                    id="city"
                    value={formData.address?.city}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        address: { ...prev.address!, city: e.target.value },
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="state">Estado *</Label>
                  <Input
                    id="state"
                    value={formData.address?.state}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        address: { ...prev.address!, state: e.target.value },
                      }))
                    }
                    maxLength={2}
                    placeholder="SP"
                  />
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={() => setStep(3)}
              disabled={!isStep2Valid}
              className="w-full"
              variant="healthcare"
            >
              <ArrowRight className="w-4 h-4 ml-2" />
              Continuar
            </Button>
            <Button
              onClick={() => setStep(1)}
              variant="outline"
              className="w-full"
            >
              Voltar
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Heart className="w-5 h-5 text-healthcare-light" />
                  Condições de Saúde
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Condições existentes</Label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.conditions?.map((condition) => (
                      <Badge
                        key={condition}
                        variant="secondary"
                        className="bg-healthcare-soft text-healthcare-dark"
                      >
                        {condition}
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="ml-1 h-4 w-4 p-0"
                          onClick={() => removeCondition(condition)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      value={newCondition}
                      onChange={(e) => setNewCondition(e.target.value)}
                      placeholder="Digite uma condição"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addCondition(newCondition);
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => addCondition(newCondition)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {commonConditions.map((condition) => (
                      <Button
                        key={condition}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => addCondition(condition)}
                        disabled={formData.conditions?.includes(condition)}
                      >
                        {condition}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Medicações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Medicações atuais</Label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.medications?.map((medication) => (
                      <Badge
                        key={medication}
                        variant="secondary"
                        className="bg-trust-blue/10 text-trust-blue"
                      >
                        {medication}
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="ml-1 h-4 w-4 p-0"
                          onClick={() => removeMedication(medication)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      value={newMedication}
                      onChange={(e) => setNewMedication(e.target.value)}
                      placeholder="Digite uma medicação"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addMedication(newMedication);
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => addMedication(newMedication)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {commonMedications.map((medication) => (
                      <Button
                        key={medication}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => addMedication(medication)}
                        disabled={formData.medications?.includes(medication)}
                      >
                        {medication}
                      </Button>
                    ))}
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
                <Check className="w-4 h-4 mr-2" />
                Finalizar Cadastro
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
