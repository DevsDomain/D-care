import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Heart, ArrowLeft, User, Stethoscope } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button-variants';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { api } from '@/lib/api/api';
import { Checkbox } from '@/components/ui/checkbox';

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    role: 'family' as 'family' | 'caregiver',
    fullName: '',
    email: '',
    phone: '',
    crmCoren: '',
    password: '',
    confirmPassword: '',
    acceptedTerms: false, // NOVO CAMPO
  });

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onRole = (value: string) =>
    setForm((p) => ({ ...p, role: value as 'family' | 'caregiver' }));

  const onTermsChange = (checked: boolean) => {
    setForm((p) => ({ ...p, acceptedTerms: checked }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!form.acceptedTerms) {
      setErrorMsg("Você precisa aceitar os termos de uso.");
      return;
    }

    setSubmitting(true);
    try {
      // 2. Cria o objeto com os dados COMUNS a ambos (Família e Cuidador)
      const payload = {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        confirmPassword: form.confirmPassword,
        acceptedTerms: form.acceptedTerms, // Envia o aceite
      };

      if (form.role === 'family') {
        await api.post('/auth/register/family', payload);
      } else {
        // Se for Cuidador, enviamos o payload + o campo CRM/COREN
        await api.post('/auth/register/caregiver', {
          ...payload,              // Copia todos os dados de cima
          crmCoren: form.crmCoren, // Adiciona o campo específico de cuidador
        });
      }

      navigate('/login');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Falha ao cadastrar');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-dvh bg-background overflow-x-hidden flex flex-col">
      {/* HEADER sticky com safe-area para aparelhos com notch */}
      <header className="sticky top-0 z-20 bg-gradient-to-r from-healthcare-dark to-healthcare-light text-white pt-[env(safe-area-inset-top)]">
        <div className="px-3 py-2 sm:px-4 sm:py-3">
          <div className="flex items-center gap-3">
            <Button
              aria-label="Voltar"
              variant="ghost"
              size="icon-sm"
              onClick={() => navigate('/login')}
              className="text-white hover:bg-white/20 h-10 w-10 rounded-xl"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2 min-w-0">
              <Heart className="w-6 h-6 shrink-0" />
              <h1 className="text-lg sm:text-xl font-bold truncate">D-care</h1>
            </div>
          </div>
        </div>
      </header>

      {/* CONTEÚDO */}
      <main className="flex-1 px-4 sm:px-6 py-4 pb-[max(env(safe-area-inset-bottom),theme(spacing.6))]">
        <Card className="healthcare-card mx-auto w-full max-w-md">
          <CardHeader className="text-center px-4 sm:px-6 pt-5 sm:pt-6">
            <CardTitle className="text-2xl sm:text-3xl text-healthcare-dark">Criar conta</CardTitle>
            <p className="text-muted-foreground text-sm sm:text-base">Junte-se à comunidade D-care</p>
          </CardHeader>

          <CardContent className="space-y-5 px-4 sm:px-6 pb-6">
            {errorMsg && (
              <Alert variant="destructive">
                <AlertDescription className="text-sm">{errorMsg}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={onSubmit} className="space-y-4" noValidate>
              {/* Papel */}
              <div className="space-y-2">
                <Label>Você é:</Label>
                <RadioGroup
                  value={form.role}
                  onValueChange={onRole}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                  disabled={submitting}
                >
                  <Label
                    htmlFor="family"
                    className={`flex items-center gap-3 border border-input rounded-2xl p-4 cursor-pointer transition-colors min-h-[56px] touch-manipulation ${form.role === 'family' ? 'bg-healthcare-soft border-healthcare-light' : 'hover:bg-healthcare-soft/30'}`}
                  >
                    <RadioGroupItem value="family" id="family" />
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-healthcare-dark" />
                      <span className="text-sm font-medium">Família</span>
                    </div>
                  </Label>

                  <Label
                    htmlFor="caregiver"
                    className={`flex items-center gap-3 border border-input rounded-2xl p-4 cursor-pointer transition-colors min-h-[56px] touch-manipulation ${form.role === 'caregiver' ? 'bg-healthcare-soft border-healthcare-light' : 'hover:bg-healthcare-soft/30'}`}
                  >
                    <RadioGroupItem value="caregiver" id="caregiver" />
                    <div className="flex items-center gap-2">
                      <Stethoscope className="w-5 h-5 text-healthcare-dark" />
                      <span className="text-sm font-medium">Cuidador</span>
                    </div>
                  </Label>
                </RadioGroup>
              </div>

              {/* Nome */}
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Nome completo</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={form.fullName}
                  onChange={onChange}
                  className="h-12"
                  required
                  autoComplete="name"
                  inputMode="text"
                  disabled={submitting}
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={onChange}
                  className="h-12"
                  required
                  autoComplete="email"
                  inputMode="email"
                  disabled={submitting}
                />
              </div>

              {/* Telefone */}
              <div className="space-y-1.5">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={form.phone}
                  onChange={onChange}
                  className="h-12"
                  required
                  autoComplete="tel"
                  inputMode="tel"
                  disabled={submitting}
                />
              </div>

              {/* CRM/COREN apenas para cuidador */}
              {form.role === 'caregiver' && (
                <div className="space-y-1.5">
                  <Label htmlFor="crmCoren">CRM | COREN | CREFITO | N/A</Label>
                  <Input
                    id="crmCoren"
                    name="crmCoren"
                    value={form.crmCoren}
                    onChange={onChange}
                    className="h-12"
                    required
                    autoComplete="off"
                    disabled={submitting}
                  />
                </div>
              )}

              {/* Senha */}
              <div className="space-y-1.5">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={onChange}
                    className="h-12 pr-12"
                    required
                    autoComplete="new-password"
                    disabled={submitting}
                  />
                  <Button
                    type="button"
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    variant="ghost"
                    size="icon-sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-xl"
                    onClick={() => setShowPassword((v) => !v)}
                    disabled={submitting}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* Confirmar Senha */}
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirmar senha</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={form.confirmPassword}
                    onChange={onChange}
                    className="h-12 pr-12"
                    required
                    autoComplete="new-password"
                    disabled={submitting}
                  />

                  <div className="flex items-center space-x-2 py-2">
                    <Checkbox
                      id="terms"
                      checked={form.acceptedTerms}
                      onCheckedChange={onTermsChange}
                      disabled={submitting}
                    />
                    <Label htmlFor="terms" className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Li e aceito os <button type="button" className="text-healthcare-primary underline hover:text-healthcare-dark">Termos de Uso</button> e Política de Privacidade.
                    </Label>
                  </div>

                  <Button
                    type="button"
                    aria-label={showConfirmPassword ? 'Ocultar confirmação' : 'Mostrar confirmação'}
                    variant="ghost"
                    size="icon-sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-xl"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    disabled={submitting}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                variant="healthcare"
                size="lg"
                className="w-full h-12 sm:h-12 text-base rounded-2xl"
                disabled={submitting}
              >
                {submitting ? 'Criando...' : 'Criar conta'}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Já tem uma conta?{' '}
                <Button
                  variant="link"
                  className="p-0 h-auto align-baseline"
                  onClick={() => navigate('/login')}
                  disabled={submitting}
                >
                  Fazer login
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
