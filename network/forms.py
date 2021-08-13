from django import forms
from .models import *

class PostForm(forms.ModelForm):
    class Meta:
        model = Post
        exclude = ['created_date', 'creator', 'likes']
        labels = {
            'content': '',
        }