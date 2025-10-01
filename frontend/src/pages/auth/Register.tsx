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
  });

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onRole = (value: string) =>
    setForm((p) => ({ ...p, role: value as 'family' | 'caregiver' }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);
    try {
      if (form.role === 'family') {
        await api.post('/auth/register/family', {
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          password: form.password,
          confirmPassword: form.confirmPassword,
        });
      } else {
        await api.post('/auth/register/caregiver', {
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          crmCoren: form.crmCoren,
          password: form.password,
          confirmPassword: form.confirmPassword,
        });
      }
      navigate('/login');
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao cadastrar');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-gradient-to-r from-healthcare-dark to-healthcare-light text-white">
        <div className="p-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon-sm" onClick={() => navigate('/login')} className="text-white hover:bg-white/20">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6" />
              <h1 className="text-xl font-bold">D-care</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        <Card className="healthcare-card max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-healthcare-dark">Criar conta</CardTitle>
            <p className="text-muted-foreground">Junte-se à comunidade D-care</p>
          </CardHeader>

          <CardContent className="space-y-6">
            {errorMsg && (
              <Alert variant="destructive">
                <AlertDescription className="text-sm">{errorMsg}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-3">
                <Label>Você é:</Label>
                <RadioGroup
                  value={form.role}
                  onValueChange={onRole}
                  className="grid grid-cols-2 gap-4"
                  disabled={submitting}
                >
                  <Label htmlFor="family" className={`flex items-center space-x-3 border border-input rounded-2xl p-4 cursor-pointer hover:bg-healthcare-soft/30 transition-colors ${form.role === 'family' ? 'bg-healthcare-soft border-healthcare-light' : ''}`}>
                    <RadioGroupItem value="family" id="family" />
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-healthcare-dark" />
                      <span className="text-sm font-medium">Família</span>
                    </div>
                  </Label>

                  <Label htmlFor="caregiver" className={`flex items-center space-x-3 border border-input rounded-2xl p-4 cursor-pointer hover:bg-healthcare-soft/30 transition-colors ${form.role === 'caregiver' ? 'bg-healthcare-soft border-healthcare-light' : ''}`}>
                    <RadioGroupItem value="caregiver" id="caregiver" />
                    <div className="flex items-center gap-2">
                      <Stethoscope className="w-5 h-5 text-healthcare-dark" />
                      <span className="text-sm font-medium">Cuidador</span>
                    </div>
                  </Label>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Nome completo</Label>
                <Input id="fullName" name="fullName" value={form.fullName} onChange={onChange} className="h-12" required disabled={submitting} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" name="email" type="email" value={form.email} onChange={onChange} className="h-12" required disabled={submitting} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" name="phone" value={form.phone} onChange={onChange} className="h-12" required disabled={submitting} />
              </div>

              {form.role === 'caregiver' && (
                <div className="space-y-2">
                  <Label htmlFor="crmCoren">CRM/COREN</Label>
                  <Input id="crmCoren" name="crmCoren" value={form.crmCoren} onChange={onChange} className="h-12" required disabled={submitting} />
                </div>
              )}

              <div className="space-y-2">
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
                    disabled={submitting}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setShowPassword((v) => !v)}
                    disabled={submitting}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
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
                    disabled={submitting}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    disabled={submitting}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <Button type="submit" variant="healthcare" size="lg" className="w-full" disabled={submitting}>
                {submitting ? 'Criando...' : 'Criar conta'}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Já tem uma conta?{' '}
                <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/login')} disabled={submitting}>
                  Fazer login
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
