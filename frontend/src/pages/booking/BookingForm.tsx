
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Calendar, Clock, MapPin, FileText, AlertTriangle, ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button-variants';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/hooks/use-toast';
import { mockApi } from '@/lib/api/mock';
import { useAppStore } from '@/lib/stores/appStore';

const services = [
  'Personal Care',
  'Medication Management', 
  'Meal Preparation',
  'Companionship',
  'Light Housekeeping',
  'Transportation',
  'Physical Therapy',
  'Medical Administration'
];

const timeSlots = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', 
  '14:00', '15:00', '16:00', '17:00', '18:00'
];

export default function BookingForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const caregiverId = searchParams.get('caregiverId');
  const { toast } = useToast();
  const { selectedElder, setLoading } = useAppStore();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    duration: 4,
    emergency: false,
    services: [] as string[],
    notes: '',
    address: {
      street: selectedElder?.address.street || '',
      city: selectedElder?.address.city || '',
      state: selectedElder?.address.state || '',
      zipCode: selectedElder?.address.zipCode || ''
    }
  });

  const handleServiceToggle = (service: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const handleSubmit = async () => {
    if (!caregiverId || !selectedElder) {
      toast({
        title: "Error",
        description: "Missing booking information",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const bookingData = {
        caregiverId,
        elderId: selectedElder.id,
        dateISO: `${formData.date}T${formData.startTime}:00Z`,
        duration: formData.duration,
        emergency: formData.emergency,
        notes: formData.notes,
        address: formData.address,
        services: formData.services,
        totalPrice: formData.duration * 35 // Mock calculation
      };

      const response = await mockApi.createBooking(bookingData);
      
      if (response.success) {
        toast({
          title: "Booking Request Sent",
          description: "The caregiver will be notified of your request",
        });
        navigate('/bookings');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create booking",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const isStep1Valid = formData.date && formData.startTime && formData.services.length > 0;
  const isStep2Valid = formData.address.street && formData.address.city;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-6">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon-sm"
            onClick={() => step === 1 ? navigate(-1) : setStep(1)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Nova Reserva</h1>
            <p className="text-sm text-muted-foreground">
              Passo {step} de 3
            </p>
          </div>
        </div>
        
        {/* Progress */}
        <div className="mt-4 flex gap-2">
          {[1, 2, 3].map((num) => (
            <div 
              key={num}
              className={`h-2 flex-1 rounded-full transition-colors ${
                step >= num ? 'bg-healthcare-light' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="p-4 space-y-6">
        {step === 1 && (
          <div className="space-y-6">
            {/* Date & Time */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="w-5 h-5 text-healthcare-light" />
                  Data e Horário
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="date">Data</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startTime">Horário de Início</Label>
                    <Select value={formData.startTime} onValueChange={(value) => 
                      setFormData(prev => ({ ...prev, startTime: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map(time => (
                          <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="duration">Duração (horas)</Label>
                    <Select value={formData.duration.toString()} onValueChange={(value) => 
                      setFormData(prev => ({ ...prev, duration: parseInt(value) }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[2, 3, 4, 6, 8, 12].map(hours => (
                          <SelectItem key={hours} value={hours.toString()}>
                            {hours}h
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-medical-critical/5 rounded-xl border border-medical-critical/20">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-medical-critical" />
                    <div>
                      <p className="font-medium text-foreground">Atendimento de Emergência</p>
                      <p className="text-sm text-muted-foreground">Resposta prioritária</p>
                    </div>
                  </div>
                  <Switch
                    checked={formData.emergency}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, emergency: checked }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Services */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Serviços Necessários</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  {services.map(service => (
                    <div 
                      key={service}
                      className="flex items-center space-x-3 p-3 rounded-xl border border-border hover:bg-muted/50"
                    >
                      <Checkbox
                        id={service}
                        checked={formData.services.includes(service)}
                        onCheckedChange={() => handleServiceToggle(service)}
                      />
                      <Label 
                        htmlFor={service}
                        className="flex-1 cursor-pointer text-sm"
                      >
                        {service}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button 
              onClick={() => setStep(2)}
              disabled={!isStep1Valid}
              className="w-full"
              variant="healthcare"
            >
              Continuar
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            {/* Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="w-5 h-5 text-healthcare-light" />
                  Endereço do Atendimento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="street">Rua e Número</Label>
                  <Input
                    id="street"
                    value={formData.address.street}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      address: { ...prev.address, street: e.target.value }
                    }))}
                    placeholder="Ex: Rua das Flores, 123"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      value={formData.address.city}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        address: { ...prev.address, city: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">Estado</Label>
                    <Input
                      id="state"
                      value={formData.address.state}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        address: { ...prev.address, state: e.target.value }
                      }))}
                      maxLength={2}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="zipCode">CEP</Label>
                  <Input
                    id="zipCode"
                    value={formData.address.zipCode}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      address: { ...prev.address, zipCode: e.target.value }
                    }))}
                    placeholder="00000-000"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="w-5 h-5 text-healthcare-light" />
                  Observações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Informações importantes sobre o atendimento, medicações, preferências, etc."
                  rows={4}
                />
              </CardContent>
            </Card>

            <Button 
              onClick={() => setStep(3)}
              disabled={!isStep2Valid}
              className="w-full"
              variant="healthcare"
            >
              Continuar
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            {/* Confirmation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Check className="w-5 h-5 text-medical-success" />
                  Confirmar Reserva
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Data:</span>
                    <span className="font-medium">
                      {new Date(formData.date).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Horário:</span>
                    <span className="font-medium">
                      {formData.startTime} - {
                        String(parseInt(formData.startTime.split(':')[0]) + formData.duration).padStart(2, '0')
                      }:00
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duração:</span>
                    <span className="font-medium">{formData.duration}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Serviços:</span>
                    <span className="font-medium text-right max-w-[200px]">
                      {formData.services.join(', ')}
                    </span>
                  </div>
                  {formData.emergency && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Emergência:</span>
                      <span className="font-medium text-medical-critical">Sim</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-border">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total estimado:</span>
                      <span className="text-healthcare-dark">
                        R$ {(formData.duration * 35).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button 
                onClick={handleSubmit}
                className="w-full"
                variant="healthcare"
              >
                Enviar Solicitação
              </Button>
              <Button 
                onClick={() => setStep(2)}
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