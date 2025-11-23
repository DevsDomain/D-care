import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  User,
  MapPin,
  Heart,
  CalendarIcon,
  ArrowLeft,
  Check,
  X,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button-variants";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/hooks/use-toast";
import { getElderById, updateElder, deleteElder } from "@/lib/api/elders";
import { AvatarInput } from "@/components/avatar-input";
import { getAdressByCEP } from "@/lib/api/getAdressByCEP";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/lib/stores/appStore";

export default function ElderEdit() {
  const { id } = useParams(); // rota: /elders/:id/edit
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser, setCurrentUser } = useAppStore();

  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<any>(null);
  const [newCondition, setNewCondition] = useState("");
  const [newMedication, setNewMedication] = useState("");

  // Buscar dados do idoso ao montar
  useEffect(() => {
    const fetchElder = async () => {
      try {
        const data = await getElderById(id!); // <- já vem normalizado
        setFormData({
          id: data.id,
          name: data.name ?? "",
          birthDate: data.birthDate ?? null, // Date | string

          // foto atual (pra preview)
          avatarUrl: data.photo ?? null,
          avatarFile: null, // usuário pode trocar depois
          removeAvatar: false, // 👈 flag para "apagar foto"

          address: {
            street: data.address?.street ?? "",
            city: data.address?.city ?? "",
            state: data.address?.state ?? "",
            zipCode: data.address?.zipCode ?? "",
            number: data.address?.number ?? "",
          },

          // preferências (inclui gênero do cuidador)
          preferences: data.preferences ?? {
            gender: "any",
            language: ["Portuguese"],
            specialNeeds: [],
          },

          conditions: Array.isArray(data.conditions) ? data.conditions : [],
          medications: Array.isArray(data.medications) ? data.medications : [],
        });
      } catch (e: any) {
        console.error(e);
        toast({
          title: "Erro",
          description: "Falha ao carregar dados do idoso",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchElder();
  }, [id, toast]);

  const handleGetAdress = async (cep: string) => {
    const endereco = await getAdressByCEP(cep);
    if (endereco?.address) {
      setFormData((prev: any) => ({
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
    if (!condition) return;
    if (!formData.conditions.includes(condition)) {
      setFormData((prev: any) => ({
        ...prev,
        conditions: [...prev.conditions, condition],
      }));
    }
    setNewCondition("");
  };

  const removeCondition = (condition: string) => {
    setFormData((prev: any) => ({
      ...prev,
      conditions: prev.conditions.filter((c: string) => c !== condition),
    }));
  };

  const addMedication = (medication: string) => {
    if (!medication) return;
    if (!formData.medications.includes(medication)) {
      setFormData((prev: any) => ({
        ...prev,
        medications: [...prev.medications, medication],
      }));
    }
    setNewMedication("");
  };

  const removeMedication = (medication: string) => {
    setFormData((prev: any) => ({
      ...prev,
      medications: prev.medications.filter((m: string) => m !== medication),
    }));
  };

  // 👇 NOVO: remover foto (só no front; backend pode usar flag depois)
  const handleRemovePhoto = () => {
    setFormData((prev: any) => ({
      ...prev,
      avatarUrl: null,
      avatarFile: null,
      removeAvatar: true,
    }));
  };

  const handleSubmit = async () => {
    try {
      const payload: any = {
        name: formData.name,
        birthdate: formData.birthDate
          ? new Date(formData.birthDate).toISOString()
          : undefined,
        medicalConditions: JSON.stringify(formData.conditions || []),
        medications: JSON.stringify(formData.medications || []),
        address: formData.address.street,
        city: formData.address.city,
        state: formData.address.state,
        zipCode: formData.address.zipCode,

        // preferências (inclui gênero do cuidador)
        preferences: {
          ...(formData.preferences || {}),
          gender: formData.preferences?.gender ?? "any",
        },
      };

      // 👇 se o usuário marcou remover foto, envia flag
      if (formData.removeAvatar) {
        payload.removeAvatar = true;
      }

      await updateElder(id!, payload, formData.avatarFile);

      toast({
        title: "Sucesso!",
        description: "Dados atualizados com sucesso",
      });
      navigate("/");
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Erro",
        description: err?.message || "Falha ao atualizar idoso",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    const confirmed = window.confirm(
      "Tem certeza que deseja excluir este cadastro? Essa ação não pode ser desfeita."
    );
    if (!confirmed) return;

    try {
      await deleteElder(id);

      // remove o idoso do usuário atual (estado global)
      if (currentUser?.elders) {
        const updatedUser = {
          ...currentUser,
          elders: currentUser.elders.filter((e: any) => e.id !== id),
        };
        setCurrentUser(updatedUser);
        try {
          localStorage.setItem("user", JSON.stringify(updatedUser));
        } catch {}
      }

      toast({
        title: "Idoso excluído",
        description: "O cadastro foi removido com sucesso.",
      });
      navigate("/");
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Erro",
        description: err?.message || "Falha ao excluir idoso",
        variant: "destructive",
      });
    }
  };

  if (loading || !formData) return <div className="p-6">Carregando...</div>;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="bg-card border-b border-border px-4 py-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold">Editar Idoso</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="w-5 h-5 text-healthcare-light" />
              Informações Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Preview da foto atual + botão remover */}
            {formData.avatarUrl && !formData.avatarFile && (
              <div className="flex items-center gap-3">
                <img
                  src={formData.avatarUrl}
                  alt="Foto atual"
                  className="w-20 h-20 rounded-full object-cover"
                />
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-muted-foreground">
                    Foto atual
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRemovePhoto}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Remover foto
                  </Button>
                </div>
              </div>
            )}

            {/* Se tiver uma foto nova selecionada, também deixa remover */}
            {formData.avatarFile && (
              <div className="flex justify-start">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRemovePhoto}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Remover foto
                </Button>
              </div>
            )}

            <AvatarInput
              value={formData.avatarFile}
              label="Foto do Idoso"
              onChange={(file) =>
                setFormData((prev: any) => ({
                  ...prev,
                  avatarFile: file,
                  // se o user escolhe outra foto, não estamos mais "removendo"
                  removeAvatar: false,
                }))
              }
            />

            <div>
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev: any) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
              />
            </div>

            {/* Preferência de gênero do cuidador (editável) */}
            <div>
              <Label>Preferência de gênero do cuidador</Label>
              <Select
                value={formData.preferences?.gender ?? "any"}
                onValueChange={(value: "male" | "female" | "any") =>
                  setFormData((prev: any) => ({
                    ...prev,
                    preferences: {
                      ...(prev.preferences || {}),
                      gender: value,
                    },
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
              <Label htmlFor="birthDate">Data de nascimento</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.birthDate
                      ? new Date(formData.birthDate).toLocaleDateString(
                          "pt-BR"
                        )
                      : "Selecione a data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="p-0">
                  <Calendar
                    mode="single"
                    selected={
                      formData.birthDate
                        ? new Date(formData.birthDate)
                        : undefined
                    }
                    initialFocus
                    captionLayout="dropdown-years"
                    fromYear={new Date().getFullYear() - 100}
                    toYear={new Date().getFullYear()}
                    locale={ptBR}
                    onSelect={(date) =>
                      setFormData((prev: any) => ({
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="w-5 h-5 text-healthcare-light" />
              Endereço
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="CEP"
              value={formData.address.zipCode}
              onChange={(e) =>
                setFormData((prev: any) => ({
                  ...prev,
                  address: { ...prev.address, zipCode: e.target.value },
                }))
              }
              onBlur={() => handleGetAdress(formData.address.zipCode)}
            />
            <Input
              placeholder="Rua"
              value={formData.address.street}
              onChange={(e) =>
                setFormData((prev: any) => ({
                  ...prev,
                  address: { ...prev.address, street: e.target.value },
                }))
              }
            />
            <Input
              placeholder="Cidade"
              value={formData.address.city}
              onChange={(e) =>
                setFormData((prev: any) => ({
                  ...prev,
                  address: { ...prev.address, city: e.target.value },
                }))
              }
            />
            <Input
              placeholder="Estado"
              value={formData.address.state}
              onChange={(e) =>
                setFormData((prev: any) => ({
                  ...prev,
                  address: { ...prev.address, state: e.target.value },
                }))
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Heart className="w-5 h-5 text-healthcare-light" />
              Saúde
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="mb-4">Condições</Label>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.conditions.map((condition: string) => (
                  <Badge key={condition} variant="secondary">
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
                  placeholder="Adicionar condição"
                  onKeyDown={(e) => {
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
            </div>

            <div>
              <Label className="mb-4">Medicações</Label>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.medications.map((medication: string) => (
                  <Badge key={medication} variant="secondary">
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
                  placeholder="Adicionar medicação"
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
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Button onClick={handleSubmit} className="w-full" variant="healthcare">
            <Check className="w-4 h-4 mr-2" />
            Salvar Alterações
          </Button>

          <Button
            type="button"
            onClick={handleDelete}
            className="w-full"
            variant="outline"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir cadastro
          </Button>
        </div>
      </div>
    </div>
  );
}
