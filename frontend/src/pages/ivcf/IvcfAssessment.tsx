import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Brain,
  Users,
  Activity,
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  Share2,
  Download,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button-variants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/hooks/use-toast";
import { mockApi } from "@/lib/api/mock";
import type { IvcfQuestion, IvcfResult } from "@/lib/types";
import { useAppStore } from "@/lib/stores/appStore";

const CategoryMap = {
  "Autopercepção da saúde": {
    Icon: Activity,
    name: "Autopercepção da saúde",
  },
  Cognição: {
    Icon: Brain,
    name: "Cognição",
  },
  Humor: {
    Icon: Users,
    name: "Humor",
  },
  Mobilidade: {
    Icon: Activity, // Atividade, pois Brain e Users já foram usados
    name: "Mobilidade",
  },
  "Atividades de vida diária": {
    Icon: Activity,
    name: "Atividades de vida diária",
  },
  Comunicação: {
    Icon: Users,
    name: "Comunicação",
  },
  "Comorbidades Múltiplas": {
    Icon: Activity,
    name: "Comorbidades Múltiplas",
  },
  // Adicione outras categorias da sua IvcfQuestion aqui
} as const; // 'as const' para tipagem forte

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
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const response = await mockApi.getIvcfQuestions();
      if (response.success && response.data) {
        setQuestions(response.data);
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao carregar questionário",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
        setResult(response.data);
        setShowResult(true);
        toast({
          title: "Avaliação Concluída",
          description: "Resultados calculados com sucesso",
        });
      }
    } catch (error) {
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

    questions.forEach((question) => {
      const answer = result.answers[question.id] || 0;
      const maxScore = Math.max(...question.options.map((opt) => opt.value));

      if (!categoryScores[question.category]) {
        categoryScores[question.category] = { current: 0, max: 0 };
      }

      categoryScores[question.category].current += answer;
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
                {result.score}/{questions.length * 2}
              </h2>

              <Badge
                className={`text-sm px-4 py-2 ${
                  result.category === "independent"
                    ? "bg-medical-success text-white"
                    : result.category === "at-risk"
                    ? "bg-medical-warning text-neutral-900"
                    : "bg-medical-critical text-white"
                }`}
              >
                {result.category === "independent"
                  ? "Independente"
                  : result.category === "at-risk"
                  ? "Em Risco"
                  : "Fragilizado"}
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
                const percentage = (scores.current / scores.max) * 100;

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
                        {scores.current}/{scores.max}
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
            <Button className="w-full" variant="healthcare">
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar Resultado
            </Button>

            <Button className="w-full" variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exportar PDF
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
              className: "w-5 h-5 text-healthcare-light",
            })}
            <Badge
              variant="secondary"
              className="bg-healthcare-soft text-healthcare-dark"
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
