# from rest_framework.authtoken.views import obtain_auth_token

from . import views
from django.urls import path

urlpatterns = [
    path('register/',views.Register.as_view(),name='register'),
    path('login/',views.Login.as_view(),name='login'), # restituisce token

    path('user/me/',views.CurrentUserView.as_view(),name='current_user'),

    path('user/', views.UserProfile.as_view(), name='user'),
    path('user/update/',views.UserProfile.as_view(),name='user_update'),
    path('user/delete/',views.UserProfile.as_view(),name='user_delete'),

    path('logout/',views.Logout.as_view(),name='logout'),

    path('tasks/',views.Tasks.as_view(),name='tasks'),
    path('tasks/<int:pk>/', views.Tasks.as_view(), name='task-detail'),

    path('categories/',views.Categories.as_view(),name='categories'),
    path('categories/<int:pk>/',views.Categories.as_view(),name='categories'),
]