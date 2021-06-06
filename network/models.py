from django.contrib.auth.models import AbstractUser
from django.db import models
from itertools import chain

from django.utils import timezone


class User(AbstractUser):
    pass

"""
    to get the id of profile:
        p1 = Profile.objects.get(id=1)

    to get the posts of the p1:
        Post.objects.filter(creator=p1)
"""

"""
class ProfileManager(models.Manager):
    def get_following_posts(self, me):
        # Get the list of users we are following
        users = [user for user in self.get_following.all()]
        posts = []
        qs = None
        # Loop through the list
        for u in users:
            # Get Profile of particular user
            p = Profile.objects.get(user=u)
            # Get posts of particular user
            profile_posts = p.get_all_posts.all()
            # Add it to post list
            posts.append(profile_posts)
        if len(posts) > 0:
            qs = sorted(chain(*posts), reverse=True, key=lambda obj: obj.created_date)
        return qs
"""

class Profile(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    followers = models.ManyToManyField(User, blank=True, related_name="get_followed_profiles")
    #following = models.ManyToManyField(User, blank=True, related_name="get_following_profiles")

    # objects = ProfileManager()

    
    
    @property
    def get_following_count(self):
        return self.followers.all().count()

    

    """
    def serialize(self, user):
        return {
            'profile_id': self.user.id,
            'profile_username': self.user.username,
            'followers': self.followers.count(),
            'following': self.user.get_followed_profiles.count(),
            'currently_following': not user.is_anonymous and self in user.get_followed_profiles.all(),
            'follow_available': (not user.is_anonymous) and self.user != user
        }
    """

    def __str__(self):
        followers_str = ""
        for follower in self.followers.all():
            followers_str += " " + follower.username
        return f"{self.user.username} (id {self.user.id}) - followed by {followers_str}"

class Post(models.Model):
    content = models.CharField(max_length=280)
    created_date = models.DateTimeField(default=timezone.now)
    creator  = models.ForeignKey(Profile, on_delete=models.CASCADE, blank=True, related_name="get_all_posts")
    likes = models.ManyToManyField(Profile, blank=True, related_name="get_all_liked_posts")

    """
    def serialize(self, user):
        return {
            'id': self.id,
            'content': self.content,
            'created_date': self.created_date.strftime('%b %#d Y%, %#I:%M %p'),
            'creator_username': self.creator.user.username,
            'likes': self.likes.count(),
            'liked': not user.is_anonymous and self in Profile.objects.filter(user=user).first().get_all_liked_posts.all(),
            'editable': self.creator.user == user
        }
    """
    
    class Meta:
        ordering = ['-created_date']

    @property
    def like_count(self):
        return self.likes.all().count()