import random

from django.db import models
from django.contrib.auth.models import AbstractUser

# Contiene la logica del singolo oggetto.
# Esempio: Un metodo is_overdue() che controlla se la data di oggi è successiva a due_date.
# Agisce su un task alla volta.

# Create your models here.
class User(AbstractUser):
    """
        Estensione del modello User predefinito di Django.
        Usiamo AbstractUser per permettere future personalizzazioni mantenendo
        le funzionalità di autenticazione standard (password hashing, permessi).
    """
    email = models.EmailField(unique=True)
    # Metodo per la stampa "personalizzata" della classe
    def __str__(self):
        return self.username

def get_random_color():
    """Restituisce un colore esadecimale predefinito per le nuove categorie."""
    colors = ['#EF4444', '#3B82F6', '#22c55e', '#f97316', '#a855f7']
    return random.choice(colors)

class Category(models.Model):
    """
        Modello per organizzare le task.
        Ogni utente ha le proprie categorie (Relazione 1:N).
    """
    name = models.CharField(max_length=100)
    color = models.CharField(max_length=7,default=get_random_color)
    user = models.ForeignKey(User,on_delete=models.CASCADE)
    def __str__(self):
        return self.name

class Task(models.Model):
    """
        Modello principale dell'applicazione.
        Supporta tre tipologie (Nota, Checklist, Evento) gestite tramite logica lato frontend.
    """
    STATUS_CHOICES = [
        ('pending','In Sospeso'),
        ('completed','Completata'),
        ('progress','In Corso'),
        ('tostart','Da Iniziare')
    ]

    TYPE_CHOICES = [
        ('note', 'Nota Classica'),
        ('list', 'Checklist'),
        ('event', 'Evento/Scadenza')
    ]

    title = models.CharField(max_length=100)
    content = models.TextField(blank=True)
    priority = models.IntegerField(default=0)
    status = models.CharField(max_length=30,choices=STATUS_CHOICES,default='pending')
    type = models.CharField(max_length=30,choices=TYPE_CHOICES,default='note')
    # is_active gestisce il Soft Delete (Cestino) senza eliminare i dati dal DB
    is_active = models.BooleanField(default=True)
    due_date = models.DateField(null=True,blank=True)

    # Relazioni
    created_by = models.ForeignKey(User,on_delete=models.CASCADE)
    # Equivalente della creazione di una tabella di giunzione
    categories = models.ManyToManyField(Category, blank=True)

    # Timestamp automatici per tracking creazione e modifiche
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class Reminder(models.Model):
    """
        Pianificazione di notifiche per task specifiche.
        Collega una data di scadenza a una Task esistente.
    """
    expiration_date = models.DateField()
    task = models.ForeignKey(Task,on_delete=models.CASCADE)
    def __str__(self):
        return self.task
