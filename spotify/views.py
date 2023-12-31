from multiprocessing import reduction
from os import access
from django.shortcuts import render, redirect
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from requests import Request, post
from .credentials import CLIENT_ID, CLIENT_SECRET, REDIRECT_URI
from .util import update_or_create_user_tokens, is_spotify_authenticated, execute_spotify_api_request, pause_music, play_music, skip_music
from api.models import Room
# Create your views here.

class IsAuthenticated(APIView):
    def get(self, request, format=None):
        is_authenticated = is_spotify_authenticated(self.request.session.session_key)
        return Response({'status': is_authenticated}, status=status.HTTP_200_OK)

class AuthURL(APIView):
    def get(self, request, format=None):
        scopes = 'user-read-playback-state user-modify-playback-state user-read-currently-playing'

        url = Request('GET', 'https://accounts.spotify.com/authorize', params={
            'scope': scopes,
            'response_type': 'code',
            'redirect_uri': REDIRECT_URI,
            'client_id': CLIENT_ID
        }).prepare().url

        return Response({'url': url}, status=status.HTTP_200_OK)

def spotify_callback(request, format=None):
    code = request.GET.get('code')
    error = request.GET.get('error')

    response = post('https://accounts.spotify.com/api/token', data={
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': REDIRECT_URI,
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET
    }).json()

    access_token = response.get('access_token')
    token_type = response.get('token_type')
    expires_in = response.get('expires_in')
    refresh_token = response.get('refresh_token')
    error = response.get('error')

    if not request.session.exists(request.session.session_key):
        request.session.create()
    session_id = request.session.session_key

    update_or_create_user_tokens(session_id, access_token, token_type, expires_in, refresh_token)

    return redirect('frontend:')

class CurrentMusic(APIView):
    def get(self, request, format=None):
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code)
        if room.exists():
            room = room[0]
        else: 
            return Response({'message': 'error, not found'}, status=status.HTTP_404_NOT_FOUND)
        host = room.host
        endpoint = "player/currently-playing"
        response = execute_spotify_api_request(host, endpoint)

        if 'error' in response or 'item' not in response:
            return Response({'message': 'error, no content'}, status=status.HTTP_204_NO_CONTENT)

        item = response.get('item')
        duration = item.get('duration_ms')
        progress = response.get('progress_ms')
        album_cover = item.get('album').get('images')[0].get('url')
        is_playing = response.get('is_playing')
        music_id = item.get('id')
        
        artist_string = ""

        for i, artist in enumerate(item.get('artists')):
            if i > 0:
                artist_string += ", "
            name = artist.get('name')
            artist_string += name
        
        music = {
            'title': item.get('name'),
            'artist': artist_string,
            'duration': duration,
            'time': progress,
            'image_url': album_cover,
            'is_playing': is_playing,
            'votes': 0,
            'music_id': music_id
        }

        return Response(music, status=status.HTTP_200_OK)



class PauseMusic(APIView):
    def put(self, request, format=None):
        host_id = self.request.session.session_key
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code)[0]

        if host_id == room.host or room.guest_can_pause:
            pause_music(room.host)
            return Response({}, status=status.HTTP_200_OK)
        
        return Response({}, status=status.HTTP_403_FORBIDDEN)

class PlayMusic(APIView):
    def put(self, request, format=None):
        host_id = self.request.session.session_key
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code)[0]

        if host_id == room.host or room.guest_can_pause:
            play_music(room.host)
            return Response({}, status=status.HTTP_200_OK)
        
        return Response({}, status=status.HTTP_403_FORBIDDEN)

class SkipMusic(APIView):
    def post(self, request, format=None):
        host_id = self.request.session.session_key
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code)[0]

        if room.host == host_id:
            skip_music(room.host)
        else:
            pass

        return Response({}, status=status.HTTP_200_OK)