from django.urls import path
from .views import AuthURL, spotify_callback, IsAuthenticated, CurrentMusic, PlayMusic, PauseMusic, SkipMusic

urlpatterns = [
    path('get-auth-url', AuthURL.as_view()),
    path('redirect', spotify_callback),
    path('is-auth', IsAuthenticated.as_view()),
    path('current-music', CurrentMusic.as_view()),
    path('pause', PauseMusic.as_view()),
    path('play', PlayMusic.as_view()),
    path('skip', SkipMusic.as_view()),
]
