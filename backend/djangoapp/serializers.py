from rest_framework import serializers
from .models import User

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
