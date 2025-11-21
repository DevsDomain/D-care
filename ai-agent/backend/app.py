# app.py (Atualizado para integrar o modelo MLP, Word2Vec e fallback com BM25/TF-IDF)
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import uvicorn, os, json
import numpy as np
import nltk
import spacy
from gensim.models import Word2Vec
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler
from bm25 import BM25
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from fastapi.middleware.cors import CORSMiddleware

# Baixar recursos NLTK
nltk.download('stopwords', quiet=True)
nltk.download('punkt', quiet=True)

# Configurações
MODEL_FILE = 'mlp_intent_classifier_improved.npy'
W2V_MODEL_FILE = 'word2vec_model_improved.bin'
CONFIDENCE_THRESHOLD = 0.6

# Carregar SpaCy
nlp = spacy.load('pt_core_news_sm', disable=['parser', 'ner'])


# Carregar knowledge base
with open('knowledge_base.json', 'r', encoding='utf-8') as f:
    KNOWLEDGE_BASE = json.load(f)
ID_TO_CONTENT = {item['id']: item for item in KNOWLEDGE_BASE}

# Preparar documentos para BM25/TF-IDF
DOC_TEXTS = [(str(item['id']), item['topic'] + ' ' + item['content'] + ' ' + ' '.join(item.get('keywords', []))) for item in KNOWLEDGE_BASE]
DOC_STRS = [t for (_, t) in DOC_TEXTS]
bm25 = BM25(DOC_STRS)
vectorizer = TfidfVectorizer(lowercase=True)
X_tfidf = vectorizer.fit_transform(DOC_STRS)

# Funções de pré-processamento e embedding (mesmas do chatbot_mlp_improved.py)
STOPWORDS = set(nltk.corpus.stopwords.words('portuguese')) - {'cuidador', 'idoso', 'saúde'}

def preprocess_text(text):
    doc = nlp(text.lower())
    tokens = [token.lemma_ for token in doc if token.text not in STOPWORDS and len(token.text) > 2]
    return tokens

def get_sentence_embedding(tokens, w2v_model):
    vectors = [w2v_model.wv[token] for token in tokens if token in w2v_model.wv]
    return np.mean(vectors, axis=0) if vectors else np.zeros(w2v_model.vector_size)

# Fallback search (mesmo do chatbot_mlp_improved.py)
def fallback_search(query, top_k=3):
    scores = bm25.get_scores(query)
    ranked = sorted(scores, key=lambda x: x[1], reverse=True)[:top_k]
    
    q_vec = vectorizer.transform([query])
    sims = cosine_similarity(q_vec, X_tfidf)[0]
    ranked_tfidf = sims.argsort()[::-1][:top_k]
    
    results = []
    seen_ids = set()
    for idx, score in ranked:
        if len(results) >= top_k:
            break
        item = KNOWLEDGE_BASE[idx]
        if item['id'] not in seen_ids:
            results.append({
                'id': item['id'],
                'topic': item['topic'],
                'module': item.get('module'),
                'content': item['content'],
                'score': float(score)
            })
            seen_ids.add(item['id'])
    
    return results

# Carregar modelos na inicialização do app
w2v_model = Word2Vec.load(W2V_MODEL_FILE)
mlp, le, scaler, vocab = np.load(MODEL_FILE, allow_pickle=True)

app = FastAPI(title="ChatBot D-Care - API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Query(BaseModel):
    question: str
    top_k: Optional[int] = 3

@app.get("/health")
def health():
    return {"status": "ok", "items": len(KNOWLEDGE_BASE)}


@app.post("/query")
def query(q: Query):
    question = q.question
    top_k = q.top_k or 3

    # 1. Predição com MLP
    tokens = preprocess_text(question)
    embedding = get_sentence_embedding(tokens, w2v_model)
    embedding = scaler.transform([embedding])
    
    probs = mlp.predict_proba(embedding)[0]
    max_prob = np.max(probs)
    pred = mlp.predict(embedding)[0]
    intent_id = le.inverse_transform([pred])[0]
    
    results = []
    
    # 2. Verifica se é MLP com alta confiança
    if max_prob > CONFIDENCE_THRESHOLD and intent_id in ID_TO_CONTENT:
        item = ID_TO_CONTENT[intent_id]
        results.append({
            "topic": item['topic'],
            "module": item.get('module', 'Geral'),
            "content": item['content'],
            "confidence": float(max_prob),
            "source": "MLP"
        })
    else:
        # 3. Fallback para BM25/TF-IDF se MLP falhar
        fallback_results = fallback_search(question, top_k)
        
        # Filtra resultados do fallback que tenham um score mínimo aceitável
        # (BM25 scores variam, mas geralmente algo > 0 mostra relevância)
        valid_fallback = [res for res in fallback_results if res['score'] > 1.0] 
        
        if valid_fallback:
            for res in valid_fallback:
                results.append({
                    "topic": res['topic'],
                    "module": res.get('module', 'Geral'),
                    "content": res['content'],
                    "score": res['score'],
                    "source": "Fallback Search"
                })
        else:
            # 4. FALLBACK FINAL (Nenhum modelo encontrou resposta relevante)
            # Retornamos a resposta amigável sugerindo reformulação
            return {
                "query": question,
                "results": [{
                    "topic": "Não entendi bem",
                    "module": "Sistema",
                    "content": "Desculpe, não encontrei essa informação no guia. Tente reformular sua pergunta ou use palavras-chave mais simples (ex: 'banho', 'alimentação', 'diabetes').",
                    "confidence": 0.0,
                    "source": "System Fallback"
                }]
            }
    
    return {"query": question, "results": results}
    question = q.question
    top_k = q.top_k or 3

    # Predição com MLP
    tokens = preprocess_text(question)
    embedding = get_sentence_embedding(tokens, w2v_model)
    embedding = scaler.transform([embedding])
    
    probs = mlp.predict_proba(embedding)[0]
    max_prob = np.max(probs)
    pred = mlp.predict(embedding)[0]
    intent_id = le.inverse_transform([pred])[0]
    
    results = []
    if max_prob > CONFIDENCE_THRESHOLD and intent_id in ID_TO_CONTENT:
        item = ID_TO_CONTENT[intent_id]
        results.append({
            "topic": item['topic'],
            "module": item.get('module', 'Geral'),
            "content": item['content'],
            "confidence": float(max_prob),
            "source": "MLP"
        })
    else:
        # Fallback para BM25/TF-IDF
        fallback_results = fallback_search(question, top_k)
        for res in fallback_results:
            results.append({
                "topic": res['topic'],
                "module": res.get('module', 'Geral'),
                "content": res['content'],
                "score": res['score'],
                "source": "Fallback Search"
            })
    
    if not results:
        raise HTTPException(status_code=404, detail="Nenhuma resposta encontrada. Tente reformular a pergunta.")
    
    return {"query": question, "results": results}

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)