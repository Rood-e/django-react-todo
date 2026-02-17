from django.db import models
from django.contrib.auth.models import AbstractUser

# Contiene la logica del singolo oggetto.
# Esempio: Un metodo is_overdue() che controlla se la data di oggi è successiva a due_date.
# Agisce su un task alla volta.

# Create your models here.
class User(AbstractUser):
    email = models.EmailField(unique=True)
    # Metodo per la stampa "personalizzata" della classe
    def __str__(self):
        return self.username

class Category(models.Model):
    name = models.CharField(max_length=100)
    user = models.ForeignKey(User,on_delete=models.CASCADE)
    def __str__(self):
        return self.name

class Task(models.Model):
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
    is_active = models.BooleanField(default=True)
    due_date = models.DateField(null=True,blank=True)

    created_by = models.ForeignKey(User,on_delete=models.CASCADE)
    # Equivalente della creazione di una tabella di giunzione
    categories = models.ManyToManyField(Category, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class Reminder(models.Model):
    expiration_date = models.DateField()
    task = models.ForeignKey(Task,on_delete=models.CASCADE)
    def __str__(self):
        return self.task
