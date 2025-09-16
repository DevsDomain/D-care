
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Heart, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button-variants';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
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
              onClick={() => navigate('/')}
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
              Entrar na sua conta
            </CardTitle>
            <p className="text-muted-foreground">
              Acesse sua conta D-care
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <Alert className="bg-medical-warning/10 border-medical-warning/20">
              <AlertDescription className="text-sm">
                <strong>Modo demonstração:</strong> Esta é uma versão de demonstração. 
                A autenticação será implementada posteriormente.
              </AlertDescription>
            </Alert>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Sua senha"
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

              <Button 
                type="submit" 
                variant="healthcare" 
                size="lg" 
                className="w-full"
              >
                Entrar (Demo)
              </Button>
            </form>

            <div className="text-center space-y-4">
              <Button variant="link" disabled>
                Esqueci minha senha
              </Button>

              <div className="border-t border-border pt-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Ainda não tem conta?
                </p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/register')}
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