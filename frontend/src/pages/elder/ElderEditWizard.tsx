// src/pages/elder/ElderEditWizard.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  User,
  MapPin,
  Heart,
  Calendar as CalendarIcon,
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
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/hooks/use-toast";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { AvatarInput } from "@/components/avatar-input";

import { getAdressByCEP } from "@/lib/api/getAdressByCEP";
import { getElderById, updateElder } from "@/lib/api/elders";

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

// Converte qualquer coisa (array, JSON string, CSV) em array
function toArray(val: any): any[] {
  if (!val && val !== 0) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    const s = val.trim();
    if (!s) return [];
    try {
      const parsed = JSON.parse(s);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      /* tenta CSV */
    }
    return s
      .split(/[;,]/)
      .map((x) => x.trim())
      .filter(Boolean);
  }
  return [val];
}

export default function ElderEditWizard() {
  const { elderId } = useParams<{ elderId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [newCondition, setNewCondition] = useState("");
  const [newMedication, setNewMedication] = useState("");

  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [formData, setFormData] = useState<{
    name: string;
    birthDate: Date | null;
    photoUrl: string | null;
    address: { street: string; number: string; city: string; state: string; zipCode: string };
    conditions: string[];
    medications: string[];
  }>({
    name: "",
    birthDate: null,
    photoUrl: null,
    address: { street: "", number: "", city: "", state: "", zipCode: "" },
    conditions: [],
    medications: [],
  });

  // Carrega dados atuais
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!elderId) return;
      try {
        setLoading(true);
        const elder = await getElderById(elderId);

        const birth = elder.birthDate ?? elder.birthdate ?? null;
        const conditions = toArray(
          elder.conditions ??
            elder.healthConditions ??
            elder.medicalConditions ??
            elder.clinicalConditions ??
            elder.comorbidities ??
            elder?.medicalHistory?.conditions ??
            []
        ).map((c: any) => (typeof c === "string" ? c : c?.name ?? String(c)));

        const medications = toArray(elder.medications ?? []);

        if (mounted) {
          setFormData({
            name: elder.name ?? "",
            birthDate: birth ? new Date(birth) : null,
            photoUrl: elder.photo ?? elder.avatarPath ?? null,
            address: {
              street: elder.address ?? "",
              number: elder.number ?? "",
              city: elder.city ?? "",
              state: elder.state ?? "",
              zipCode: elder.zipCode ?? "",
            },
            conditions,
            medications,
          });
        }
      } catch (e: any) {
        console.error(e);
        toast({
          title: "Erro",
          description: "Falha ao carregar dados do idoso.",
          variant: "destructive",
        });
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [elderId, toast]);

  const isStep1Valid = useMemo(
    () => !!formData.name && !!formData.birthDate,
    [formData.name, formData.birthDate]
  );

  const isStep2Valid = useMemo(
    () => !!formData.address.city && !!formData.address.state,
    [formData.address.city, formData.address.state]
  );

  const addCondition = (c: string) => {
    const v = c.trim();
    if (!v) return;
    if (!formData.conditions.includes(v)) {
      setFormData((prev) => ({
        ...prev,
        conditions: [...prev.conditions, v],
      }));
    }
    setNewCondition("");
  };

  const removeCondition = (c: string) => {
    setFormData((prev) => ({
      ...prev,
      conditions: prev.conditions.filter((x) => x !== c),
    }));
  };

  const addMedication = (m: string) => {
    const v = m.trim();
    if (!v) return;
    if (!formData.medications.includes(v)) {
      setFormData((prev) => ({
        ...prev,
        medications: [...prev.medications, v],
      }));
    }
    setNewMedication("");
  };

  const removeMedication = (m: string) => {
    setFormData((prev) => ({
      ...prev,
      medications: prev.medications.filter((x) => x !== m),
    }));
  };

  const handleGetAdress = async (cep: string) => {
    try {
      const endereco = await getAdressByCEP(cep);
      if (endereco?.address) {
        setFormData((prev) => ({
          ...prev,
          address: {
            ...prev.address,
            city: endereco.city || prev.address.city,
            state: endereco.state || prev.address.state,
            street: endereco.address || prev.address.street,
            zipCode: endereco.cep || prev.address.zipCode,
          },
        }));
      }
    } catch {
      /* ignore */
    }
  };

  const handleSave = async () => {
    if (!elderId) return;

    if (!isStep1Valid) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e data de nascimento são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      await updateElder(elderId, {
        name: formData.name,
        birthDate: formData.birthDate!,
        avatarFile: avatarFile || undefined,
        conditions: formData.conditions,
        medications: formData.medications,
        address: {
          street: formData.address.street,
          number: formData.address.number,
          city: formData.address.city,
          state: formData.address.state,
          zipCode: formData.address.zipCode,
        },
      });

      toast({
        title: "Dados atualizados!",
        description: "As informações foram salvas com sucesso.",
      });

      navigate("/");
    } catch (e: any) {
      console.error(e);
      toast({
        title: "Erro ao salvar",
        description: e?.message ?? "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">Carregando dados…</p>
      </div>
    );
  }

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
              Edição do Idoso
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
        {/* STEP 1 – Dados pessoais */}
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
                  value={avatarFile}
                  label="Foto do Idoso"
                  onChange={(file) => setAvatarFile(file)}
                  defaultUrl={formData.photoUrl ?? undefined}
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
                  <Label htmlFor="birthdate">Data de Nascimento *</Label>
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
                        selected={formData.birthDate ?? undefined}
                        initialFocus
                        captionLayout="dropdown-years"
                        fromYear={new Date().getFullYear() - 100}
                        toYear={new Date().getFullYear()}
                        locale={ptBR}
                        onSelect={(date) =>
                          setFormData((prev) => ({
                            ...prev,
                            birthDate: date ?? null,
                          }))
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button
                onClick={() => setStep(2)}
                disabled={!isStep1Valid}
                className="w-full"
                variant="healthcare"
              >
                <ArrowRight className="w-4 h-4 ml-2" />
                Continuar
              </Button>
              <Button onClick={handleSave} disabled={!isStep1Valid || saving} className="w-full" variant="success">
                {saving ? "Salvando..." : <Check className="w-4 h-4 mr-2" />}
                {saving ? "" : "Salvar Alterações"}
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2 – Endereço */}
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
                    value={formData.address.zipCode}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        address: { ...prev.address, zipCode: e.target.value },
                      }))
                    }
                    onBlur={() => handleGetAdress(formData.address.zipCode)}
                    placeholder="00000-000"
                  />
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="street">Rua</Label>
                    <Input
                      id="street"
                      value={formData.address.street}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          address: { ...prev.address, street: e.target.value },
                        }))
                      }
                      placeholder="Ex: Rua das Flores"
                    />
                  </div>
                  <div className="w-24">
                    <Label htmlFor="number">Nº</Label>
                    <Input
                      id="number"
                      value={formData.address.number}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          address: { ...prev.address, number: e.target.value },
                        }))
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="city">Cidade *</Label>
                  <Input
                    id="city"
                    value={formData.address.city}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        address: { ...prev.address, city: e.target.value },
                      }))
                    }
                    placeholder="Ex: São Paulo"
                  />
                </div>

                <div>
                  <Label htmlFor="state">Estado *</Label>
                  <Input
                    id="state"
                    value={formData.address.state}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        address: { ...prev.address, state: e.target.value.toUpperCase() },
                      }))
                    }
                    maxLength={2}
                    placeholder="SP"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button
                onClick={() => setStep(3)}
                disabled={!isStep2Valid}
                className="w-full"
                variant="healthcare"
              >
                <ArrowRight className="w-4 h-4 ml-2" />
                Continuar
              </Button>
              <Button onClick={() => setStep(1)} variant="outline" className="w-full">
                Voltar
              </Button>
              <Button
                onClick={handleSave}
                disabled={!isStep1Valid || saving}
                className="w-full"
                variant="success"
              >
                {saving ? "Salvando..." : <Check className="w-4 h-4 mr-2" />}
                {saving ? "" : "Salvar Alterações"}
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3 – Saúde */}
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
                    {formData.conditions.map((condition) => (
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
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addCondition(newCondition);
                        }
                      }}
                    />
                    <Button variant="outline" size="icon" onClick={() => addCondition(newCondition)}>
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
                        disabled={formData.conditions.includes(condition)}
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
                    {formData.medications.map((medication) => (
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
                      onKeyDown={(e) => {
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
                        disabled={formData.medications.includes(medication)}
                      >
                        {medication}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button onClick={handleSave} disabled={!isStep1Valid || saving} className="w-full" variant="healthcare">
                {saving ? "Salvando..." : <Check className="w-4 h-4 mr-2" />}
                {saving ? "" : "Salvar Alterações"}
              </Button>
              <Button onClick={() => setStep(2)} variant="outline" className="w-full">
                Voltar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
