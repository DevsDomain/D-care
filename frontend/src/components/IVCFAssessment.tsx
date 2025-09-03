import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { Label } from './ui/label'
import { Progress } from './ui/progress'
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react'

interface IVCFQuestion {
  id: string
  text: string
}

interface IVCFResponse {
  [key: string]: string
}

interface IVCFAssessmentProps {
  onComplete: (responses: IVCFResponse, score: number, classification: string) => void
  onCancel: () => void
  initialResponses?: IVCFResponse
}

const IVCF_QUESTIONS: IVCFQuestion[] = [
  { id: "q1", text: "O idoso tem dificuldades para tomar banho sozinho?" },
  { id: "q2", text: "O idoso tem dificuldades para se alimentar sozinho?" },
  { id: "q3", text: "O idoso tem dificuldades para se vestir sozinho?" },
  { id: "q4", text: "O idoso tem dificuldades para usar o banheiro sozinho?" },
  { id: "q5", text: "O idoso tem dificuldades para se locomover dentro de casa?" },
  { id: "q6", text: "O idoso tem dificuldades para subir escadas?" },
  { id: "q7", text: "O idoso tem dificuldades para caminhar uma quadra?" },
  { id: "q8", text: "O idoso tem dificuldades para carregar objetos pesados?" },
  { id: "q9", text: "O idoso tem dificuldades para fazer compras sozinho?" },
  { id: "q10", text: "O idoso tem dificuldades para usar o telefone?" },
  { id: "q11", text: "O idoso tem dificuldades para preparar refeições?" },
  { id: "q12", text: "O idoso tem dificuldades para fazer trabalhos domésticos leves?" },
  { id: "q13", text: "O idoso tem dificuldades para tomar medicamentos?" },
  { id: "q14", text: "O idoso tem dificuldades para controlar o dinheiro?" },
  { id: "q15", text: "O idoso apresenta perda de peso não intencional (mais de 4,5kg no último ano)?" },
  { id: "q16", text: "O idoso se sente exausto ou cansado na maior parte do tempo?" },
  { id: "q17", text: "O idoso tem baixo nível de atividade física?" },
  { id: "q18", text: "O idoso apresenta lentidão na marcha?" },
  { id: "q19", text: "O idoso tem fraqueza muscular (diminuição da força de preensão)?" },
  { id: "q20", text: "O idoso apresenta instabilidade postural ou quedas frequentes?" }
]

const IVCFAssessment: React.FC<IVCFAssessmentProps> = ({ 
  onComplete, 
  onCancel, 
  initialResponses = {} 
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [responses, setResponses] = useState<IVCFResponse>(initialResponses)
  const [showResults, setShowResults] = useState(false)

  const progress = ((currentQuestion + 1) / IVCF_QUESTIONS.length) * 100

  const handleResponse = (questionId: string, answer: string) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const goToNext = () => {
    if (currentQuestion < IVCF_QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    } else {
      calculateResults()
    }
  }

  const goToPrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
    }
  }

  const calculateResults = () => {
    let score = 0
    
    // Calculate score based on "Sim" responses
    Object.values(responses).forEach(answer => {
      if (answer.toLowerCase() === 'sim') {
        score += 1
      }
    })

    let classification = ''
    if (score === 0) {
      classification = 'Robusto'
    } else if (score >= 1 && score <= 2) {
      classification = 'Pré-frágil'
    } else {
      classification = 'Frágil'
    }

    setShowResults(true)
    
    // Call onComplete after a brief delay to show results
    setTimeout(() => {
      onComplete(responses, score, classification)
    }, 2000)
  }

  const currentQuestionData = IVCF_QUESTIONS[currentQuestion]
  const currentResponse = responses[currentQuestionData?.id] || ''
  const canProceed = currentResponse !== ''
  const allQuestionsAnswered = IVCF_QUESTIONS.every(q => responses[q.id])

  if (showResults) {
    const score = Object.values(responses).filter(answer => answer.toLowerCase() === 'sim').length
    const classification = score === 0 ? 'Robusto' : score <= 2 ? 'Pré-frágil' : 'Frágil'
    
    return (
      <Card className="dcare-shadow">
        <CardContent className="text-center py-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Avaliação Concluída!</h3>
          <div className="space-y-2">
            <p className="text-lg">Pontuação: <span className="font-bold text-primary">{score}</span></p>
            <p className="text-lg">Classificação: <span className="font-bold text-primary">{classification}</span></p>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Salvando resultados...
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="dcare-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            Avaliação IVCF-20 - Questão {currentQuestion + 1} de {IVCF_QUESTIONS.length}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
        <Progress value={progress} className="w-full" />
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium leading-relaxed">
            {currentQuestion + 1}. {currentQuestionData.text}
          </h3>
          
          <RadioGroup
            value={currentResponse}
            onValueChange={(value) => handleResponse(currentQuestionData.id, value)}
            className="space-y-3"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="sim" id="sim" />
              <Label htmlFor="sim" className="text-base cursor-pointer">Sim</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="nao" id="nao" />
              <Label htmlFor="nao" className="text-base cursor-pointer">Não</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={goToPrevious}
            disabled={currentQuestion === 0}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          
          <Button
            onClick={goToNext}
            disabled={!canProceed}
            className="flex items-center gap-2"
          >
            {currentQuestion === IVCF_QUESTIONS.length - 1 ? 'Finalizar' : 'Próxima'}
            {currentQuestion !== IVCF_QUESTIONS.length - 1 && <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>

        {/* Progress indicator */}
        <div className="text-center text-sm text-muted-foreground">
          {Object.keys(responses).length} de {IVCF_QUESTIONS.length} questões respondidas
        </div>
      </CardContent>
    </Card>
  )
}

export default IVCFAssessment

