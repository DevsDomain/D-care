import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Heart } from "lucide-react";

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

  // 🔹 Adiciona classe no body só nesta página
  useEffect(() => {
    document.body.classList.add("no-bottomnav");
    return () => {
      document.body.classList.remove("no-bottomnav");
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await api.post<LoginResponse>("/auth/login", {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

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
    <div className="min-h-dvh bg-background overflow-x-hidden flex flex-col">
      {/* HEADER */}
      <header className="sticky top-0 z-20 bg-gradient-to-r from-healthcare-dark to-healthcare-light text-white pt-[env(safe-area-inset-top)]">
        <div className="px-3 py-2 sm:px-4 sm:py-3">
          <div className="flex items-center gap-2 min-w-0">
            <Heart className="w-6 h-6" />
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-semibold truncate">
                D-care
              </h1>
              <p className="text-xs sm:text-sm text-white/90">
                Acesse sua conta
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* CONTEÚDO */}
      <main className="flex-1 px-4 sm:px-6 py-4 pb-[max(env(safe-area-inset-bottom),theme(spacing.6))]">
        <Card className="mx-auto w-full max-w-md healthcare-card">
          <CardHeader className="px-4 sm:px-6 pt-5 sm:pt-6">
            <CardTitle className="text-2xl sm:text-3xl text-healthcare-dark">
              Entrar na sua conta
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6 px-4 sm:px-6 pb-6">
            {errorMsg && (
              <Alert variant="destructive">
                <AlertDescription className="text-sm">
                  {errorMsg}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="space-y-1.5">
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
                  className="h-12"
                  autoComplete="email"
                  inputMode="email"
                />
              </div>

              <div className="space-y-1.5">
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
                    className="h-12 pr-12"
                    autoComplete="current-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-xl"
                    onClick={() => setShowPassword((s) => !s)}
                    disabled={submitting}
                    aria-label={
                      showPassword ? "Ocultar senha" : "Mostrar senha"
                    }
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
                className="w-full h-12 rounded-2xl text-base"
                disabled={submitting}
              >
                {submitting ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            <div className="text-center space-y-3">
              <Button
                variant="link"
                disabled={submitting}
                className="h-auto p-0"
              >
                Esqueci minha senha
              </Button>

              <div className="border-t border-border pt-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Ainda não tem conta?
                </p>
                <Button
                  variant="outline"
                  className="w-full h-12 rounded-2xl"
                  onClick={() => navigate("/register")}
                  disabled={submitting}
                >
                  Criar conta
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
