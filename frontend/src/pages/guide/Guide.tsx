import { useState, useEffect, useRef } from "react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Send, Bot, Sparkles } from "lucide-react";

// Mantive sua lista de tópicos original
const topics = [
  "o que é cuidar",
  "papel do cuidador",
  "cuidador formal e informal",
  "saúde do cuidador",
  "exercícios respiratórios",
  "exercícios aeróbicos",
  "alongamento muscular",
  "fortalecimento muscular",
  "adaptações ambientais",
  "cuidados com medicação",
  "higiene do idoso acamado",
  "cuidados com próteses dentárias",
  "assaduras em idosos",
  "troca de fralda",
  "uso de hidratante na pele",
  "comunicação com familiares",
  "como agir em caso de óbito",
  "engasgo em idosos",
  "quedas em idosos",
  "convulsão em idosos",
  "vômitos em idosos",
  "diabetes mellitus",
  "hipertensão arterial",
  "hipotensão ortostática",
  "dificuldade de memória",
  "problemas de sono",
  "demência em idosos",
  "curativos em idosos",
  "autonomia do idoso",
  "maus tratos ao idoso",
  "exercícios de mobilização passiva",
];

function getRandomSuggestions(num: number = 5): string[] {
  const shuffled = [...topics].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, num);
}

export default function Guide() {
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>(
    [
      {
        text: 'Olá! Sou seu assistente virtual D-Care. Tire suas dúvidas sobre cuidados com idosos baseadas no manual "Amar é Cuidar".',
        isUser: false,
      },
    ]
  );
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const messagesRef = useRef<HTMLDivElement>(null);

  const backendUrl =
    (import.meta.env.REACT_APP_CHATBOT_BACKEND_URL as string) ||
    "http://localhost:8888/query";

  useEffect(() => {
    setSuggestions(getRandomSuggestions());
  }, []);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const sendMessage = async (question: string) => {
    if (!question.trim()) return;

    const currentInput = question;
    setInput("");
    setMessages((prev) => [...prev, { text: currentInput, isUser: true }]);
    setIsTyping(true);

    try {
      const response = await fetch(backendUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: currentInput, top_k: 3 }),
      });

      if (!response.ok) throw new Error("Erro na resposta");

      const data = await response.json();
      const results = data.results || [];

      let botResponse = "";
      results.forEach((res: any) => {
        botResponse += `<div class="mb-4 last:mb-0">`;
        botResponse += `<h3 class="font-bold text-[#2c6fb5]">${
          res.topic
        } <span class="text-xs text-gray-500 font-normal">(${
          res.module || "Geral"
        })</span></h3>`;
        botResponse += `<p class="mt-1 text-sm">${res.content}</p>`;
        botResponse += `</div>`;
      });

      if (!botResponse)
        botResponse =
          "Desculpe, não encontrei informações relevantes para essa dúvida.";
      else
        botResponse += `<div class="mt-2 pt-2 border-t border-gray-200 text-[10px] text-gray-400 italic">Fonte: Manual "Amar é Cuidar" - PUC Minas</div>`;

      setMessages((prev) => [...prev, { text: botResponse, isUser: false }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          text: "Desculpe, ocorreu um erro de conexão. Tente novamente.",
          isUser: false,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendMessage(input);
    }
  };

  return (
    // AJUSTE CRÍTICO AQUI:
    // h-[calc(100dvh-85px)]: Define a altura total menos ~85px para a barra de navegação inferior.
    // overflow-hidden: Garante que nada vaze do container principal.
    <div className="flex flex-col items-center w-full h-[calc(100dvh-85px)] md:h-[85vh] bg-[#f0f4f8] overflow-hidden">
      {/* Container do Chat */}
      <div className="w-full md:max-w-[500px] bg-white md:rounded-[20px] shadow-xl flex flex-col h-full overflow-hidden">
        {/* 1. HEADER (Fixo no topo do container) */}
        <div className="flex-none bg-[#2c6fb5] text-white p-3 flex items-center gap-3 shadow-sm z-10">
          <div className="bg-white/20 p-2 rounded-full">
            <Bot size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-none">ChatBot D-Care</h1>
            <p className="text-xs text-blue-100 opacity-90">
              Assistente Virtual
            </p>
          </div>
        </div>

        {/* 2. AREA DE MENSAGENS (Flex-1 para ocupar o espaço do meio e scrollar) */}
        <div
          ref={messagesRef}
          className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 bg-[#f8fafc]"
        >
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${
                msg.isUser
                  ? "bg-[#2c6fb5] text-white self-end rounded-br-none"
                  : "bg-white border border-gray-100 text-gray-700 self-start rounded-bl-none"
              }`}
            >
              <div dangerouslySetInnerHTML={{ __html: msg.text }} />
            </div>
          ))}

          {isTyping && (
            <div className="self-start bg-white border border-gray-100 p-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-1 w-16">
              <div
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <div
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <div
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </div>
          )}
        </div>

        {/* 3. SUGESTÕES E INPUT (Fixo na parte inferior do container) */}
        <div className="flex-none bg-white border-t border-gray-100">
          {/* Sugestões com Scroll Horizontal */}
          {suggestions.length > 0 && (
            <div className="flex overflow-x-auto gap-2 p-3 pb-0 scrollbar-hide select-none">
              <div className="flex items-center text-xs font-bold text-[#2c6fb5] mr-1 flex-shrink-0">
                <Sparkles size={14} className="mr-1" /> Dicas:
              </div>
              {suggestions.map((sug, index) => (
                <button
                  key={index}
                  onClick={() => sendMessage(sug)}
                  className="whitespace-nowrap bg-blue-50 text-[#2c6fb5] px-3 py-1.5 rounded-full text-xs font-medium border border-blue-100 hover:bg-blue-100 transition-colors flex-shrink-0"
                >
                  {sug}
                </button>
              ))}
            </div>
          )}

          {/* Área de Input */}
          <div className="p-3 flex gap-2 items-center pb-4">
            {" "}
            {/* pb-4 para dar um respiro antes da nav bar */}
            <Input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua dúvida..."
              className="flex-1 bg-gray-50 border-gray-200 rounded-full px-4 h-10 focus-visible:ring-[#2c6fb5] focus-visible:ring-1"
            />
            <Button
              onClick={() => sendMessage(input)}
              size="icon"
              className="rounded-full bg-[#2c6fb5] hover:bg-[#1e4e8c] w-10 h-10 flex-shrink-0"
              disabled={!input.trim()}
            >
              <Send size={18} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
