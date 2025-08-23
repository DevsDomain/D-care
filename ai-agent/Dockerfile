# Dockerfile para agente IA Python
FROM python:3.11-slim
WORKDIR /app
COPY . .
RUN pip install --no-cache-dir -r requirements.txt || true
EXPOSE 5000
CMD ["python", "main.py"]
