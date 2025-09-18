import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Phone,
  MapPin,
  Heart,
  Shield,
  ArrowLeft,
  ArrowRight,
  Check,
  Plus,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button-variants";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
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
    age: 65,
    conditions: [],
    medications: [],
    emergencyContact: {
      name: "",
      phone: "",
      relation: "",
    },
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
    },
    preferences: {
      gender: "any",
      language: ["Portuguese"],
      specialNeeds: [],
    },
  });

  const [newCondition, setNewCondition] = useState("");
  const [newMedication, setNewMedication] = useState("");

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
      const elder: Elder = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        ...(formData as Elder),
      };

      // In a real app, this would save to backend
      setSelectedElder(elder);

      toast({
        title: "Cadastro realizado!",
        description: "Informações do idoso salvas com sucesso",
      });

      navigate("/");
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao salvar informações",
        variant: "destructive",
      });
    }
  };

  const isStep1Valid = formData.name && formData.age;
  const isStep2Valid = formData.address?.street && formData.address?.city;
  const isStep3Valid =
    formData.emergencyContact?.name && formData.emergencyContact?.phone;

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
            <p className="text-sm text-muted-foreground">Passo {step} de 4</p>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-4 flex gap-2">
          {[1, 2, 3, 4].map((num) => (
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
                  <Label htmlFor="age">Idade *</Label>
                  <Input
                    id="age"
                    type="number"
                    min="1"
                    max="120"
                    value={formData.age}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        age: parseInt(e.target.value),
                      }))
                    }
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
                  <Label htmlFor="street">Rua e número *</Label>
                  <Input
                    id="street"
                    value={formData.address?.street}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        address: { ...prev.address!, street: e.target.value },
                      }))
                    }
                    placeholder="Ex: Rua das Flores, 123"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                </div>

                <div>
                  <Label htmlFor="zipCode">CEP</Label>
                  <Input
                    id="zipCode"
                    value={formData.address?.zipCode}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        address: { ...prev.address!, zipCode: e.target.value },
                      }))
                    }
                    placeholder="00000-000"
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
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="w-5 h-5 text-healthcare-light" />
                  Contato de Emergência
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="emergencyName">Nome *</Label>
                  <Input
                    id="emergencyName"
                    value={formData.emergencyContact?.name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        emergencyContact: {
                          ...prev.emergencyContact!,
                          name: e.target.value,
                        },
                      }))
                    }
                    placeholder="Ex: Maria da Silva"
                  />
                </div>

                <div>
                  <Label htmlFor="emergencyPhone">Telefone *</Label>
                  <Input
                    id="emergencyPhone"
                    type="tel"
                    value={formData.emergencyContact?.phone}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        emergencyContact: {
                          ...prev.emergencyContact!,
                          phone: e.target.value,
                        },
                      }))
                    }
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div>
                  <Label htmlFor="relation">Parentesco</Label>
                  <Input
                    id="relation"
                    value={formData.emergencyContact?.relation}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        emergencyContact: {
                          ...prev.emergencyContact!,
                          relation: e.target.value,
                        },
                      }))
                    }
                    placeholder="Ex: Filha, Filho, Cônjuge"
                  />
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={() => setStep(4)}
              disabled={!isStep3Valid}
              className="w-full"
              variant="healthcare"
            >
              <ArrowRight className="w-4 h-4 ml-2" />
              Continuar
            </Button>
          </div>
        )}

        {step === 4 && (
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
                onClick={() => setStep(3)}
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
