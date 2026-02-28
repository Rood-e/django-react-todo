from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.hashers import check_password
from django.utils import timezone
from rest_framework import generics, status, authentication, permissions
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Task, Category
from .serializers import UserSerializer, TaskSerializer, CategorySerializer

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

class Logout(APIView):
    permission_classes = [AllowAny]
    def post(self, request, *args, **kwargs):
        try:
            request.user.auth_token.delete()
            return Response({"message":"Logout effettuato con successo"},status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"error": str(e)},status=status.HTTP_400_BAD_REQUEST)

class UserProfile(APIView):
    # Questi due garantiscono che solo chi ha un TOKEN valido possa entrare
    authentication_classes = [authentication.TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    # Prelievo dell'utente
    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data)

    # Modifica dati dell'utente
    def put(self, request, *args, **kwargs):
        user = request.user
        data = request.data

        # 1. Controllo Password Corrente (Obbligatorio per sicurezza)
        current_password = data.get('current_password')
        if not current_password or not check_password(current_password, user.password):
            return Response(
                {'error': 'La password corrente non è corretta.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 2. Validazione tramite Serializer (Email e Username)
        serializer = UserSerializer(user, data=data, context={'request': request}, partial=True)

        if serializer.is_valid():
            # 3. Controllo Nuova Password (se presente)
            new_password = data.get('new_password')
            if new_password:
                if len(new_password) < 8:
                    return Response(
                        {'error': 'La nuova password deve avere almeno 8 caratteri.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                user.set_password(new_password)

            serializer.save() # Salva username ed email validati
            user.save()       # Salva l'eventuale nuova password hashiata

            return Response({'message': 'Profilo aggiornato con successo!'})

        # Se il serializer trova errori (es. email non valida o già presa)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # Cancellazione utente
    def delete(self, request, *args, **kwargs):
        user = request.user
        user.delete() # In automatico rimuove anche il token
        return Response(status=status.HTTP_204_NO_CONTENT)

class Tasks(APIView):
    authentication_classes = [authentication.TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, pk, user):
        try:
            return Task.objects.get(pk=pk, created_by=user)
        except Task.DoesNotExist:
            return None

    def get(self, request, pk=None):
        if pk:
            task = Task.objects.prefetch_related('categories').filter(pk=pk, created_by=request.user).first()
            if not task:
                return Response({"error": "Task non trovata"}, status=status.HTTP_404_NOT_FOUND)
            return Response(TaskSerializer(task).data)

        tasks = Task.objects.filter(
            created_by=request.user
        ).prefetch_related('categories').order_by('-created_at')

        serializer = TaskSerializer(tasks, many=True)

        # Restituiamo un array semplice, il frontend filtrerà il resto
        return Response(serializer.data)

    # Aggiungi pk=None anche qui
    def post(self, request, pk=None):
        serializer = TaskSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            task = serializer.save(created_by=request.user)
            return Response({
                "message": "Task creata con successo",
                "id": task.id
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk=None):
        if not pk:
            return Response({"error": "ID mancante"}, status=status.HTTP_400_BAD_REQUEST)

        # Cerchiamo tra tutte le task dell'utente, anche quelle disattivate
        try:
            task = Task.objects.get(pk=pk, created_by=request.user)
        except Task.DoesNotExist:
            return Response({"error": "Task non trovata"}, status=status.HTTP_404_NOT_FOUND)

        # Azione di Ripristino (Restore)
        if request.data.get('action') == 'restore':
            task.is_active = True
            task.save()
            return Response({"message": "Task ripristinata"})

        # Salvataggio normale
        serializer = TaskSerializer(task, data=request.data, partial=True, context={"request": request})
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Modifiche salvate!"})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk=None):
        # CASO 1: Svuotamento totale del cestino
        if not pk and request.query_params.get('action') == 'empty_trash':
            deleted_count, _ = Task.objects.filter(
                created_by=request.user,
                is_active=False
            ).delete()

            message = "Cestino svuotato: 1 elemento" if deleted_count == 1 else f'Cestino svuotato: {deleted_count} elementi'

            return Response({"message": message})

        # CASO 2: Eliminazione singola
        if not pk:
            return Response({"error": "ID mancante"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            task = Task.objects.get(pk=pk, created_by=request.user)
            if not task.is_active:
                task.delete() # Hard delete se già nel cestino
                return Response({"message": "Eliminata definitivamente"})

            task.is_active = False # Soft delete
            task.save()
            return Response({"message": "Spostata nel cestino"})
        except Task.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

class Categories(APIView):
    # Questi due garantiscono che solo chi ha un TOKEN valido possa entrare
    authentication_classes = [authentication.TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self,pk,user):
        try:
            return Category.objects.get(pk=pk,user=user)
        except Category.DoesNotExist:
            return None

    # Prelievo dell'utente
    def get(self, request, pk=None):
        if pk:
            category = self.get_object(pk,request.user)
            if not category:
                return Response({"error":"Categoria non trovata"}, status=status.HTTP_404_NOT_FOUND)
            serializer = CategorySerializer(category)
            return Response(serializer.data)

        categories = Category.objects.filter(user=request.user)
        serializer = CategorySerializer(categories,many=True)

        return Response(serializer.data)

    def post(self, request, pk=None):
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            category = serializer.save(user=request.user)
            return Response({
                "message": "Categoria creata con successo",
                "id": category.id,
                "color": category.color,
                "name": category.name,
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk=None):
        if not pk:
            return Response({'error': 'ID mancante'}, status=status.HTTP_400_BAD_REQUEST)

        category = self.get_object(pk, request.user)
        if not category:
            return Response({'error': 'Categoria non trovata'}, status=status.HTTP_404_NOT_FOUND)

        # partial=True è fondamentale per aggiornamenti flessibili
        serializer = CategorySerializer(category, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Modifiche salvate!', 'data': serializer.data})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk=None):
        if not pk:
            return Response({"error": "ID mancante"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            category = Category.objects.get(pk=pk, user=request.user)
            category.delete()
            return Response({"message": "Categoria eliminata con successo"})
        except Category.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)