FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Use shell form so $PORT env var is expanded at runtime (Render provides PORT)
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080}
