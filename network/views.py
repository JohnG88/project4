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
                'creator': item_form.creator.user.username,
                'creator_id': item_form.creator.id,
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
            'creator': {'name': p.creator.user.username, 'id': p.creator.id}
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
    posts_data = []
    for pd in posts:
        p_item = {
            'id': pd.id,
            'content': pd.content,
            'created_date': pd.created_date,
            'likes': True if profile in pd.likes.all() else False,
            'count': pd.like_count,
            'creator': {'name': pd.creator.user.username, 'id': pd.creator.id}
        }
        posts_data.append(p_item)

    profile_info = {
        'id': profile.id,
        'user': profile.user.username,
        'following': profile.followers.all().count(),
        'followers': profile.following.all().count()
    }
    return JsonResponse({'data': profile_info, 'posts_obj': posts_data})

def get_other_profile(request, id):
    #user = User.objects.get(username=username)
    profile = Profile.objects.get(id=id)
    print(profile)
    posts = Post.objects.filter(creator=profile)
    
    single_profile_objs = []
    for spd in posts:
        spd_item = {
            'id': spd.id,
            'content': spd.content,
            'created_date': spd.created_date,
            'likes': True if profile in spd.likes.all() else False,
            'count': spd.like_count,
            'creator': {'name': spd.creator.user.username, 'id': spd.creator.id}
        }
        single_profile_objs.append(spd_item)

    single_profile_info = {
        'id': profile.id,
        'user': profile.user.username,
        'followers': True if profile in profile.followers.all() else False,
        'count': profile.get_following_count,
        'following': profile.following.all().count()
    }

    #profile_obj = serializers.serialize('json', posts)
    #print(profile_obj)

    return JsonResponse({'single_profile_objs': single_profile_objs, 'single_profile_info': single_profile_info})

    #context = {'profile': profile}
    #return render(request, 'network.other_profile.html', context)

def following_posts(request):
    profile = Profile.objects.get(user=request.user)
    followed_profiles = request.user.get_followed_profiles.all()
    print(followed_profiles)
    posts = Post.objects.filter(creator__in=followed_profiles).all()
    print(posts)

    followed_profiles_objs = []
    for fposts in posts:
        post_items = {
            'id': fposts.id,
            'content': fposts.content,
            'created_date': fposts.created_date,
            'likes': True if profile in fposts.likes.all() else False,
            'count': fposts.like_count,
            'creator': {'name': fposts.creator.user.username, 'id': fposts.creator.id}
        }
        followed_profiles_objs.append(post_items)

    return JsonResponse({'followed_profiles_objs': followed_profiles_objs})

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

def update_follow(request):
    user=request.user
    profile = Profile.objects.get(user=user)
    if request.is_ajax():
        pk = request.POST.get('pk')
        obj = Post.objects.get(pk=pk)
        if profile in obj.followers.all():
            followers = False
            obj.followers.remove(profile)
        else:
            followers = True
            obj.followers.add(profile)
        #profile.save()
        return JsonResponse({'followers': followers})


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
