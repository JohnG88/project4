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
                'creator_id': item_form.creator.user.id,
            })
    
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
            'creator': {'name': p.creator.user.username, 'id': p.creator.user.id}
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
            'creator': {'name': pd.creator.user.username, 'id': pd.creator.user.id}
        }
        posts_data.append(p_item)

    profile_info = {
        'id': user.id,
        'user': profile.user.username,
        'followers': profile.get_following_count,
        'following': request.user.get_followed_profiles.all().count(),
    }
    return JsonResponse({'data': profile_info, 'posts_obj': posts_data})

def get_post(request, id):
    post = Post.objects.get(id=id)
    
    return JsonResponse({
        'id': post.id,
        'content': post.content,
        'created_date': post.created_date,
        'creator': post.creator.user.username,
        'creator_id': post.creator.user.id,
    })


def update_post(request, id):
    if request.is_ajax():
        #id = request.POST.get('pk')
        post = Post.objects.get(id=id)
        if request.method == 'POST':
            edit_content = request.POST.get('content')
            post.content = edit_content
            post.save()

            return JsonResponse({
                'id': post.id,
                'content': post.content,
                'creator': post.creator.user.username,
                'creator_id': post.creator.user.id
            })
            
    
    """
    edit_content = request.POST.get('edit-content-input')

    edit_post = Post.objects.get(id=id)
    edit_post.content = edit_content
    edit_post.save()

    updated_post = {
        'id': edit_post.id,
        'content': edit_post.content,
        'creator': {'name': edit_post.creator.user.username, 'id': edit_post.creator.user.id}
    }
    
    return JsonResponse({'updated_post': updated_post})
    """

def get_other_profile(request, id):
    user = User.objects.get(id=id)
    profile = Profile.objects.get(user=user)
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
            'creator': {'name': spd.creator.user.username, 'id': spd.creator.user.id}
        }
        single_profile_objs.append(spd_item)

    single_profile_info = {
        'id': user.id,
        'user': profile.user.username,
        'followers': True if profile in request.user.get_followed_profiles.all() else False,
        'count': profile.get_following_count,
        'following': user.get_followed_profiles.all().count(),
    }
    """
    Man is follwed by Donkey, Wango, Comal. Man follows Wango, Donkey
    Wango is followed by Donkey, Man. Wango follows Man, Donkey
    Donkey is followd by Wango, Man, Comal. Donkey follows Man, Wango, Comal
    Comal is followed by Donkey. Comal follows Man, Donkey
    """

    """
    This is for investing purposes:
        HRZN: Horizon Technology Finance Corp
        QYLD: Global X NASDAQ 100 Covered call ETF
        PESC: Prospect Capitol Corp
        ACP: Aberdeen Income Credit Strategies Fund
        SBR: Sabine Royalty Trust
        DX: Dynex Capitol
        PCF: High Income Securities Fund


        How To look for monthly dividend stocks:
            1: Payout Ratio, P.E., annual dividend amount/ earnings per share
            2 Total return
            3: dividend yield is (12(months)/ by stock price)
            4. Check total return of stock

    """

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
            'creator': {'name': fposts.creator.user.username, 'id': fposts.creator.user.id}
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

def update_follow(request, id):
    user = User.objects.get(id=id)
    profile = Profile.objects.get(user=user)
    if profile in request.user.get_followed_profiles.all():
        followers = False
        profile.followers.remove(request.user)
    else:
        followers = True
        profile.followers.add(request.user)
    profile.save()

    # Below is a mixture of a project i copied and pyplane tutorial, it makes the user follow itself
    """
    user=request.user
    profile = Profile.objects.get(user=user)
    if request.is_ajax:
        pk = request.POST.get('pk')
        profiles = Profile.objects.get(id=pk)
        if profiles in profile.followers.all():
            followers = False
            profile.followers.remove(user)
        else:
            followers = True
            profile.followers.add(user)
        #profile.save()
    """
    # request.user.get_followed_profiles.all().count(), this line was to get counts but i believe it as counting nothing

    return JsonResponse({'followers': followers, 'count': profile.get_following_count})


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
