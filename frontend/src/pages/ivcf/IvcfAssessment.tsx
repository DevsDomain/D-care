import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Brain,
  Users,
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  Award,
  Eye,
  Laugh,
  Footprints,
  AudioLines,
  PersonStanding,
  TriangleAlert,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button-variants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/hooks/use-toast";
import { mockApi } from "@/lib/api/mock";
import type { Elder, IvcfQuestion, IvcfResult } from "@/lib/types";
import { useAppStore } from "@/lib/stores/appStore";
import { createIVCF20, getIVCF20ByElderId } from "@/lib/api/ivcf20";

const CategoryMap = {
  "Autopercepção da saúde": {
    Icon: Eye,
    name: "Autopercepção da saúde",
    maxPt: 1,
  },
  Cognição: {
    Icon: Brain,
    name: "Cognição",
    maxPt: 4,
  },
  Humor: {
    Icon: Laugh,
    name: "Humor",
    maxPt: 4,
  },
  Mobilidade: {
    Icon: PersonStanding, // Atividade, pois Brain e Users já foram usados
    name: "Mobilidade",
    maxPt: 10,
  },
  "Atividades de vida diária": {
    Icon: Footprints,
    name: "Atividades de vida diária",
    maxPt: 6,
  },
  Comunicação: {
    Icon: AudioLines,
    name: "Comunicação",
    maxPt: 4,
  },
  "Comorbidades Múltiplas": {
    Icon: TriangleAlert,
    name: "Comorbidades Múltiplas",
    maxPt: 4,
  },
  Idade: {
    Icon: Users,
    name: "Idade",
    maxPt: 3,
  },
} as const;

export default function IvcfAssessment() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { selectedElder } = useAppStore();

  const [questions, setQuestions] = useState<IvcfQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<IvcfResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    // Função assíncrona interna (IIFE) para usar await
    const loadResult = async () => {
      if (!selectedElder) return; // Garante que selectedElder existe
      setLoading(true); // Opcional: inicie o loading aqui

      try {
        // 1. AWAIT a primeira resposta (dados principais)
        const response = await getIVCF20ByElderId(selectedElder!);

        if (response.data && response.data.id) {
          // 2. AWAIT a segunda chamada (para obter tips e recommendations)
          const tipsResponse = await mockApi.submitIvcfAssessment(
            response.data.id,
            response.data.answers
          );

          // 3. ATUALIZAÇÃO DO ESTADO com dados SÍNCRONOS
          setResult({
            recommendations: tipsResponse.data!.recommendations, // Agora é string[]
            tips: tipsResponse.data!.tips, // Agora é string[]
            completedAt: response.data.updatedAt,
            answers: JSON.parse(response.data.answers),
            score: response.data.score,
            category: response.data.category,
            id: response.data.id,
            elderId: response.data.elderId,
            validUntil: response.data.updatedAt,
          } as IvcfResult); // O casting é mais seguro agora que os tipos coincidem

          const baseQuestions = await mockApi.getIvcfQuestions();
          const mergedQuestions = mergeAnswersWithQuestions(
            baseQuestions.data!,
            JSON.parse(response.data.answers)
          );

          setQuestions(mergedQuestions);
          setAnswers(JSON.parse(response.data.answers));
          setShowResult(true);
        } else {
          const baseQuestions = await mockApi.getIvcfQuestions();
          setQuestions(baseQuestions.data!);
        }
      } catch (error) {
        // Lida com erros de rede ou de API (incluindo 404/400 se a API os lançar)
        console.error("Erro ao carregar resultado IVCF20:", error);
      } finally {
        setLoading(false);
      }
    };

    loadResult();
  }, [selectedElder]); // Adicione selectedElder como dependência se ele puder mudar

  const handleNewAssessment = () => {
    setResult(null);
    loadQuestions();
  };

  const mergeAnswersWithQuestions = (
    questionsArray: IvcfQuestion[],
    answersMap: Record<string, number>
  ): IvcfQuestion[] => {
    return questionsArray.map((question) => {
      // Look up the score for the current question ID
      const answerValue = answersMap[question.id];

      // Return a new question object with the previousAnswerValue filled
      return {
        ...question,
        // Use the found answer value, or 0 if the question wasn't answered for some reason
        previousAnswerValue: answerValue !== undefined ? answerValue : 0,
      };
    });
  };

  const loadQuestions = async () => {
    try {
      const response = await mockApi.getIvcfQuestions();
      if (response.success && response.data) {
        setQuestions(response.data);
      }
    } catch {
      toast({
        title: "Erro",
        description: "Falha ao carregar questionário",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const elderAge = (Elder: Elder) => {
    if (!Elder.birthDate) return null;
    const birthDate = new Date(Elder.birthDate);
    const ageDifMs = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const elderAgePoints = (age: number) => {
    if (age === null) return 0;
    if (age <= 74) return 0;
    if (age <= 84) return 1;
    if (age >= 85) return 3;
    return 0;
  };

  const handleAnswer = (questionId: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const goToNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      submitAssessment();
    }
  };

  const goToPrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const submitAssessment = async () => {
    if (!selectedElder) {
      toast({
        title: "Erro",
        description: "Idoso não selecionado",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await mockApi.submitIvcfAssessment(
        selectedElder.id,
        answers
      );
      if (response.success && response.data) {
        const resBd = await createIVCF20(selectedElder, response.data);
        if (resBd.data) {
          setResult(response.data);
          setShowResult(true);
          toast({
            title: "Avaliação Concluída",
            description: "Resultados calculados com sucesso",
          });
        }
      }
    } catch {
      toast({
        title: "Erro",
        description: "Falha ao processar avaliação",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getCategoryResults = () => {
    if (!result) return {};

    const categoryScores: Record<string, { current: number; max: number }> = {};

    const age = elderAge(selectedElder!);
    const agePoints = elderAgePoints(age!);

    if (!categoryScores["Idade"]) {
      categoryScores["Idade"] = {
        current: agePoints,
        max: 3,
      };
    } else {
      categoryScores["Idade"].current += agePoints;
    }

    questions.forEach((question) => {
      const answer = result.answers[question.id] || 0;
      const maxScore = Math.max(...question.options.map((opt) => opt.value));

      if (!categoryScores[question.category]) {
        categoryScores[question.category] = {
          current: 0,
          max: CategoryMap[question.category as keyof typeof CategoryMap].maxPt,
        };
      }

      const categoryMax =
        CategoryMap[question.category as keyof typeof CategoryMap].maxPt;
      const newScore = categoryScores[question.category].current + answer;

      categoryScores[question.category].current = Math.min(
        newScore,
        categoryMax
      );
      categoryScores[question.category].max += maxScore;
    });

    return categoryScores;
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQ = questions[currentQuestion];
  const hasAnswer = currentQ && answers[currentQ.id] !== undefined;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-healthcare-light mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando questionário...</p>
        </div>
      </div>
    );
  }

  if (showResult && result) {
    const categoryScores = getCategoryResults();

    return (
      <div className="min-h-screen bg-background pb-24">
        {/* Header */}
        <div className="bg-card border-b border-border px-4 py-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                Resultado IVCF-20
              </h1>
              <p className="text-sm text-muted-foreground">
                Avaliação de {selectedElder?.name}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Overall Score */}
          <Card className="healthcare-card">
            <CardContent className="pt-6 text-center">
              <div className="mx-auto w-24 h-24 rounded-full bg-healthcare-soft flex items-center justify-center mb-4">
                <Award className="w-12 h-12 text-healthcare-dark" />
              </div>

              <h2 className="text-3xl font-bold text-foreground mb-2">
                <p>Pontuação</p>
                {result.score}/36
              </h2>

              <Badge
                className={`text-sm px-4 py-2 ${
                  result.category === "Idoso(a) Robusto"
                    ? "bg-medical-success text-white"
                    : result.category === "Idoso(a) Potencialmente Frágil"
                    ? "bg-medical-warning text-neutral-900"
                    : "bg-medical-critical text-white"
                }`}
              >
                {result.category === "Idoso(a) Robusto"
                  ? "Independente"
                  : result.category === "Idoso(a) Potencialmente Frágil"
                  ? "Fragilizado"
                  : "Em Risco"}
              </Badge>

              <p className="text-sm text-muted-foreground mt-2">
                Avaliação realizada em{" "}
                {new Date(result.completedAt).toLocaleDateString("pt-BR")}
              </p>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-healthcare-light" />
                Detalhamento por Categoria
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(categoryScores).map(([category, scores]) => {
                const categoryInfo =
                  CategoryMap[category as keyof typeof CategoryMap];
                const percentage = (scores.current / categoryInfo.maxPt) * 100;

                return (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <categoryInfo.Icon className="w-4 h-4 text-healthcare-light" />
                        <span className="text-sm font-medium">
                          {categoryInfo.name}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {scores.current}/{categoryInfo.maxPt}
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Recomendações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {result.tips.map((tip, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-healthcare-soft rounded-xl"
                  >
                    <Check className="w-5 h-5 text-healthcare-dark mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-healthcare-dark">{tip}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              className="w-full"
              variant="secondary"
              onClick={() => handleNewAssessment()}
            >
              <Activity className="w-4 h-4 mr-2" />
              Refazer Avaliação IVCF20
            </Button>

            <Button
              className="w-full"
              variant="outline"
              onClick={() => navigate("/")}
            >
              Voltar ao Início
            </Button>
          </div>
        </div>
      </div>
    );
  }
  const currentCategory =
    CategoryMap[currentQ.category as keyof typeof CategoryMap];
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-foreground">
              Avaliação IVCF-20
            </h1>
            <p className="text-sm text-muted-foreground">
              Questão {currentQuestion + 1} de {questions.length}
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-4 space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground text-center">
            {Math.round(progress)}% concluído
          </p>
        </div>
      </div>

      {currentQ && (
        <div className="p-4 space-y-6">
          {/* Category indicator */}
          <div className="flex items-center gap-2">
            {React.createElement(currentCategory.Icon, {
              className: "w-6 h-6 text-healthcare-light",
            })}
            <Badge
              variant="secondary"
              className="bg-healthcare-soft text-healthcare-dark text-md"
            >
              {currentCategory.name}
            </Badge>
          </div>

          {/* Question */}
          <Card className="healthcare-card">
            <CardHeader>
              <CardTitle className="text-lg leading-relaxed">
                {currentQ.question}
              </CardTitle>
              {currentQ.description && (
                <p className="text-sm text-muted-foreground">
                  {currentQ.description.split(";").map((line, idx) => (
                    <React.Fragment key={idx}>
                      {line}
                      <br />

                      <br />
                    </React.Fragment>
                  ))}
                </p>
              )}
            </CardHeader>

            <CardContent>
              <RadioGroup
                key={currentQ.id}
                value={answers[currentQ.id]?.toString()}
                onValueChange={(value) =>
                  handleAnswer(currentQ.id, parseInt(value))
                }
                className="space-y-4"
              >
                {currentQ.options.map((option) => (
                  <div
                    key={option.value}
                    className="flex items-start space-x-3 p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors"
                  >
                    <RadioGroupItem
                      value={option.value.toString()}
                      id={`${currentQ.id}-${option.value}`}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor={`${currentQ.id}-${option.value}`}
                        className="cursor-pointer font-medium text-foreground"
                      >
                        {option.label}
                      </Label>
                      {option.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {option.description}
                        </p>
                      )}
                    </div>
                    <span className="text-sm font-medium text-healthcare-dark">
                      {option.value} pts
                    </span>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={goToPrevious}
              disabled={currentQuestion === 0}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Anterior
            </Button>

            <Button
              variant="healthcare"
              onClick={goToNext}
              disabled={!hasAnswer}
              className="flex-1"
            >
              {currentQuestion === questions.length - 1 ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Finalizar
                </>
              ) : (
                <>
                  Próxima
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
