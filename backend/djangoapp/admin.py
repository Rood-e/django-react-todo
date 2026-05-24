from django.contrib import admin
from .models import User,Category,Task
from django.contrib.sessions.models import Session

class SessionAdmin(admin.ModelAdmin):
    def _session_data(self, obj):
        return obj.get_decoded()
    list_display = ['session_key', '_session_data', 'expire_date']

# Registrazione dei modelli
admin.site.register(User)
admin.site.register(Category)
admin.site.register(Task)
admin.site.register(Session, SessionAdmin)