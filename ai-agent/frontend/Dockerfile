# Dockerfile.frontend - Para o serviço do Frontend (Flask)
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
COPY app.py .
COPY templates/index.html templates/
COPY knowledge_base.json .
COPY config.yaml .

RUN pip install --no-cache-dir -r requirements.txt \
    && pip install flask requests python-dotenv pyyaml

EXPOSE 5000

CMD ["python", "app.py"]