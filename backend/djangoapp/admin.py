from django.contrib import admin
from .models import User,Category,Task

# Registrazione dei modelli
admin.site.register(User)
admin.site.register(Category)
admin.site.register(Task)