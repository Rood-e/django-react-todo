from django.contrib.auth import authenticate, get_user_model, login, logout
from django.contrib.auth.hashers import check_password
from django.utils import timezone
from rest_framework import generics, status, authentication, permissions
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.permissions import AllowAny,IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response
from rest_framework.views import APIView
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.utils.decorators import method_decorator

from .models import Task, Category
from .serializers import UserSerializer, TaskSerializer, CategorySerializer

# Contiene la logica di selezione e azione (Il "Cervello").
# Esempio: getAllTasks().
# È la View che decide: "Prendi tutti i Task dal database, filtrali per l'utente X e passali al Serializer".

class Register(generics.CreateAPIView):
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

User = get_user_model()

# Versione adatta al TokenAuthentication
""" class Login(ObtainAuthToken):
     """"""
        Endpoint di Login personalizzato.
        Permette l'autenticazione tramite Email restituendo
        un Token statico per le sessioni successive.
     """"""
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

            # Aggiorna il timestamp dell'ultimo accesso per audit interno
            user.last_login = timezone.now()
            user.save(update_fields=['last_login'])

            return Response({
                'token': token.key,
                'username': user.username,
            })
        else:
            return Response({
                'error': "Credenziali non valide"
            }, status=status.HTTP_400_BAD_REQUEST) """

@method_decorator(csrf_exempt, name='dispatch')
@permission_classes([AllowAny])
class Login(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response({"Error": "Email e Password Obbligatorie"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user_obj = User.objects.get(email=email)
            user = authenticate(request, username=user_obj.username, password=password)
        except User.DoesNotExist:
            user = None

        if user is not None:
            login(request, user) # Questo imposta il sessionid

            # Si forza Django a generare il cookie CSRF fisicamente ora che l'utente è loggato
            from django.middleware.csrf import get_token
            get_token(request)

            return Response({
                "message": "Login effettuato con successo",
                "username": user.username,
                "email": user.email
            }, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Credenziali errate"}, status=status.HTTP_401_UNAUTHORIZED)

@method_decorator(ensure_csrf_cookie, name='dispatch')
class CurrentUserView(APIView):
    """
    Endpoint permissivo. Risponde sempre 200 OK.
    Permette al frontend di verificare lo stato dell'utente senza generare errori in console.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        if request.user.is_authenticated:
            return Response({
                "authenticated": True,
                "username": request.user.username,
                "email": request.user.email,
                "id": request.user.id
            }, status=status.HTTP_200_OK)

        # Se è anonimo, 200 OK ma diciamo che non è autenticato
        return Response({
            "authenticated": False
        }, status=status.HTTP_200_OK)

# Versione con token e localStorage
""" class Logout(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]
    def post(self, request, *args, **kwargs):
        try:
            request.user.auth_token.delete()
            return Response({"message":"Logout effettuato con successo"},status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"error": str(e)},status=status.HTTP_400_BAD_REQUEST) """

class Logout(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        logout(request) # Cancellazione della sessione e invalidazione del cookie
        return Response({"message": "Logout effettuato"}, status=status.HTTP_200_OK)

class UserProfile(APIView):
    """
        Gestisce il profilo dell'utente loggato.
        Richiede sempre la password corrente per autorizzare modifiche sensibili.
    """
    # Questi due garantiscono che solo chi ha un TOKEN valido possa entrare
    permission_classes = [IsAuthenticated]

    # Prelievo dell'utente
    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data)

    # Modifica dati dell'utente
    def put(self, request, *args, **kwargs):
        # SECURITY: Verifichiamo che l'utente conosca la password attuale prima di permettere il cambio email o nuova password.
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
    """
        Endpoint per la gestione delle Task.
        Implementa il filtraggio rigoroso: ogni utente vede solo i propri dati.
    """
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, user):
        try:
            return Task.objects.get(pk=pk, created_by=user)
        except Task.DoesNotExist:
            return None

    def get(self, request, pk=None):
        if pk:
            # Recupero singola task verificando la proprietà
            task = Task.objects.prefetch_related('categories').filter(pk=pk, created_by=request.user).first()
            if not task:
                return Response({"error": "Task non trovata"}, status=status.HTTP_404_NOT_FOUND)
            return Response(TaskSerializer(task).data)

        # PERFORMANCE: prefetch_related riduce le query al DB caricando
        # le categorie associate in un'unica operazione (evita il problema N+1)
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
        """
            Logica a due stadi:
            1. Se la task è attiva -> viene disattivata (Spostata nel cestino).
            2. Se la task è già disattivata -> viene eliminata dal DB (Hard delete).
            3. Supporta lo svuotamento totale del cestino tramite query param.
        """

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
    """
    Gestione delle etichette (Categories).
    Il sistema garantisce che un utente non possa vedere o modificare categorie altrui.
    """
    permission_classes = [IsAuthenticated]

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
