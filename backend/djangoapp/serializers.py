from rest_framework import serializers
from .models import User, Task, Category

# Contiene la logica di trasformazione.
# Esempio: Un metodo che prende la data dal DB e la formatta in "20 ore fa" invece di "2026-01-30".

class UserSerializer(serializers.ModelSerializer):
    """
        Gestisce la registrazione e il profilo utente.
        Include logiche di hashing della password e validazione dell'unicità.
    """
    class Meta:
        model = User
        fields = ('id','username', 'email', 'password')
        # Permette l'invio del dato dal frontend ma gli vieta di includerla nella risposta JSON(solo la password)
        extra_kwargs = {
            'password': {
                'write_only': True,
                'min_length': 8,
            },
            'username': {
                'required': True,
                'min_length': 5,
            }
        }

    def validate_email(self, value):
        """Assicura che l'email non sia già occupata da un altro account."""
        user = self.context['request'].user
        if User.objects.exclude(pk=user.pk).filter(email=value).exists():
            raise serializers.ValidationError("Questa email è già associata a un account.")
        return value

    def validate_username(self, value):
        # Controlla se lo username è già usato da ALTRI utenti
        user = self.context['request'].user
        if User.objects.exclude(pk=user.pk).filter(username=value).exists():
            raise serializers.ValidationError("Questo username è già in uso.")
        return value

    """Override del metodo create per usare create_user (gestisce l'hashing della password)."""
    def create(self, validated_data):
        user = User.objects.create_user(
            username = validated_data['username'], # con ['...'] prende il dato ed è sicuro che ci sia
            email = validated_data.get('email', ''), # con .get() in caso l'email non venga inserita, non genera errori
            password = validated_data['password']
        )
        return user

class CategorySerializer(serializers.ModelSerializer):
    """
        Serializer per le etichette personalizzate delle task.
        Il campo 'user' è read_only perché viene assegnato automaticamente dalla View.
    """
    class Meta:
        model = Category

        fields = [
            'id', 'name', 'color', 'user'
        ]
        read_only_fields = ['user']

        extra_kwargs = {
            'name': {
                'error_messages': {
                    'blank': 'Il nome è necessario',
                    'required': 'Impossibile creare una categoria senza nome'
                }
            }
        }

class TaskSerializer(serializers.ModelSerializer):
    """
        Serializer principale per Note, Checklist ed Eventi.
        Gestisce la relazione ManyToMany con le Categorie e include metadati dell'autore.
    """
    # Uso di PrimaryKeyRelatedField per ricevere un array di ID dal frontend [1, 5, 12]
    categories = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Category.objects.all(),
        required=False
    )
    # Campo calcolato: aggiunge il nome dell'autore nel JSON di risposta per la UI
    created_by_name = serializers.ReadOnlyField(source='created_by.username')

    class Meta:
        model = Task
        fields = [
            'id', 'title', 'content', 'priority', 'status', 'type',
            'is_active', 'due_date', 'created_by', 'created_by_name',
            'categories', 'created_at', 'updated_at'
        ]
        # Il campo created_by lo impostiamo noi nel backend, non l'utente dal form
        read_only_fields = ['created_by', 'created_at', 'updated_at']
        extra_kwargs = {
            'title': {
                'error_messages': {
                    'blank': 'Il titolo è necessario per salvare la nota.',
                    'required': 'Non puoi creare una task senza un titolo.'
                }
            },
            'content': {
                'error_messages': {
                    'blank': 'Il contenuto non può essere vuoto.'
                }
            }
        }

    def validate_categories(self, value):
        """
            SECURITY CHECK: Impedisce a un utente malintenzionato di collegare
            categorie create da altri utenti alle proprie task tramite l'ID.
        """
        user = self.context['request'].user
        # Verifica che tutte le categorie inviate appartengano all'utente
        for category in value:
            if category.user != user:
                raise serializers.ValidationError(f"La categoria {category.name} non ti appartiene.")
        return value