import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, MapPin, ArrowLeft, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button-variants";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/hooks/use-toast";
import { AvatarInput } from "@/components/avatar-input";
import { getAdressByCEP } from "@/lib/api/getAdressByCEP";
import { useAppStore } from "@/lib/stores/appStore";
import type { Caregiver } from "@/lib/types";
import { api } from "@/lib/api/api";
import { Textarea } from "@/components/ui/textarea";

export default function CaregiverEdition() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser } = useAppStore();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
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
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // Load existing caregiver data
  useEffect(() => {
    const fetchCaregiver = async () => {
      try {
        const { data } = await api.get(`/perfis/${currentUser?.id}`);
        setFormData({
          crm_coren: data.caregiver[0].crmCoren,
          bio: data.caregiver[0].bio,
          address: data.caregiver[0].address,
          city: data.caregiver[0].city,
          state: data.caregiver[0].state,
          zipCode: data.caregiver[0].zipCode,
          avatarPath: data.caregiver[0].avatarPath,
          userId: data.caregiver[0].id,
          avatarUrl: data.caregiver[0].avatarPath,
        });

        console.log("RESULTADO", data);
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

    // ✅ Local validation for CRM/COREN format
    const crmPattern = /^(CRM|COREN|CRP|CREFITO)(-[A-Z]{2})?\s?\d{4,8}$/i;

    if (formData.crm_coren && !crmPattern.test(formData.crm_coren.trim())) {
      toast({
        title: "CRM/COREN inválido",
        description:
          "Use formatos válidos como: CRM-SP 123456, COREN-SP 123456, CRP 123456 ou CREFITO 123456",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const form = new FormData();
      form.append("crm_coren", formData.crm_coren || "");
      form.append("bio", formData.bio || "");
      form.append("address", formData.address || "");
      form.append("city", formData.city || "");
      form.append("state", formData.state || "");
      form.append("zipCode", formData.zipCode || "");
      if (avatarFile) form.append("avatar", avatarFile);

      await api.patch(`/perfis/caregiver/${formData.userId}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

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

  const isStep1Valid = formData.crm_coren && formData.bio;
  const isStep2Valid = formData.address && formData.city && formData.state;

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
            <p className="text-sm text-muted-foreground">Passo {step} de 2</p>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          {[1, 2].map((num) => (
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
                <div>
                  <Label htmlFor="crm_coren" className="mb-2">
                    CRM/COREN
                  </Label>
                  <Input
                    id="crm_coren"
                    value={formData.crm_coren || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        crm_coren: e.target.value,
                      }))
                    }
                    placeholder="Digite seu CRM ou COREN"
                  />
                </div>
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
                onClick={handleSubmit}
                disabled={!isStep2Valid || loading}
                className="w-full"
                variant="healthcare"
              >
                {loading ? "Salvando..." : <Check className="w-4 h-4 mr-2" />}
                {loading ? "" : "Salvar Alterações"}
              </Button>
              <Button
                onClick={() => setStep(1)}
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
