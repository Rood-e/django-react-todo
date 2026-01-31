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

    # Restituisce l'istanza dell'USER appena creato
    def create(self, validated_data):
        user = User.objects.create_user(
            username = validated_data['username'], # con ['...'] prende il dato ed è sicuro che ci sia
            email = validated_data.get('email', ''), # con .get() in caso l'email non venga inserita, non genera errori
            password = validated_data['password']
        )
        return user
