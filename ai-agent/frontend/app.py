# frontend_app.py - Servidor Flask para o frontend (atualizado com sugestões)
from flask import Flask, render_template, request, jsonify
import requests
import yaml
import os
from dotenv import load_dotenv
import json

app = Flask(__name__)

# Carregar configurações
load_dotenv()
config_path = os.getenv('CONFIG_PATH', 'config.yaml')
backend_url = os.getenv('BACKEND_URL', 'http://chatbot_backend_dcare:8888/query')

# Tentar carregar YAML se existir
if os.path.exists(config_path):
    with open(config_path, 'r') as f:
        config = yaml.safe_load(f)
        backend_url = config.get('backend_url', backend_url)

print(f"Usando backend URL: {backend_url}")

# Carregar knowledge base para sugestões
with open('knowledge_base.json', 'r', encoding='utf-8') as f:
    KNOWLEDGE_BASE = json.load(f)

# Função para obter sugestões (6 tópicos aleatórios, como no original)
def get_suggestions():
    import random
    return random.sample([item['topic'] for item in KNOWLEDGE_BASE], min(6, len(KNOWLEDGE_BASE)))

# Endpoint para a página principal
@app.route('/')
def index():
    suggestions = get_suggestions()
    return render_template('index.html', suggestions=suggestions)

# Endpoint para processar mensagens
@app.route('/send_message', methods=['POST'])
def send_message():
    data = request.json
    question = data.get('question')
    if not question:
        return jsonify({'error': 'Pergunta não fornecida'}), 400
    
    payload = {'question': question, 'top_k': 3}
    try:
        response = requests.post(backend_url, json=payload)
        response.raise_for_status()
        return jsonify(response.json())
    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'Erro ao chamar API: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.getenv('PORT', 5000)), debug=True)