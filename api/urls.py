from django.urls import path
from api.views import (
    HelloView,
    RegisterView,
    LoginView,
    LogoutView,
    MeView,
    UserListView,
    UserDetailView,
    UserSearchView,
)

urlpatterns = [
    path("hello/", HelloView.as_view(), name="hello"),
    
    # Authentication endpoints
    path("auth/register", RegisterView.as_view(), name="register"),
    path("auth/login", LoginView.as_view(), name="login"),
    path("auth/logout", LogoutView.as_view(), name="logout"),
    path("auth/me", MeView.as_view(), name="me"),
    
    # User endpoints
    path("users", UserListView.as_view(), name="user-list"),
    path("users/search", UserSearchView.as_view(), name="user-search"),
    path("users/<int:id>", UserDetailView.as_view(), name="user-detail"),
]
