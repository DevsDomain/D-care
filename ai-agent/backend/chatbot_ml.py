# chatbot_mlp_improved.py
# Implementação melhorada do Chatbot Cuidar+ Idosos com Word2Vec, MLPClassifier e integração com BM25/TF-IDF

import json
import re
import argparse
import numpy as np
import pandas as pd
from collections import defaultdict
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
from gensim.models import Word2Vec
from gensim.utils import simple_preprocess
import nltk
from nltk.corpus import stopwords
import spacy
from bm25 import BM25
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Baixar recursos NLTK
nltk.download('stopwords', quiet=True)
nltk.download('punkt', quiet=True)

# Configurações
STOPWORDS = set(stopwords.words('portuguese')) - {'cuidador', 'idoso', 'saúde'}  # Manter palavras relevantes
WORD2VEC_SIZE = 100
WORD2VEC_WINDOW = 5
WORD2VEC_MIN_COUNT = 2  # Ignorar palavras muito raras
MLP_HIDDEN_LAYERS = (200, 100)
MLP_MAX_ITER = 1000
MODEL_FILE = 'mlp_intent_classifier_improved.npy'
W2V_MODEL_FILE = 'word2vec_model_improved.bin'
CONFIDENCE_THRESHOLD = 0.6  # Limiar de confiança para usar MLP

# Carregar SpaCy para lematização
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

# Carregar corpus para Word2Vec
def load_corpus():
    with open('guia_cuidador.txt', 'r', encoding='utf-8') as f:
        guia_text = f.read()
    kb_texts = [item['topic'] + ' ' + item['content'] + ' ' + ' '.join(item.get('keywords', [])) for item in KNOWLEDGE_BASE]
    full_text = guia_text + ' ' + ' '.join(kb_texts)
    sentences = nltk.sent_tokenize(full_text, language='portuguese')
    tokenized_sentences = [simple_preprocess(sent) for sent in sentences]
    return tokenized_sentences

# Pré-processamento com lematização
def preprocess_text(text):
    doc = nlp(text.lower())
    tokens = [token.lemma_ for token in doc if token.text not in STOPWORDS and len(token.text) > 2]
    return tokens

# Gerar embedding médio
def get_sentence_embedding(tokens, w2v_model):
    vectors = [w2v_model.wv[token] for token in tokens if token in w2v_model.wv]
    return np.mean(vectors, axis=0) if vectors else np.zeros(WORD2VEC_SIZE)

# Gerar dados sintéticos mais robustos
def generate_synthetic_data():
    data = []
    labels = []
    templates = [
        "O que é {topic}?", "Explique {topic}", "Como lidar com {topic}?", 
        "Dicas para {topic}", "Cuidados com {topic}", "O que fazer sobre {topic}?",
        "{topic} em idosos", "Como prevenir {topic}?", "Informações sobre {topic}",
        "Cuidados relacionados a {topic}", "Como ajudar com {topic}?",
        "O que significa {topic} no cuidado de idosos?", "{keywords}",
    ]
    
    for item in KNOWLEDGE_BASE:
        intent_id = item['id']
        topic = item['topic']
        keywords = item.get('keywords', [])
        content = item['content']
        
        # Gerar variações com templates
        for template in templates:
            if '{keywords}' in template:
                data.append(' '.join(keywords))
            else:
                data.append(template.format(topic=topic))
            labels.append(intent_id)
        
        # Variações com keywords
        for kw in keywords:
            data.extend([
                f"O que significa {kw}?", f"Como prevenir {kw}?", 
                f"Cuidados com {kw}", f"{kw} em idosos"
            ])
            labels.extend([intent_id] * 4)
        
        # Variações com trechos do conteúdo
        sentences = nltk.sent_tokenize(content, language='portuguese')
        for sent in sentences[:2]:  # Limitar a 2 sentenças
            data.append(sent)
            labels.append(intent_id)
    
    return data, labels

# Treinar modelos
def train_models():
    print("Carregando corpus e treinando Word2Vec...")
    corpus = load_corpus()
    w2v_model = Word2Vec(sentences=corpus, vector_size=WORD2VEC_SIZE, window=WORD2VEC_WINDOW, min_count=WORD2VEC_MIN_COUNT, workers=4)
    w2v_model.save(W2V_MODEL_FILE)
    
    print("Gerando dados sintéticos...")
    data, labels = generate_synthetic_data()
    
    # Pré-processar e gerar embeddings
    processed_data = [preprocess_text(text) for text in data]
    X = np.array([get_sentence_embedding(tokens, w2v_model) for tokens in processed_data])
    
    # Normalizar embeddings
    scaler = StandardScaler()
    X = scaler.fit_transform(X)
    
    # Encoder de labels
    le = LabelEncoder()
    y = le.fit_transform(labels)
    
    # Dividir em train/test
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    print("Treinando MLPClassifier...")
    mlp = MLPClassifier(hidden_layer_sizes=MLP_HIDDEN_LAYERS, max_iter=MLP_MAX_ITER, early_stopping=True, random_state=42)
    mlp.fit(X_train, y_train)
    
    # Avaliar
    y_pred = mlp.predict(X_test)
    print("Relatório de Classificação:")
    print(classification_report(y_test, y_pred, zero_division=0))
    
    # Salvar modelos
    np.save(MODEL_FILE, [mlp, le, scaler, w2v_model.wv.key_to_index])
    print("Modelos treinados e salvos!")

# Carregar modelos
def load_models():
    w2v_model = Word2Vec.load(W2V_MODEL_FILE)
    mlp, le, scaler, vocab = np.load(MODEL_FILE, allow_pickle=True)
    return w2v_model, mlp, le, scaler

# Fallback com BM25/TF-IDF
def fallback_search(query, top_k=3):
    scores = bm25.get_scores(query)
    ranked = sorted(scores, key=lambda x: x[1], reverse=True)[:top_k]
    
    q_vec = vectorizer.transform([query])
    sims = cosine_similarity(q_vec, X_tfidf)[0]
    ranked_tfidf = sims.argsort()[::-1][:top_k]
    
    # Combinar resultados (usar BM25 como primário, TF-IDF para complementar)
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

# Inferir intenção e responder
def predict_intent_and_respond(query, w2v_model, mlp, le, scaler):
    tokens = preprocess_text(query)
    embedding = get_sentence_embedding(tokens, w2v_model)
    embedding = scaler.transform([embedding])
    
    # Obter probabilidade e predição
    probs = mlp.predict_proba(embedding)[0]
    max_prob = np.max(probs)
    pred = mlp.predict(embedding)[0]
    intent_id = le.inverse_transform([pred])[0]
    
    if max_prob > CONFIDENCE_THRESHOLD and intent_id in ID_TO_CONTENT:
        item = ID_TO_CONTENT[intent_id]
        response = f"**Tópico: {item['topic']}** ({item.get('module', 'Geral')})\n\n{item['content']}\n\n*Confiança: {max_prob:.2%}*\nFonte: Manual 'Amar é Cuidar' - PUC Minas"
    else:
        # Fallback para BM25/TF-IDF
        results = fallback_search(query)
        if results:
            response = "Não encontrei uma resposta exata, mas aqui estão tópicos relacionados:\n\n"
            for res in results:
                response += f"**{res['topic']}** ({res.get('module', 'Geral')}):\n{res['content']}\n*Score: {res['score']:.2f}*\n\n"
            response += "Tente reformular sua pergunta ou escolha um tópico acima!"
        else:
            response = "Desculpe, não entendi sua pergunta. Tente algo como 'cuidados com higiene' ou 'prevenção de quedas'."
    
    return response

# Modo interativo
def interactive_mode():
    w2v_model, mlp, le, scaler = load_models()
    print("\n=== Chatbot Cuidar+ Idosos ===\nDigite 'sair' para encerrar.")
    
    while True:
        query = input("Você: ")
        if query.lower() == 'sair':
            break
        response = predict_intent_and_respond(query, w2v_model, mlp, le, scaler)
        print(f"Bot: {response}\n")

# Main
if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--train', action='store_true', help='Treinar os modelos')
    args = parser.parse_args()
    
    if args.train:
        train_models()
    else:
        try:
            interactive_mode()
        except FileNotFoundError:
            print("Modelos não encontrados. Rode com --train primeiro.")