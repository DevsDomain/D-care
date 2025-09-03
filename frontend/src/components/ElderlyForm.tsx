import React, { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { useToast } from './ui/use-toast'
import { Camera, User, Calendar, FileText, CheckCircle } from 'lucide-react'
import IVCFAssessment from './IVCFAssessment'

interface ElderlyData {
  id?: number
  full_name: string
  birth_date: string
  health_conditions: string
  profile_photo?: string
}

interface IVCFResponse {
  [key: string]: string
}

const ElderlyForm: React.FC = () => {
  const [formData, setFormData] = useState<ElderlyData>({
    full_name: '',
    birth_date: '',
    health_conditions: ''
  })
  
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)
  const [ivcfResponses, setIvcfResponses] = useState<IVCFResponse>({})
  const [ivcfScore, setIvcfScore] = useState<number | null>(null)
  const [ivcfClassification, setIvcfClassification] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showIVCF, setShowIVCF] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [elderlyId, setElderlyId] = useState<number | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "Erro",
          description: "A imagem deve ter no máximo 5MB",
          variant: "destructive"
        })
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        setProfilePhoto(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleIVCFComplete = (responses: IVCFResponse, score: number, classification: string) => {
    setIvcfResponses(responses)
    setIvcfScore(score)
    setIvcfClassification(classification)
    setShowIVCF(false)
    
    toast({
      title: "Avaliação IVCF-20 Concluída",
      description: `Pontuação: ${score} - Classificação: ${classification}`,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.full_name || !formData.birth_date) {
      toast({
        title: "Erro",
        description: "Nome completo e data de nascimento são obrigatórios",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)

    try {
      const payload = {
        ...formData,
        profile_photo: profilePhoto,
        ivcf_responses: Object.keys(ivcfResponses).length > 0 ? ivcfResponses : undefined
      }

      const url = isEditing && elderlyId 
        ? `/api/elderly/${elderlyId}` 
        : '/api/elderly'
      
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao salvar dados')
      }

      const result = await response.json()
      
      if (!isEditing) {
        setElderlyId(result.id)
        setIsEditing(true)
      }

      toast({
        title: "Sucesso!",
        description: isEditing 
          ? "Dados atualizados com sucesso" 
          : "Cadastro realizado com sucesso",
      })

      // Update IVCF data if returned from server
      if (result.ivcf_score !== undefined) {
        setIvcfScore(result.ivcf_score)
        setIvcfClassification(result.ivcf_classification)
      }

    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao salvar dados",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      full_name: '',
      birth_date: '',
      health_conditions: ''
    })
    setProfilePhoto(null)
    setIvcfResponses({})
    setIvcfScore(null)
    setIvcfClassification('')
    setIsEditing(false)
    setElderlyId(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Card */}
      <Card className="dcare-shadow">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold dcare-text-gradient">
            Cadastro do Idoso
          </CardTitle>
          <p className="text-muted-foreground">
            Preencha os dados pessoais e realize a avaliação IVCF-20 para uma análise funcional completa
          </p>
        </CardHeader>
      </Card>

      {/* Main Form */}
      <Card className="dcare-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Dados Pessoais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Photo Upload */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                {profilePhoto ? (
                  <img
                    src={profilePhoto}
                    alt="Foto do perfil"
                    className="w-32 h-32 rounded-full object-cover border-4 border-primary/20"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-primary/20">
                    <Camera className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                <Button
                  type="button"
                  size="sm"
                  className="absolute bottom-0 right-0 rounded-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <p className="text-sm text-muted-foreground">
                Clique para adicionar uma foto de perfil (máx. 5MB)
              </p>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Nome Completo do Idoso *
                </Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  placeholder="Digite o nome completo"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birth_date" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Data de Nascimento *
                </Label>
                <Input
                  id="birth_date"
                  name="birth_date"
                  type="date"
                  value={formData.birth_date}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="health_conditions" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Condições de Saúde Relevantes
              </Label>
              <Textarea
                id="health_conditions"
                name="health_conditions"
                value={formData.health_conditions}
                onChange={handleInputChange}
                placeholder="Descreva condições médicas, medicamentos em uso, alergias, etc."
                rows={4}
              />
            </div>

            {/* IVCF Assessment Section */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    Avaliação IVCF-20
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Responda ao questionário para uma análise funcional do idoso
                  </p>
                </div>
                {ivcfScore !== null && (
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Pontuação</div>
                    <div className="text-2xl font-bold text-primary">{ivcfScore}</div>
                    <div className="text-sm font-medium">{ivcfClassification}</div>
                  </div>
                )}
              </div>

              {!showIVCF ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowIVCF(true)}
                  className="w-full"
                >
                  {Object.keys(ivcfResponses).length > 0 ? 'Refazer Avaliação IVCF-20' : 'Iniciar Avaliação IVCF-20'}
                </Button>
              ) : (
                <IVCFAssessment
                  onComplete={handleIVCFComplete}
                  onCancel={() => setShowIVCF(false)}
                  initialResponses={ivcfResponses}
                />
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 dcare-hover"
              >
                {isSubmitting ? 'Salvando...' : (isEditing ? 'Atualizar Cadastro' : 'Salvar Cadastro')}
              </Button>
              
              {isEditing && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  className="flex-1"
                >
                  Novo Cadastro
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default ElderlyForm

