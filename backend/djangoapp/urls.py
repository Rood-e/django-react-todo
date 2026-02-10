from rest_framework.authtoken.views import obtain_auth_token

from . import views
from django.urls import path

urlpatterns = [
    path('register/',views.Register.as_view(),name='register'),
    path('login/',views.Login.as_view(),name='login'), # restituisce token
    path('user/', views.UserProfile.as_view(), name='user'),
    path('user/update/',views.UserProfile.as_view(),name='user_update'),
    path('user/delete/',views.UserProfile.as_view(),name='user_delete'),
]