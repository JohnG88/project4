from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse

from .forms import PostForm

from .models import *

from django.core import serializers
import json


def index(request):
    form = PostForm(request.POST)
    if request.is_ajax():
        if form.is_valid():
            item_form = form.save(commit=False)
            item_form.creator = Profile.objects.get(user=request.user)
            item_form.save()
            return JsonResponse({
                'id': item_form.id,
                'content': item_form.content,
                'created_date': item_form.created_date,
                #'likes': True if profile in p.likes.all() else False,
                #'count': p.like_count,
                'creator': item_form.creator.user.username
            })
    
    """post = Post.objects.all()
    data = []
    for p in post:
        item = {
        'id': p.id,
        'content': p.content,
        'created_date': p.created_date,
        'creator': p.creator.user.username
        }
        data.append(item)
        return JsonResponse({'data': data})
    print(data)
    """
    context = {'form': form}
    return render(request, "network/index.html", context)

def post_detail(request, pk):
    obj = Post.objects.get(pk=pk)
    form = PostForm()

def getAjax(request, num_posts):
    if request.is_ajax():
        # visible is how many posts you want to see
        # upper is assigned to attribute num_posts
        # lower is subtracting attribute from visible
        # size is the count for all posts
        visible = 3
        upper = num_posts
        lower = upper - visible
        size = Post.objects.all().count()
        # It worked by getting queryset and assign it to post, then loop through post, then append item dict to post list and lastly return it in a JsonResponse in its own dict
        user = request.user
        profile = Profile.objects.get(user=user)
        post = Post.objects.all()
        data = []
        for p in post:
            item = {
            'id': p.id,
            'content': p.content,
            'created_date': p.created_date,
            'likes': True if profile in p.likes.all() else False,
            'count': p.like_count,
            'creator': p.creator.user.username
            }
            data.append(item)
        # IDK how this worked, maybe because the data has been serialized from models because in other projects the p.creator would return an object and when you would try oop it would say the foreignkey field was not JSON serializable.
        return JsonResponse({'data': data[lower:upper], 'size': size})


def like_unlike_post(request):
    # was semi-copying video of how to use ajax in django, the I was getting lazyobject type error in terminal because likes has a manytomany relation to Profile> So added two lines below and added profile in if statement, did not think of this myself got it from stack overflow. Now in console it produces {likes: false, count: 0} if profile already liked post and {likes: true, count: 1} if they haven't.
    user = request.user
    profile = Profile.objects.get(user=user)
    if request.is_ajax:
        # below is getting 'pk' from ajax in data:
            # 'pk': clickedId        
        pk = request.POST.get('pk')
        obj = Post.objects.get(pk=pk)
        # If profile is in the object liked all field
        if profile in obj.likes.all():
            likes = False
            obj.likes.remove(profile)
        else:
            likes = True
            obj.likes.add(profile)
        return JsonResponse({'likes': likes, 'count': obj.like_count})

def profile_page(request):
    user = request.user
    #auctions = AuctionListing.objects.filter(user=user.id)
    profile = Profile.objects.get(user=user)
    print(profile)
    posts = Post.objects.filter(creator=profile)
    posts_obj = serializers.serialize('json', posts)
    #profile = Profile.objects.get(user=user.id)
    profile_info = {
        'id': profile.id,
        'following': profile.followers.all().count(),
        'followers': profile.following.all().count()
    }
    return JsonResponse({'data': profile_info, 'posts_obj': posts_obj})



def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
            Profile(user=user).save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
