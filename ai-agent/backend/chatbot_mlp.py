# ======================================================
# Implementação do Chatbot Cuidar+ Idosos
# ======================================================
# Descrição:
# Este script implementa um chatbot rule-based/retrieval-based para responder dúvidas sobre cuidados com idosos,
# baseado no manual "Amar é Cuidar" (extraído de guia_cuidador.txt e knowledge_base.json).
#
# Componentes principais:
# - Pré-processamento: NLTK para tokenização, remoção de stopwords e stemming/lemmatização.
# - Vetorização: Gensim Word2Vec para gerar embeddings de palavras.
# - Classificador: Scikit-learn MLPClassifier para detectar intenções (tópicos do knowledge base).
# - Retrieval: Após classificar a intenção, recupera o conteúdo correspondente do knowledge base.
#
# Dados de treinamento:
# - Usamos o knowledge_base.json como base de intenções (labels = tópicos/IDs).
# - Geramos dados sintéticos de treinamento: variações de perguntas baseadas em tópicos, keywords e conteúdo.
# - Corpus para Word2Vec: Todo o texto do guia_cuidador.txt + knowledge_base.json.
#
# Dependências (baseado em requirements.txt expandido):
# - fastapi, uvicorn (para API, se necessário)
# - scikit-learn (MLPClassifier)
# - numpy, pandas
# - nltk
# - gensim (Word2Vec)
# - spacy (opcional para lemmatização avançada, mas usamos NLTK aqui para simplicidade)
#
# Instalação: pip install -r requirements.txt (adicione gensim se não estiver)
#
# Execução:
# - Treine o modelo: python chatbot_ml.py --train
# - Rode o chatbot interativo: python chatbot_ml.py
# ======================================================

import json
import re
import argparse
import numpy as np
import pandas as pd
from collections import defaultdict
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
from gensim.models import Word2Vec
from gensim.utils import simple_preprocess
import nltk
from nltk.corpus import stopwords
from nltk.stem import SnowballStemmer

# Baixar recursos NLTK
nltk.download('stopwords', quiet=True)
nltk.download('punkt', quiet=True)

# Configurações
STOPWORDS = set(stopwords.words('portuguese'))
STEMMER = SnowballStemmer('portuguese')
WORD2VEC_SIZE = 100  # Dimensão dos embeddings
WORD2VEC_WINDOW = 5
WORD2VEC_MIN_COUNT = 1
MLP_HIDDEN_LAYERS = (100, 50)  # Camadas ocultas do MLP
MODEL_FILE = 'mlp_intent_classifier.npy'
W2V_MODEL_FILE = 'word2vec_model.bin'

# Carregar dados do knowledge base (intenções e conteúdos)
with open('knowledge_base.json', 'r', encoding='utf-8') as f:
    KNOWLEDGE_BASE = json.load(f)

# Mapear IDs para conteúdos
ID_TO_CONTENT = {item['id']: item for item in KNOWLEDGE_BASE}

# Extrair corpus completo para treinar Word2Vec (guia_cuidador.txt + knowledge_base)
def load_corpus():
    with open('guia_cuidador.txt', 'r', encoding='utf-8') as f:
        guia_text = f.read()
    
    kb_texts = [item['topic'] + ' ' + item['content'] + ' ' + ' '.join(item.get('keywords', [])) for item in KNOWLEDGE_BASE]
    full_text = guia_text + ' ' + ' '.join(kb_texts)
    
    # Pré-processar: Tokenizar em sentenças e palavras
    sentences = nltk.sent_tokenize(full_text, language='portuguese')
    tokenized_sentences = [simple_preprocess(sent) for sent in sentences]
    return tokenized_sentences

# Função de pré-processamento de texto
def preprocess_text(text):
    text = text.lower()
    text = re.sub(r'[^a-zà-ÿ\s]', '', text)  # Manter acentos
    tokens = nltk.word_tokenize(text, language='portuguese')
    tokens = [STEMMER.stem(token) for token in tokens if token not in STOPWORDS and len(token) > 2]
    return tokens

# Gerar embeddings médios de uma frase usando Word2Vec
def get_sentence_embedding(tokens, w2v_model):
    vectors = [w2v_model.wv[token] for token in tokens if token in w2v_model.wv]
    if vectors:
        return np.mean(vectors, axis=0)
    else:
        return np.zeros(WORD2VEC_SIZE)

# Gerar dados sintéticos de treinamento
def generate_synthetic_data():
    data = []
    labels = []
    
    for item in KNOWLEDGE_BASE:
        intent_id = item['id']
        topic = item['topic']
        keywords = item.get('keywords', [])
        content_snippet = item['content'][:100]  # Pequeno trecho
        
        # Variações baseadas em templates
        variations = [
            f"O que é {topic}?",
            f"Explique sobre {topic}",
            f"Informações sobre {topic} no cuidado de idosos",
            f"Como lidar com {topic}?",
            f"Dicas para {topic}",
            ' '.join(keywords),  # Keywords como query
            f"{topic} no manual Amar é Cuidar",
            f"Cuidados relacionados a {topic}",
            content_snippet,  # Trecho do conteúdo
        ]
        
        # Adicionar sinônimos ou variações simples
        for kw in keywords[:3]:  # Limitar para não explodir
            variations.append(f"O que significa {kw}?")
            variations.append(f"Como prevenir {kw} em idosos?")
        
        for var in variations:
            data.append(var)
            labels.append(intent_id)
    
    # Adicionar exemplos genéricos ou negativos (para "outras" intenções, mas como é retrieval, focamos nas positivas)
    return data, labels

# Treinar Word2Vec e MLP
def train_models():
    print("Carregando corpus e treinando Word2Vec...")
    corpus = load_corpus()
    w2v_model = Word2Vec(sentences=corpus, vector_size=WORD2VEC_SIZE, window=WORD2VEC_WINDOW, min_count=WORD2VEC_MIN_COUNT, workers=4)
    w2v_model.save(W2V_MODEL_FILE)
    
    print("Gerando dados sintéticos...")
    data, labels = generate_synthetic_data()
    
    # Pré-processar dados
    processed_data = [preprocess_text(text) for text in data]
    
    # Gerar embeddings
    X = np.array([get_sentence_embedding(tokens, w2v_model) for tokens in processed_data])
    
    # Encoder de labels (intenções como IDs numéricos)
    le = LabelEncoder()
    y = le.fit_transform(labels)
    
    # Dividir em train/test
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Treinando MLPClassifier...")
    mlp = MLPClassifier(hidden_layer_sizes=MLP_HIDDEN_LAYERS, max_iter=500, random_state=42)
    mlp.fit(X_train, y_train)
    
    # Avaliar
    y_pred = mlp.predict(X_test)
    print(classification_report(y_test, y_pred, zero_division=0))
    
    # Salvar modelo
    np.save(MODEL_FILE, [mlp, le, w2v_model.wv.key_to_index])  # Salvar MLP, LabelEncoder e vocab de W2V
    print("Modelos treinados e salvos!")

# Carregar modelos treinados
def load_models():
    w2v_model = Word2Vec.load(W2V_MODEL_FILE)
    mlp, le, vocab = np.load(MODEL_FILE, allow_pickle=True)
    return w2v_model, mlp, le

# Inferir intenção e responder
def predict_intent_and_respond(query, w2v_model, mlp, le):
    tokens = preprocess_text(query)
    embedding = get_sentence_embedding(tokens, w2v_model)
    pred = mlp.predict([embedding])[0]
    intent_id = le.inverse_transform([pred])[0]
    
    if intent_id in ID_TO_CONTENT:
        item = ID_TO_CONTENT[intent_id]
        response = f"**Tópico: {item['topic']}** ({item.get('module', 'Geral')})\n\n{item['content']}\n\nFonte: Manual 'Amar é Cuidar' - PUC Minas"
    else:
        response = "Desculpe, não entendi sua pergunta. Pode reformular? Tente algo como 'cuidados com higiene' ou 'prevenção de quedas'."
    
    return response

# Modo interativo
def interactive_mode():
    w2v_model, mlp, le = load_models()
    print("\n=== Chatbot Cuidar+ Idosos ===\nDigite 'sair' para encerrar.")
    
    while True:
        query = input("Você: ")
        if query.lower() == 'sair':
            break
        response = predict_intent_and_respond(query, w2v_model, mlp, le)
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