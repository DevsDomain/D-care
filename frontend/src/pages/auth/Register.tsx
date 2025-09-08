
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Heart, ArrowLeft, User, Stethoscope } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button-variants';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'family' as 'family' | 'caregiver'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      role: value as 'family' | 'caregiver'
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder - redirect to main app
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-healthcare-dark to-healthcare-light text-white">
        <div className="p-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon-sm" 
              onClick={() => navigate('/login')}
              className="text-white hover:bg-white/20"
            >
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
            <CardTitle className="text-2xl text-healthcare-dark">
              Criar conta
            </CardTitle>
            <p className="text-muted-foreground">
              Junte-se à comunidade D-care
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <Alert className="bg-medical-warning/10 border-medical-warning/20">
              <AlertDescription className="text-sm">
                <strong>Modo demonstração:</strong> Esta é uma versão de demonstração. 
                O registro será implementado posteriormente.
              </AlertDescription>
            </Alert>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Selection */}
              <div className="space-y-3">
                <Label>Você é:</Label>
                <RadioGroup 
                  value={formData.role} 
                  onValueChange={handleRoleChange}
                  className="grid grid-cols-2 gap-4"
                  disabled
                >
                  <Label 
                    htmlFor="family" 
                    className={`
                      flex items-center space-x-3 border border-input rounded-2xl p-4 cursor-pointer
                      hover:bg-healthcare-soft/30 transition-colors
                      ${formData.role === 'family' ? 'bg-healthcare-soft border-healthcare-light' : ''}
                    `}
                  >
                    <RadioGroupItem value="family" id="family" />
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-healthcare-dark" />
                      <span className="text-sm font-medium">Família</span>
                    </div>
                  </Label>
                  
                  <Label 
                    htmlFor="caregiver" 
                    className={`
                      flex items-center space-x-3 border border-input rounded-2xl p-4 cursor-pointer
                      hover:bg-healthcare-soft/30 transition-colors
                      ${formData.role === 'caregiver' ? 'bg-healthcare-soft border-healthcare-light' : ''}
                    `}
                  >
                    <RadioGroupItem value="caregiver" id="caregiver" />
                    <div className="flex items-center gap-2">
                      <Stethoscope className="w-5 h-5 text-healthcare-dark" />
                      <span className="text-sm font-medium">Cuidador</span>
                    </div>
                  </Label>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Seu nome completo"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="h-12"
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="h-12"
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="h-12"
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Crie uma senha"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="h-12 pr-12"
                    disabled
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
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
                    placeholder="Confirme sua senha"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="h-12 pr-12"
                    disabled
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled
                  >
                    {showConfirmPassword ? (
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
                size="lg" 
                className="w-full"
              >
                Criar conta (Demo)
              </Button>
            </form>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Já tem uma conta?{' '}
                <Button 
                  variant="link" 
                  className="p-0 h-auto"
                  onClick={() => navigate('/login')}
                >
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