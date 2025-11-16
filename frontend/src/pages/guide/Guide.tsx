import { useState, useEffect, useRef } from "react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

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

function getRandomSuggestions(num: number = 6): string[] {
  const shuffled = [...topics].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, num);
}

export default function Guide() {
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>(
    [
      {
        text: 'Olá! Sou seu assistente virtual para tirar dúvidas sobre cuidados com idosos. Posso ajudar com informações baseadas no manual "Amar é Cuidar" da PUC Minas. Como posso ajudar você hoje?',
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

  /* const backendUrl =
    process.env.REACT_APP_CHATBOT_BACKEND_URL ||
    "http://chatbot_backend_dcare:8000/query"; */

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

    setMessages((prev) => [...prev, { text: question, isUser: true }]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch(backendUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, top_k: 3 }),
      });

      if (!response.ok) throw new Error("Erro na resposta");

      const data = await response.json();
      const results = data.results || [];

      let botResponse = "";
      results.forEach((res: any) => {
        botResponse += `<strong>${res.topic}</strong> (${
          res.module || "Geral"
        })<br><br>`;
        botResponse += `${res.content}<br><br>`;
        if (res.confidence) {
          botResponse += `<em>Confiança: ${(res.confidence * 100).toFixed(
            2
          )}%</em><br>`;
        } else if (res.score) {
          botResponse += `<em>Score: ${res.score.toFixed(2)}</em><br>`;
        }
        botResponse += `<em>Fonte: Manual "Amar é Cuidar" - PUC Minas</em><br><br>`;
      });

      setMessages((prev) => [
        ...prev,
        {
          text:
            botResponse || "Desculpe, não encontrei informações relevantes.",
          isUser: false,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { text: "Desculpe, ocorreu um erro. Tente novamente.", isUser: false },
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
    <div className="flex justify-center items-center min-h-screen bg-[#f0f4f8] text-[#333] p-5">
      <div className="w-full max-w-[700px] bg-white rounded-[15px] shadow-[0_6px_20px_rgba(0,0,0,0.1)] flex flex-col h-[85vh]">
        <div className="bg-[#2c6fb5] text-white p-5 text-center text-[1.5em] font-bold rounded-t-[15px]">
          <span className="text-[1.2em] mr-2.5">👵🏻👴🏻</span> ChatBot D-Care
          <div className="text-[0.9em] font-normal mt-1.5">
            Baseado no manual "Amar é Cuidar" - PUC Minas
          </div>
        </div>
        <div
          ref={messagesRef}
          className="flex-1 p-5 overflow-y-auto flex flex-col gap-[15px]"
        >
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`max-w-[75%] p-[12px_18px] rounded-[12px] leading-[1.5] text-base ${
                msg.isUser
                  ? "bg-[#d1e7ff] self-end rounded-br-[4px]"
                  : "bg-[#f5f5f5] self-start rounded-bl-[4px]"
              }`}
              dangerouslySetInnerHTML={{ __html: msg.text }}
            />
          ))}
          <div
            className={`${
              isTyping ? "block" : "hidden"
            } self-start text-[#666] italic p-[10px_18px]`}
          >
            Digitando...
          </div>
        </div>
        <div className="p-[10px_20px] bg-[#f9f9f9] border-t border-[#ddd] flex flex-wrap gap-[10px]">
          {suggestions.map((sug, index) => (
            <div
              key={index}
              className="bg-[#e6f0fa] p-[8px_15px] rounded-[20px] cursor-pointer text-[0.9em] hover:bg-[#d1e7ff]"
              onClick={() => sendMessage(sug)}
            >
              {sug}
            </div>
          ))}
        </div>
        <div className="flex p-[15px] bg-[#f9f9f9] border-t border-[#ddd]">
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua dúvida sobre cuidados com idosos..."
            className="flex-1 p-3 border border-[#ccc] rounded-[25px] text-base outline-none mr-[10px]"
          />
          <Button
            onClick={() => sendMessage(input)}
            className="bg-[#2c6fb5] text-white border-none p-[12px_20px] rounded-[25px] cursor-pointer text-base hover:bg-[#1e4e8c]"
          >
            Enviar
          </Button>
        </div>
        <div className="text-center p-[10px] bg-[#f9f9f9] rounded-b-[15px] text-[0.85em] text-[#666]">
          Baseado no manual "Amar é Cuidar" - PUC Minas Betim | Solução com
          embeddings locais
        </div>
      </div>
    </div>
  );
}
