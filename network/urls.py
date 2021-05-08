
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path('profile_page', views.profile_page, name="profile_page"),
    path('other-profile/<str:username>', views.get_other_profile, name='other-profile'),
    path('like-unlike/', views.like_unlike_post, name='like-unlike'),
    # <int:num_posts will give us how many posts we want loaded
    path('getAjax/<int:num_posts>', views.getAjax, name='getAjax'),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register")
]
