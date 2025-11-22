import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  MapPin,
  ArrowLeft,
  Check,
  ArrowRight,
  Plus,
  X,
  PillBottle,
  GraduationCap,
  ShieldPlus,
  Banknote,
} from "lucide-react";
import { Button } from "@/components/ui/button-variants";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/hooks/use-toast";
import { AvatarInput } from "@/components/avatar-input";
import { getAdressByCEP } from "@/lib/api/getAdressByCEP";
import { useAppStore } from "@/lib/stores/appStore";
import type { Caregiver } from "@/lib/types";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  fetchCaregiverProfile,
  updateCaregiverProfile,
} from "@/lib/api/caregiver";

export default function CaregiverEdition() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser } = useAppStore();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [newSpecialization, setNewSpecialization] = useState("");
  const [formData, setFormData] = useState<Partial<Caregiver>>({
    crm_coren: "",
    bio: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    avatarPath: null,
    userId: "",
    avatarUrl: undefined,
    specializations: [],
    skills: [],
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [noCouncilRegistration, setNoCouncilRegistration] = useState(false);


  const commonSkills = [
    "Administração de medicamentos",
    "Cuidados com a higiene pessoal",
    "Alimentação assistida",
    "Acompanhamento em consultas",
    "Troca de curativos simples",
    "Acompanhamento em atividades externas",
    "Anotação de prontuário ou relatórios diários",
  ];

  const commonSpecializations = [
    "Geriatria",
    "Cuidador de Idosos",
    "Clínica Médica",
    "Medicina de Família e Comunidade",
    "Auxiliar de Enfermagem",
    "Atendente de Enfermagem",
    "Fisiatria e Reabilitação",
    "Cuidados Paliativos Médicos",
    "Cuidador Domiciliar",
    "Pediatria Domiciliar",
    "Cuidador Hospitalar",
    "Técnico em Enfermagem",
    "Técnico em Gerontologia",
    "Técnico em Reabilitação Física",
    "Técnico em Saúde Mental",
  ];

  const addSkills = (skill: string) => {
    if (skill && !formData.skills?.includes(skill)) {
      setFormData((prev) => ({
        ...prev,
        skills: [...(prev.skills || []), skill],
      }));
    }
    setNewSkill("");
  };

  const removeSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills?.filter((c) => c !== skill) || [],
    }));
  };

  const addSpecialization = (specialization: string) => {
    if (specialization && !formData.specializations?.includes(specialization)) {
      setFormData((prev) => ({
        ...prev,
        specializations: [...(prev.specializations || []), specialization],
      }));
    }
    setNewSpecialization("");
  };

  const removeSpecialization = (specialization: string) => {
    setFormData((prev) => ({
      ...prev,
      specializations:
        prev.specializations?.filter((m) => m !== specialization) || [],
    }));
  };

  // Load existing caregiver data
  useEffect(() => {
    const fetchCaregiver = async () => {
      try {
        const caregiver = await fetchCaregiverProfile(currentUser!.id);
        setFormData({
          crm_coren: caregiver.crm_coren || "",
          bio: caregiver.bio,
          address: caregiver.address,
          city: caregiver.city,
          state: caregiver.state,
          zipCode: caregiver.zipCode,
          avatarPath: caregiver.avatarPath,
          userId: caregiver.userId,
          avatarUrl: caregiver.avatarUrl,
          skills: caregiver.skills || [],
          specializations: caregiver.specializations || [],
          priceRange: caregiver.priceRange || "",
          experience: caregiver.experience || "",
        });
      } catch (error) {
        console.error("Error loading caregiver:", error);
      }
    };

    if (currentUser?.role === "CAREGIVER") {
      fetchCaregiver();
    }
  }, []);

  const handleGetAdress = async (cep: string) => {
    const endereco = await getAdressByCEP(cep);
    if (endereco?.address) {
      setFormData((prev) => ({
        ...prev,
        address: endereco.address,
        city: endereco.city,
        state: endereco.state,
        zipCode: endereco.cep,
      }));
    }
  };

  const handleSubmit = async () => {
    if (!currentUser?.id) return;
    setLoading(true);

    const registration = formData.crm_coren?.trim() || "";

    // ✅ Validação local de CRM / COREN / CRP / CREFITO
    // Mantendo um padrão mais "oficial" e preservando o comportamento antigo de CRM/COREN
    if (!noCouncilRegistration && registration) {
      // padrão antigo – para não quebrar nada que já exista no banco
      const legacyCrmCorenPattern =
        /^(CRM|COREN)(-[A-Z]{2})?\s?\d{4,8}$/i;

      // Ex.: CRM-SP 123456 ou CRM/SP 123456
      const crmPattern = /^CRM[-\/ ]?[A-Z]{2}\s?\d{4,6}$/i;

      // Ex.: COREN-SP 123456 ou COREN/SP 123456
      const corenPattern = /^COREN[-\/ ]?[A-Z]{2}[- ]?\d{4,6}$/i;

      // Ex.: CRP 06/12345 (06 = regional, / número) :contentReference[oaicite:0]{index=0}
      const crpPattern = /^CRP\s?\d{2}\/\d{4,6}$/i;

      // Ex.: CREFITO-4 123456-F ou CREFITO-4/123456-F :contentReference[oaicite:1]{index=1}
      const crefitoPattern =
        /^CREFITO-?\d{1,2}[-\/ ]?\d{4,6}-?[A-Z]{1,3}$/i;

      const isValid =
        crmPattern.test(registration) ||
        corenPattern.test(registration) ||
        crpPattern.test(registration) ||
        crefitoPattern.test(registration) ||
        legacyCrmCorenPattern.test(registration); // mantém a lógica original de CRM/COREN

      if (!isValid) {
        toast({
          title: "Registro profissional inválido",
          description:
            'Use um formato válido, por exemplo: "CRM-SP 123456", "COREN-SP 123456", "CRP 06/12345" ou "CREFITO-4 123456-F". Se você não possui registro, marque a opção "Não possuo registro".',
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
    }

    try {
      const normalizedCrmCoren = noCouncilRegistration ? "" : registration;

      const form = new FormData();
      form.append("crm_coren", normalizedCrmCoren);
      form.append("bio", formData.bio || "");
      form.append("address", formData.address || "");
      form.append("city", formData.city || "");
      form.append("state", formData.state || "");
      form.append("zipCode", formData.zipCode || "");
      form.append("skills", JSON.stringify(formData.skills || []));
      form.append(
        "specializations",
        JSON.stringify(formData.specializations || [])
      );
      form.append("priceRange", formData.priceRange || "");
      form.append("experience", formData.experience || "");

      if (avatarFile) form.append("avatar", avatarFile);

      await updateCaregiverProfile(
        formData.userId!,
        { ...formData, crm_coren: normalizedCrmCoren },
        avatarFile || undefined
      );

      toast({
        title: "Perfil atualizado!",
        description: "As informações foram salvas com sucesso.",
      });

      navigate("/");
    } catch (error) {
      console.error("Error updating caregiver:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isStep1Valid =
    !!formData.bio && (!!formData.crm_coren || noCouncilRegistration);
  const isStep2Valid = formData.address && formData.city && formData.state;
  const isStep3Valid = formData.skills && formData.specializations;
  const isStep4Valid = formData.priceRange && formData.experience;

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
              Edição do Cuidador
            </h1>
            <p className="text-sm text-muted-foreground">Passo {step} de 4</p>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          {[1, 2, 3, 4].map((num) => (
            <div
              key={num}
              className={`h-2 flex-1 rounded-full transition-colors ${step >= num ? "bg-healthcare-light" : "bg-muted"
                }`}
            />
          ))}
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="w-5 h-5 text-healthcare-light" />
                  Dados Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <AvatarInput
                  value={avatarFile}
                  label="Foto de Perfil"
                  onChange={(file) => setAvatarFile(file)}
                  defaultUrl={formData.avatarUrl || undefined}
                />

                {/* 🔄 BLOCO NOVO DE REGISTRO PROFISSIONAL */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="crm_coren" className="mb-2">
                      Registro profissional
                    </Label>
                    <span className="text-xs text-muted-foreground">
                      CRM, COREN, CRP ou CREFITO
                    </span>
                  </div>

                  <Input
                    id="crm_coren"
                    value={formData.crm_coren || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        crm_coren: e.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="Ex.: CRM-SP 123456, COREN-SP 123456, CRP 06/12345, CREFITO-4 123456-F"
                    disabled={noCouncilRegistration}
                  />

                  <div className="flex items-center gap-2">
                    <input
                      id="no_council_registration"
                      type="checkbox"
                      className="h-4 w-4 rounded border-muted-foreground"
                      checked={noCouncilRegistration}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setNoCouncilRegistration(checked);
                        if (checked) {
                          setFormData((prev) => ({
                            ...prev,
                            crm_coren: "",
                          }));
                        }
                      }}
                    />
                    <Label
                      htmlFor="no_council_registration"
                      className="text-xs text-muted-foreground"
                    >
                      Não possuo registro em CRM, COREN, CRP ou CREFITO
                    </Label>
                  </div>
                </div>

                {/* 🌟 Biografia continua igual */}
                <div>
                  <Label htmlFor="bio" className="mb-2">
                    Biografia
                  </Label>
                  <Textarea
                    id="bio"
                    value={formData.bio || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, bio: e.target.value }))
                    }
                    placeholder="Fale um pouco sobre você"
                    className="h-32  text-wrap"
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
              <ArrowRight className="w-4 h-4 ml-2" />
              Continuar
            </Button>
          </div>
        )}

        {/* Step 2 */}
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
                    value={formData.zipCode || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        zipCode: e.target.value,
                      }))
                    }
                    onBlur={() => handleGetAdress(formData.zipCode || "")}
                    placeholder="00000-000"
                  />
                </div>

                <div>
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    value={formData.address || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    placeholder="Rua, número"
                  />
                </div>

                <div>
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={formData.city || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, city: e.target.value }))
                    }
                    placeholder="Ex: São Paulo"
                  />
                </div>

                <div>
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    value={formData.state || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        state: e.target.value,
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
                disabled={!isStep1Valid}
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
              <Button
                onClick={handleSubmit}
                disabled={!isStep2Valid || loading}
                className="w-full"
                variant="success"
              >
                {loading ? "Salvando..." : <Check className="w-4 h-4 mr-2" />}
                {loading ? "" : "Salvar Alterações"}
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <PillBottle className="w-5 h-5 text-healthcare-light" />
                  Habilidades e Competências
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="mb-2">Habilidades Existentes</Label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.skills?.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="bg-healthcare-soft text-healthcare-dark"
                      >
                        {skill}
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="ml-1 h-4 w-4 p-0"
                          onClick={() => removeSkill(skill)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Digite uma habilidade/competência"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSkills(newSkill);
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => addSkills(newSkill)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {commonSkills.map((skill) => (
                      <Button
                        key={skill}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => addSkills(skill)}
                        disabled={formData.skills?.includes(skill)}
                      >
                        {skill}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <GraduationCap className="w-5 h-5 text-healthcare-light" />
                  Especialização e Cursos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="mb-2">Especializações atuais</Label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.specializations?.map((specialization) => (
                      <Badge
                        key={specialization}
                        variant="secondary"
                        className="bg-trust-blue/10 text-trust-blue"
                      >
                        {specialization}
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="ml-1 h-4 w-4 p-0"
                          onClick={() => removeSpecialization(specialization)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      value={newSpecialization}
                      onChange={(e) => setNewSpecialization(e.target.value)}
                      placeholder="Digite uma especialização"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSpecialization(newSpecialization);
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => addSpecialization(newSpecialization)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {commonSpecializations.map((specialization) => (
                      <Button
                        key={specialization}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => addSpecialization(specialization)}
                        disabled={formData.specializations?.includes(
                          specialization
                        )}
                      >
                        {specialization}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Button
                onClick={() => setStep(4)}
                disabled={!isStep3Valid}
                className="w-full"
                variant="healthcare"
              >
                <ArrowRight className="w-4 h-4 ml-2" />
                Continuar
              </Button>
              <Button
                onClick={() => setStep(2)}
                variant="outline"
                className="w-full"
              >
                Voltar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!isStep3Valid || loading}
                className="w-full"
                variant="success"
              >
                {loading ? "Salvando..." : <Check className="w-4 h-4 mr-2" />}
                {loading ? "" : "Salvar Alterações"}
              </Button>
            </div>
          </div>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ShieldPlus className="w-5 h-5 text-healthcare-light" />
                  Profissional
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="xp" className="mb-2">
                    Tempo de Experiência
                  </Label>
                  <Input
                    id="xp"
                    type="text"
                    value={formData.experience || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        experience: e.target.value,
                      }))
                    }
                    onBlur={() => handleGetAdress(formData.zipCode || "")}
                    placeholder="5 anos"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Banknote className="w-5 h-5 text-healthcare-light" />
                  Financeiro
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="price" className="mb-2">
                    Preço médio do serviço por hora
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.priceRange || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        priceRange: e.target.value,
                      }))
                    }
                    placeholder="R$ 25 Hora"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button
                onClick={() => setStep(3)}
                variant="outline"
                className="w-full"
              >
                Voltar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!isStep4Valid || loading}
                className="w-full"
                variant="success"
              >
                {loading ? "Salvando..." : <Check className="w-4 h-4 mr-2" />}
                {loading ? "" : "Salvar Alterações"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
