from django.shortcuts import render
from api.models import Room

# Create your views here.
def index(request, *args, **kwargs):
    return render(request, 'frontend/index.html')