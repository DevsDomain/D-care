import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Activity, MessageCircle, Calendar, User, Heart, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button-variants';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/stores/appStore';
import { mockApi } from '@/lib/api/mock';
import type { Elder, User as UserType } from '@/lib/types';
import { ListSkeleton } from '@/components/common/LoadingSkeleton';


export default function Index() {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Mock authentication - simulate getting current user
    const initializeUser = async () => {
      try {
        setIsLoading(true);
        // In a real app, this would check auth state
        const response = await mockApi.login('maria@email.com', 'password');
        if (response.success && response.data) {
          setCurrentUser(response.data);
        }
      } catch (error) {
        console.error('Failed to initialize user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeUser();
  }, [setCurrentUser]);

  const handleAddElder = () => {
    navigate('/elder/register');
  };

  const handleStartIvcf = (elderId: string) => {
    navigate(`/ivcf/${elderId}`);
  };

  const handleFindCaregiver = () => {
    navigate('/search');
  };

  const handleViewBookings = () => {
    navigate('/bookings');
  };

  const handleOpenGuide = () => {
    navigate('/guide');
  };

  const handleLogout = () => {
    // limpa tokens/sessão
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  
    // limpa estado global
    setCurrentUser(null);
  
    // redireciona para login
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-6">
        <ListSkeleton type="profile" count={1} />
      </div>
    );
  }

  if (!currentUser || !currentUser.elders?.length) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-gradient-to-r from-healthcare-dark to-healthcare-light text-white">
          <div className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Heart className="w-8 h-8" />
              <h1 className="text-2xl font-bold">D-care</h1>
            </div>
            <p className="text-healthcare-accent">
              Cuidado especializado para quem você ama
            </p>
          </div>
        </header>

        {/* Welcome Content */}
        <div className="p-6">
          <div className="healthcare-card text-center mb-6">
            <div className="p-8">
              <Shield className="w-16 h-16 mx-auto mb-4 text-healthcare-light" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Bem-vindo ao D-care
              </h2>
              <p className="text-muted-foreground mb-6">
                Para começar, vamos cadastrar as informações da pessoa que você cuida
              </p>
              <Button 
                variant="healthcare" 
                size="lg" 
                onClick={handleAddElder}
                className="w-full"
              >
                <Plus className="w-5 h-5 mr-2" />
                Cadastrar Pessoa
              </Button>
            </div>
          </div>

          {/* Features Preview */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-healthcare-soft/30 border-healthcare-light/20">
              <CardContent className="p-4 text-center">
                <Search className="w-8 h-8 mx-auto mb-2 text-healthcare-dark" />
                <h3 className="font-medium text-sm">Buscar Cuidadores</h3>
                <p className="text-xs text-muted-foreground">
                  Profissionais verificados
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-healthcare-soft/30 border-healthcare-light/20">
              <CardContent className="p-4 text-center">
                <Activity className="w-8 h-8 mx-auto mb-2 text-healthcare-dark" />
                <h3 className="font-medium text-sm">Avaliação IVCF-20</h3>
                <p className="text-xs text-muted-foreground">
                  Avalie a independência
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-healthcare-soft/30 border-healthcare-light/20">
              <CardContent className="p-4 text-center">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 text-healthcare-dark" />
                <h3 className="font-medium text-sm">Guia IA</h3>
                <p className="text-xs text-muted-foreground">
                  Orientações especializadas
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-healthcare-soft/30 border-healthcare-light/20">
              <CardContent className="p-4 text-center">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-healthcare-dark" />
                <h3 className="font-medium text-sm">Agendamentos</h3>
                <p className="text-xs text-muted-foreground">
                  Gerencie consultas
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-healthcare-dark to-healthcare-light text-white">
  <div className="p-6">
    <div className="flex items-center justify-between mb-4">
      <div>
        <h1 className="text-xl font-bold">Olá, {currentUser.name.split(' ')[0]}!</h1>
        <p className="text-healthcare-accent text-sm">
          Como posso ajudar hoje?
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Avatar className="border-2 border-white/20">
          <AvatarImage src={currentUser.photo} alt={currentUser.name} />
          <AvatarFallback className="bg-white/20 text-white">
            {currentUser.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>

        {/* Botão Sair */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-white hover:bg-white/20"
        >
          Sair
        </Button>
      </div>
    </div>
  </div>
</header>

      <div className="p-4 space-y-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="healthcare" 
            className="h-auto py-4 flex-col gap-2"
            onClick={handleFindCaregiver}
          >
            <Search className="w-6 h-6" />
            <span className="text-xs">Buscar Cuidador</span>
          </Button>
          
          <Button 
            variant="trust" 
            className="h-auto py-4 flex-col gap-2"
            onClick={handleOpenGuide}
          >
            <MessageCircle className="w-6 h-6" />
            <span className="text-xs">Guia IA</span>
          </Button>
          
          <Button 
            variant="soft" 
            className="h-auto py-4 flex-col gap-2"
            onClick={handleViewBookings}
          >
            <Calendar className="w-6 h-6" />
            <span className="text-xs">Agendamentos</span>
          </Button>
          
          <Button 
            variant="soft" 
            className="h-auto py-4 flex-col gap-2"
            onClick={handleAddElder}
          >
            <Plus className="w-6 h-6" />
            <span className="text-xs">Nova Pessoa</span>
          </Button>
        </div>

        {/* Elderly Cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Pessoas sob seus cuidados
            </h2>
            <Button variant="ghost" size="sm" onClick={handleAddElder}>
              <Plus className="w-4 h-4 mr-1" />
              Adicionar
            </Button>
          </div>

          {currentUser.elders.map((elder: Elder) => (
            <Card key={elder.id} className="healthcare-card">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16 border-2 border-healthcare-light/20">
                    <AvatarImage src={elder.photo} alt={elder.name} />
                    <AvatarFallback className="bg-healthcare-soft text-healthcare-dark font-semibold text-lg">
                      {elder.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-foreground mb-1">
                      {elder.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {elder.age} anos
                    </p>

                    {/* Health Conditions */}
                    {elder.conditions && elder.conditions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {elder.conditions.slice(0, 3).map((condition, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {condition}
                          </Badge>
                        ))}
                        {elder.conditions.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{elder.conditions.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button 
                        variant="healthcare" 
                        size="sm"
                        onClick={() => handleStartIvcf(elder.id)}
                      >
                        <Activity className="w-4 h-4 mr-1" />
                        IVCF-20
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/elder/${elder.id}/edit`)}
                      >
                        <User className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity / Status Cards */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">
            Atividade Recente
          </h2>
          
          <Card className="bg-gradient-to-r from-medical-success/10 to-healthcare-soft/30 border-medical-success/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-medical-success/20 p-2 rounded-full">
                  <Shield className="w-5 h-5 text-medical-success" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-sm">Sistema Ativo</h3>
                  <p className="text-xs text-muted-foreground">
                    Monitoramento 24h funcionando normalmente
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}