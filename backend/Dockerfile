# Versione leggera di Python
FROM python:3.12-slim

# Evita file .pyc e assicura output immediato nei log
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Directory di lavoro
WORKDIR /app

# Installiamo le dipendenze di sistema necessarie per PostgreSQL
RUN apt-get update && apt-get install -y libpq-dev gcc && rm -rf /var/lib/apt/lists/*

# Copia e installa i requisiti
COPY ./backend/requirements.txt /app/
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

# Copia tutto il contenuto della cartella backend nella cartella /app del container
COPY ./backend/ /app/

# Espone la porta 10000 (standard per Render)
EXPOSE 10000

# Comando di avvio combinato: Migrazioni + Collectstatic + Gunicorn
CMD python manage.py migrate --noinput && \
    python manage.py collectstatic --noinput && \
    gunicorn --bind 0.0.0.0:10000 djangoproj.wsgi:application
