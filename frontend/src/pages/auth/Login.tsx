import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Heart, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button-variants";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { useToast } from "@/components/hooks/use-toast";
import { api } from "@/lib/api/api";

type LoginResponse =
  | { accessToken: string; expiresAt?: string; user?: any }
  | { tokens: { accessToken: string; refreshToken?: string }; user?: any };

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      // Chama o backend: POST /api/v1/auth/login
      const res = await api.post<LoginResponse>("/auth/login", {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      // Suporta os 2 formatos que teu backend pode retornar
      const accessToken =
        (res as any)?.accessToken ?? (res as any)?.tokens?.accessToken;

      if (!accessToken) {
        throw new Error("Token não retornado pelo servidor");
      }

      localStorage.setItem("accessToken", accessToken);
      if ((res as any)?.user) {
        localStorage.setItem("user", JSON.stringify((res as any).user));
      }

      toast({
        title: "Bem-vindo(a)!",
        description: "Login realizado com sucesso.",
      });

      navigate("/");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        "Falha ao autenticar. Verifique suas credenciais.";
      setErrorMsg(msg);

      toast({
        title: "Erro no login",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header (mesmo padrão visual da outra página) */}
      <div className="bg-card border-b border-border px-4 py-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-healthcare-light" />
            <div>
              <h1 className="text-xl font-semibold text-foreground">D-care</h1>
              <p className="text-sm text-muted-foreground">Acesse sua conta</p>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-4">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-lg">Entrar na sua conta</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {errorMsg && (
              <Alert variant="destructive">
                <AlertDescription className="text-sm">{errorMsg}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={submitting}
                  className="h-11"
                />
              </div>

              <div>
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Sua senha"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    disabled={submitting}
                    className="h-11 pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setShowPassword((s) => !s)}
                    disabled={submitting}
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                variant="healthcare"
                className="w-full"
                disabled={submitting}
              >
                {submitting ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            <div className="text-center space-y-3">
              <Button variant="link" disabled={submitting}>
                Esqueci minha senha
              </Button>

              <div className="border-t border-border pt-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Ainda não tem conta?
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/register")}
                  disabled={submitting}
                >
                  Criar conta
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
