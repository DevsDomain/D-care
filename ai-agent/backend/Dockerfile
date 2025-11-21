# Dockerfile para o serviço do ChatBot
FROM python:3.11-slim

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos necessários
COPY requirements.txt .
COPY app.py .
COPY bm25.py .
COPY knowledge_base.json .
COPY guia_cuidador.txt .
COPY chatbot_ml.py .
COPY word2vec_model_improved.bin .
COPY mlp_intent_classifier_improved.npy .

# Instalar dependências
RUN pip install --no-cache-dir -r requirements.txt \
    && python -m spacy download pt_core_news_sm \
    && python -m nltk.downloader stopwords punkt punkt_tab

# Expor a porta do FastAPI
EXPOSE 8000

# Comando para rodar o app
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]