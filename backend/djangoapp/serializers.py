from rest_framework import serializers
from .models import User, Task

# Contiene la logica di trasformazione.
# Esempio: Un metodo che prende la data dal DB e la formatta in "20 ore fa" invece di "2026-01-30".

class UserSerializer(serializers.ModelSerializer):
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
        # Controlla se l'email è già usata da ALTRI utenti
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

    # Restituisce l'istanza dell'USER appena creato
    def create(self, validated_data):
        user = User.objects.create_user(
            username = validated_data['username'], # con ['...'] prende il dato ed è sicuro che ci sia
            email = validated_data.get('email', ''), # con .get() in caso l'email non venga inserita, non genera errori
            password = validated_data['password']
        )
        return user

class TaskSerializer(serializers.ModelSerializer):
    # Mostriamo lo username del creatore invece dell'ID (opzionale, ma utile)
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
