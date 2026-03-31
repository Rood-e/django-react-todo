# Versione leggera di Python
FROM python:3.12-slim

# Evita file .pyc e assicura output immediato nei log
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Directory di lavoro
WORKDIR /app

# Installiamo le dipendenze di sistema necessarie per PostgreSQL (se servissero)
# e aggiorniamo pip
RUN apt-get update && apt-get install -y libpq-dev gcc && rm -rf /var/lib/apt/lists/*

# Copia e installa i requisiti
COPY ./backend/requirements.txt /app/
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

# Copia il resto del codice
COPY . /app/

# Espone la porta 8000 (standard per Django)
EXPOSE 8000