import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  MapPin,
  ArrowLeft,
  Plus,
  X,
  Stethoscope,
  GraduationCap,
  Banknote,
  Briefcase,
  ChevronRight,
  Save,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button-variants";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Local state for tags
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
    priceRange: "",
    experience: "",
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [noCouncilRegistration, setNoCouncilRegistration] = useState(false);

  // --- Constants ---
  const commonSkills = [
    "Administração de medicamentos",
    "Higiene pessoal",
    "Alimentação assistida",
    "Acompanhamento médico",
    "Curativos simples",
    "Atividades externas",
    "Relatórios diários",
  ];

  const commonSpecializations = [
    "Geriatria",
    "Cuidador de Idosos",
    "Auxiliar de Enfermagem",
    "Fisiatria",
    "Cuidados Paliativos",
    "Pediatria Domiciliar",
    "Técnico em Enfermagem",
    "Alzheimer e Demência",
    "Mobilidade Reduzida",
  ];

  const navigationItems = [
    { id: "personal", label: "Dados Pessoais", icon: User },
    { id: "address", label: "Localização", icon: MapPin },
    { id: "skills", label: "Habilidades", icon: Stethoscope },
    { id: "professional", label: "Profissional", icon: Briefcase },
  ];

  // --- Logic ---

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

        if (caregiver.bio && !caregiver.crm_coren) {
          setNoCouncilRegistration(true);
        }
      } catch (error) {
        console.error("Error loading caregiver:", error);
        toast({ title: "Erro ao carregar dados", variant: "destructive" });
      } finally {
        setInitialLoading(false);
      }
    };

    if (currentUser?.role === "CAREGIVER") {
      fetchCaregiver();
    }
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const addTag = (
    value: string,
    field: "skills" | "specializations",
    setter: (val: string) => void
  ) => {
    if (value && !formData[field]?.includes(value)) {
      setFormData((prev) => ({
        ...prev,
        [field]: [...(prev[field] || []), value],
      }));
    }
    setter("");
  };

  const removeTag = (value: string, field: "skills" | "specializations") => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field]?.filter((item) => item !== value) || [],
    }));
  };

  const handleGetAdress = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length === 8) {
      const endereco = await getAdressByCEP(cleanCep);
      if (endereco?.address) {
        setFormData((prev) => ({
          ...prev,
          address: endereco.address,
          city: endereco.city,
          state: endereco.state,
          zipCode: endereco.cep,
        }));
      }
    }
  };

  const handleSubmit = async () => {
    if (!currentUser?.id) return;

    // Validation Check
    const requiredFields = {
      bio: "Biografia",
      zipCode: "CEP",
      address: "Endereço",
      city: "Cidade",
      priceRange: "Preço Hora",
      experience: "Experiência",
    };

    const missing = Object.entries(requiredFields).filter(
      ([key]) => !formData[key as keyof Caregiver]
    );

    if (missing.length > 0) {
      toast({
        title: "Campos obrigatórios faltando",
        description: `Por favor preencha: ${missing
          .map((m) => m[1])
          .join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    // Registration Validation Logic
    const registration = formData.crm_coren?.trim() || "";
    if (!noCouncilRegistration && registration) {
      const legacyPattern = /^(CRM|COREN)(-[A-Z]{2})?\s?\d{4,8}$/i;
      const patterns = [
        /^CRM[-\/ ]?[A-Z]{2}\s?\d{4,6}$/i,
        /^COREN[-\/ ]?[A-Z]{2}[- ]?\d{4,6}$/i,
        /^CRP\s?\d{2}\/\d{4,6}$/i,
        /^CREFITO-?\d{1,2}[-\/ ]?\d{4,6}-?[A-Z]{1,3}$/i,
        legacyPattern,
      ];

      if (!patterns.some((p) => p.test(registration))) {
        toast({
          title: "Formato de registro inválido",
          description: "Verifique o formato do seu CRM, COREN, etc.",
          variant: "destructive",
        });
        setLoading(false);
        // Scroll to error
        scrollToSection("personal");
        return;
      }
    }

    try {
      const normalizedCrmCoren = noCouncilRegistration ? "" : registration;

      // FormData construction omitted for brevity, logic remains same
      // ...

      await updateCaregiverProfile(
        formData.userId!,
        { ...formData, crm_coren: normalizedCrmCoren },
        avatarFile || undefined
      );

      toast({
        title: "Perfil atualizado!",
        description: "Seus dados foram salvos com sucesso.",
        className: "bg-green-600 text-white border-none",
      });

      navigate("/");
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-healthcare-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-28">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-full hover:bg-slate-100"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-slate-900">
                Editar dados profissionais
              </h1>
            </div>
          </div>
          <div className="hidden md:block">
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Salvar Alterações
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Sidebar Navigation (Desktop) */}
          <aside className="hidden md:block md:col-span-3 lg:col-span-3">
            <div className="sticky top-24 space-y-1">
              <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Seções
              </p>
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium text-slate-600 rounded-md hover:bg-slate-100 hover:text-healthcare-primary transition-colors text-left group"
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-4 h-4 text-slate-400 group-hover:text-healthcare-primary" />
                    {item.label}
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-50" />
                </button>
              ))}
            </div>
          </aside>

          {/* Form Content */}
          <div className="md:col-span-9 lg:col-span-8 space-y-8">
            {/* SECTION 1: Personal Data */}
            <section id="personal" className="scroll-mt-24 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-5 h-5 text-healthcare-primary" />
                <h2 className="text-xl font-semibold text-slate-800">
                  Dados Pessoais
                </h2>
              </div>
              <Card className="border-none shadow-sm ring-1 ring-slate-200">
                <CardContent className="p-6 space-y-6">
                  <div className="flex flex-col sm:flex-row gap-6 items-start">
                    <div className="shrink-0 mx-auto sm:mx-0">
                      <AvatarInput
                        value={avatarFile}
                        onChange={setAvatarFile}
                        defaultUrl={formData.avatarUrl}
                      />
                    </div>
                    <div className="flex-1 space-y-4 w-full">
                      <div>
                        <Label className="text-base">
                          Biografia <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          value={formData.bio || ""}
                          onChange={(e) =>
                            setFormData((p) => ({ ...p, bio: e.target.value }))
                          }
                          className="mt-2 min-h-[120px] resize-none"
                          placeholder="Descreva sua experiência, personalidade e o que te motiva a cuidar."
                        />
                        <p className="text-xs text-muted-foreground mt-1 text-right">
                          Mínimo 50 caracteres recomendado
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <Label className="mb-2 block">
                      Registro Profissional (Opcional)
                    </Label>
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                      <Input
                        placeholder="Ex: COREN-SP 123456"
                        className="bg-white flex-1"
                        value={formData.crm_coren || ""}
                        onChange={(e) =>
                          setFormData((p) => ({
                            ...p,
                            crm_coren: e.target.value.toUpperCase(),
                          }))
                        }
                        disabled={noCouncilRegistration}
                      />
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <input
                          type="checkbox"
                          id="no_reg"
                          className="rounded border-slate-300"
                          checked={noCouncilRegistration}
                          onChange={(e) => {
                            setNoCouncilRegistration(e.target.checked);
                            if (e.target.checked)
                              setFormData((p) => ({ ...p, crm_coren: "" }));
                          }}
                        />
                        <Label
                          htmlFor="no_reg"
                          className="text-sm font-normal cursor-pointer"
                        >
                          Não possuo registro
                        </Label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* SECTION 2: Address */}
            <section id="address" className="scroll-mt-24 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-healthcare-primary" />
                <h2 className="text-xl font-semibold text-slate-800">
                  Localização
                </h2>
              </div>
              <Card className="border-none shadow-sm ring-1 ring-slate-200">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                    <div className="sm:col-span-4">
                      <Label>
                        CEP <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={formData.zipCode || ""}
                        onChange={(e) =>
                          setFormData((p) => ({
                            ...p,
                            zipCode: e.target.value,
                          }))
                        }
                        onBlur={(e) => handleGetAdress(e.target.value)}
                        placeholder="00000-000"
                        className="mt-1.5"
                        maxLength={9}
                      />
                    </div>
                    <div className="sm:col-span-8">
                      <Label>Endereço</Label>
                      <Input
                        value={formData.address || ""}
                        onChange={(e) =>
                          setFormData((p) => ({
                            ...p,
                            address: e.target.value,
                          }))
                        }
                        className="mt-1.5"
                      />
                    </div>
                    <div className="sm:col-span-9">
                      <Label>Cidade</Label>
                      <Input
                        value={formData.city || ""}
                        readOnly
                        className="mt-1.5 bg-slate-50 text-slate-600"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <Label>Estado</Label>
                      <Input
                        value={formData.state || ""}
                        readOnly
                        className="mt-1.5 bg-slate-50 text-slate-600"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* SECTION 3: Skills */}
            <section id="skills" className="scroll-mt-24 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Stethoscope className="w-5 h-5 text-healthcare-primary" />
                <h2 className="text-xl font-semibold text-slate-800">
                  Competências
                </h2>
              </div>
              <Card className="border-none shadow-sm ring-1 ring-slate-200">
                <CardContent className="p-6 space-y-6">
                  {/* Skills */}
                  <div>
                    <Label className="mb-3 block text-base">
                      Habilidades Práticas
                    </Label>
                    <div className="flex gap-2 mb-4">
                      <Input
                        placeholder="Adicionar habilidade..."
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          addTag(newSkill, "skills", setNewSkill)
                        }
                      />
                      <Button
                        variant="secondary"
                        onClick={() => addTag(newSkill, "skills", setNewSkill)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {formData.skills?.map((tag) => (
                        <Badge
                          key={tag}
                          className="pl-3 pr-1 py-1 gap-1 text-sm bg-healthcare-primary/10 text-healthcare-dark hover:bg-healthcare-primary/20 border-transparent"
                        >
                          {tag}
                          <X
                            className="w-3 h-3 cursor-pointer"
                            onClick={() => removeTag(tag, "skills")}
                          />
                        </Badge>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {commonSkills
                        .filter((s) => !formData.skills?.includes(s))
                        .map((s) => (
                          <button
                            key={s}
                            onClick={() => addTag(s, "skills", setNewSkill)}
                            className="text-xs border rounded-full px-3 py-1 text-slate-500 hover:border-healthcare-primary hover:text-healthcare-primary transition-colors"
                          >
                            + {s}
                          </button>
                        ))}
                    </div>
                  </div>

                  <div className="h-px bg-slate-100" />

                  {/* Specializations */}
                  <div>
                    <Label className="mb-3 block text-base flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" /> Especializações
                    </Label>
                    <div className="flex gap-2 mb-4">
                      <Input
                        placeholder="Ex: Técnico em Enfermagem..."
                        value={newSpecialization}
                        onChange={(e) => setNewSpecialization(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          addTag(
                            newSpecialization,
                            "specializations",
                            setNewSpecialization
                          )
                        }
                      />
                      <Button
                        variant="secondary"
                        onClick={() =>
                          addTag(
                            newSpecialization,
                            "specializations",
                            setNewSpecialization
                          )
                        }
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {formData.specializations?.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="pl-3 pr-1 py-1 gap-1 text-sm border-blue-200 bg-blue-50 text-blue-700"
                        >
                          {tag}
                          <X
                            className="w-3 h-3 cursor-pointer"
                            onClick={() => removeTag(tag, "specializations")}
                          />
                        </Badge>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {commonSpecializations
                        .filter((s) => !formData.specializations?.includes(s))
                        .map((s) => (
                          <button
                            key={s}
                            onClick={() =>
                              addTag(s, "specializations", setNewSpecialization)
                            }
                            className="text-xs bg-slate-100 rounded-md px-2 py-1 text-slate-600 hover:bg-slate-200 transition-colors"
                          >
                            {s}
                          </button>
                        ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* SECTION 4: Professional */}
            <section id="professional" className="scroll-mt-24 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="w-5 h-5 text-healthcare-primary" />
                <h2 className="text-xl font-semibold text-slate-800">
                  Profissional & Financeiro
                </h2>
              </div>
              <Card className="border-none shadow-sm ring-1 ring-slate-200">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label>
                        Tempo de Experiência{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        className="mt-1.5"
                        placeholder="Ex: 5 anos"
                        value={formData.experience || ""}
                        onChange={(e) =>
                          setFormData((p) => ({
                            ...p,
                            experience: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label>
                        Valor Hora (R$) <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative mt-1.5">
                        <span className="absolute left-3 top-2.5 text-slate-500">
                          R$
                        </span>
                        <Input
                          className="pl-10"
                          type="number"
                          placeholder="0,00"
                          value={formData.priceRange || ""}
                          onChange={(e) =>
                            setFormData((p) => ({
                              ...p,
                              priceRange: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Banknote className="w-3 h-3" /> Valor recebido
                        diretamente do cliente
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </main>

      {/* Floating Action Bar (Mobile/Tablet) */}
      <div className="w-full m-auto items-center flex justify-center">
        <Button
          variant="success"
          onClick={handleSubmit}
          disabled={loading}
          className="w-1/2 text-white h-12 text-lg shadow-md"
        >
          {loading ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>
    </div>
  );
}
