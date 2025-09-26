# ChatBot D-Care

## Descrição

O **ChatBot D-Care** é um chatbot rule-based/retrieval-based projetado para responder dúvidas sobre cuidados com idosos, utilizando como base o manual "Amar é Cuidar" da PUC Minas Betim. Ele combina técnicas de processamento de linguagem natural (PLN) e aprendizado de máquina para oferecer respostas precisas e relevantes, com um frontend web moderno e elegante para interação com o usuário.

### Funcionalidades

- **Classificação de Intenções**: Usa Word2Vec (Gensim) para vetorizar perguntas e MLPClassifier (Scikit-learn) para identificar a intenção (tópico) da pergunta.
- **Busca Fallback**: Quando a confiança do MLP é baixa, utiliza BM25 e TF-IDF para recuperar respostas relevantes do `knowledge_base.json`.
- **Frontend Interativo**: Interface web em Flask com design inspirado no manual, incluindo emojis (👵🏻👴🏻), sugestões de perguntas, indicador de digitação e respostas formatadas.
- **Configuração Flexível**: Suporta configuração via `config.yaml` (mapeado via volume no Docker) e `.env` para desenvolvimento local.
- **Dockerizado**: Backend (FastAPI) e frontend (Flask) são executados em containers separados, com integração via Docker Compose.

### Tecnologias

- **Backend**:
  - Python 3.11
  - FastAPI (API REST)
  - Scikit-learn (MLPClassifier)
  - Gensim (Word2Vec)
  - NLTK e SpaCy (pré-processamento PLN)
  - BM25 e TF-IDF (busca semântica)
- **Frontend**:
  - Flask (servidor web)
  - HTML, CSS, JavaScript (interface de chat)
- **Outros**:
  - Docker e Docker Compose
  - PyYAML e python-dotenv (configuração)

## Estrutura do Projeto

```
.
├── app.py                        # Backend FastAPI
├── bm25.py                       # Implementação do BM25
├── chatbot_mlp_improved.py       # Treinamento do modelo MLP e Word2Vec
├── frontend_app.py               # Servidor Flask para frontend
├── templates/
│   └── index.html                # Interface web do chat
├── knowledge_base.json           # Base de conhecimento (tópicos e conteúdos)
├── guia_cuidador.txt             # Corpus para treinamento do Word2Vec
├── word2vec_model_improved.bin   # Modelo Word2Vec treinado
├── mlp_intent_classifier_improved.npy  # Modelo MLP treinado
├── config.yaml                   # Configuração (backend_url)
├── .env                          # Configuração local (não versionar)
├── Dockerfile.backend            # Dockerfile para backend
├── Dockerfile.frontend           # Dockerfile para frontend
├── docker-compose.yml            # Docker Compose para ambos os serviços
├── requirements.txt              # Dependências Python
```

## Requisitos

- **Python**: 3.11+
- **Docker**: Para execução em containers
- **Dependências**: Listadas em `requirements.txt`
  - fastapi, uvicorn, scikit-learn, numpy, nltk, gensim, spacy, flask, requests, python-dotenv, pyyaml
- **Modelos Treinados**: `word2vec_model_improved.bin` e `mlp_intent_classifier_improved.npy` (gerados via treinamento)
- **Arquivos de Dados**: `knowledge_base.json` e `guia_cuidador.txt`

## Instalação Local

1. Clone o repositório:

   ```bash
   git clone https://github.com/DevsDomain/D-care.git
   cd ai-agent
   ```

2. Instale as dependências:

   ```bash
   pip install -r requirements.txt
   python -m spacy download pt_core_news_sm
   python -m nltk.downloader stopwords punkt
   ```

3. (Opcional) Treine os modelos se não houver arquivos pré-treinados:
   ```bash
   python chatbot_ml.py --train
   ```
   Isso gera `word2vec_model_improved.bin` e `mlp_intent_classifier_improved.npy`.

## Execução Local

1. Configure o arquivo `.env` (não versionar):

   ```bash
   echo -e "BACKEND_URL=http://localhost:8000/query\nPORT=5000\nCONFIG_PATH=config.yaml" > .env
   ```

2. Rode o backend (FastAPI):

   ```bash
   uvicorn app:app --host 0.0.0.0 --port 8000
   ```

3. Rode o frontend (Flask):

   ```bash
   python frontend_app.py
   ```

4. Acesse o frontend em `http://localhost:5000`.

## Execução com Docker

1. Crie o arquivo `config.yaml`:

   ```yaml
   backend_url: http://chatbot-backend-dcare:8000/query
   ```

2. Construa e execute com Docker Compose:

   ```bash
   docker-compose up --build
   ```

3. Acesse:

   - Frontend: `http://localhost:5000`
   - Backend (Swagger): `http://localhost:8000/docs`

4. **Notas**:
   - O volume `./config.yaml:/app/config.yaml` permite alterar a configuração sem rebuild.
   - O `.env` é usado apenas localmente; no Docker, o `config.yaml` tem prioridade.

## Uso do Frontend

- **Interface**: Um chat com título "ChatBot D-Care" (com emojis 👵🏻👴🏻), mensagens do usuário (azul claro) e do bot (cinza claro), sugestões de perguntas clicáveis, e um indicador de digitação.
- **Interação**: Digite uma pergunta no campo de entrada e pressione Enter ou clique em "Enviar". Sugestões de tópicos aparecem abaixo do chat.
- **Respostas**: Exibem o tópico (em negrito), módulo, conteúdo, confiança/score, e fonte ("Manual Amar é Cuidar - PUC Minas").

Exemplo de interação:

```
Você: Como evitar assaduras em idosos?
Bot: **Assaduras em idosos** (Módulo 5)
Assaduras são comuns em acamados. Devem-se manter pele limpa e seca, usar hidratantes e, se necessário, cremes de barreira.
Confiança: 94.87%
Fonte: Manual "Amar é Cuidar" - PUC Minas
```

## Integração com API

O frontend consome a API FastAPI via endpoint `/query`. Exemplo de chamada:

```javascript
fetch("http://localhost:5000/send_message", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ question: "Como cuidar de idosos?" }),
})
  .then((response) => response.json())
  .then((data) => console.log(data.results));
```

## Treinamento

O treinamento é feito com `chatbot_mlp_improved.py --train`:

- **Corpus**: `guia_cuidador.txt` + `knowledge_base.json` para Word2Vec.
- **Dados Sintéticos**: Gerados a partir de templates e keywords do knowledge base.
- **Acurácia**: ~64% no conjunto de teste (depende dos dados sintéticos).
- **Modelos Salvos**: Word2Vec (embeddings) e MLPClassifier (classificador de intenções).

## Limitações

- **Acurácia do MLP**: Depende da qualidade e quantidade dos dados sintéticos. Considere expandir templates ou usar embeddings pré-treinados (e.g., NILC).
- **Conversa sem Estado**: Não mantém histórico de contexto (pode ser implementado com sessões).
- **Sugestões**: Aleatórias; podem ser refinadas com base em frequência ou relevância.
- **Corpus Limitado**: O `guia_cuidador.txt` pode ser expandido para melhorar os embeddings.

## Contribuições

- Fork e PR são bem-vindos!
- Sugestões de melhorias:
  - Adicionar embeddings pré-treinados para melhorar a vetorização.
  - Implementar histórico de conversa persistente.
  - Otimizar hiperparâmetros do MLP ou testar outros classificadores (e.g., SVM).

## Licença

Baseado no manual "Amar é Cuidar" - PUC Minas Betim. Uso educacional e não comercial.
