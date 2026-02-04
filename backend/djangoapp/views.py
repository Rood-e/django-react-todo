from django.contrib.auth import authenticate, get_user_model
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .serializers import UserSerializer


# Contiene la logica di selezione e azione (Il "Cervello").
# Esempio: getAllTasks().
# È la View che decide: "Prendi tutti i Task dal database, filtrali per l'utente X e passali al Serializer".

"""
@api_view(['POST'])
@permission_classes([AllowAny]) # Permette la registrazione ai non loggati
def register_user(request):
    # Passaggio dei dati al serializer
    serializer = UserSerializer(data=request.data)

    # Il Serializer controlla se i dati rispettano i vincoli (username unico, email valida, ecc.)
    if serializer.is_valid():
        serializer.save() # Chiamata al metodo create() (serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    # Restituisce automaticamente gli errori (es. "Username esistente")
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
"""
class Register(generics.CreateAPIView):
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

User = get_user_model()

class Login(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        password = request.data.get('password')

        try:
            # Cerchiamo l'utente nel database usando l'email
            user_obj = User.objects.get(email=email)
            # Authenticate vuole lo username, quindi passiamo user_obj.username
            user = authenticate(username=user_obj.username, password=password)
        except User.DoesNotExist:
            user = None

        if user is not None:
            token, created = Token.objects.get_or_create(user=user)

            user.last_login = timezone.now()
            user.save(update_fields=['last_login'])

            return Response({
                'token': token.key,
                'username': user.username,
            })
        else:
            return Response({
                'error': "Credenziali non valide"
            }, status=status.HTTP_400_BAD_REQUEST)
