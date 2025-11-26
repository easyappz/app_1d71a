from django.urls import path
from api.views import (
    HelloView,
    RegisterView,
    LoginView,
    LogoutView,
    MeView,
    ChangePasswordView,
    UserListView,
    UserDetailView,
    UserSearchView,
    PostListCreateView,
    PostDetailView,
    UserPostsView,
    LikeView,
    CommentListCreateView,
    CommentDeleteView,
    SubscribeView,
    SubscribersListView,
    SubscriptionsListView,
    DialogListView,
    DialogMessagesView,
    MessageDeleteView,
)

urlpatterns = [
    path("hello/", HelloView.as_view(), name="hello"),
    
    # Authentication endpoints
    path("auth/register", RegisterView.as_view(), name="register"),
    path("auth/login", LoginView.as_view(), name="login"),
    path("auth/logout", LogoutView.as_view(), name="logout"),
    path("auth/me", MeView.as_view(), name="me"),
    path("auth/change-password", ChangePasswordView.as_view(), name="change-password"),
    
    # User endpoints
    path("users", UserListView.as_view(), name="user-list"),
    path("users/search", UserSearchView.as_view(), name="user-search"),
    path("users/<int:id>", UserDetailView.as_view(), name="user-detail"),
    path("users/<int:id>/posts", UserPostsView.as_view(), name="user-posts"),
    
    # Subscription endpoints
    path("users/<int:id>/subscribe", SubscribeView.as_view(), name="user-subscribe"),
    path("users/<int:id>/subscribers", SubscribersListView.as_view(), name="user-subscribers"),
    path("users/<int:id>/subscriptions", SubscriptionsListView.as_view(), name="user-subscriptions"),
    
    # Post endpoints
    path("posts", PostListCreateView.as_view(), name="post-list-create"),
    path("posts/<int:id>", PostDetailView.as_view(), name="post-detail"),
    path("posts/<int:id>/like", LikeView.as_view(), name="post-like"),
    path("posts/<int:id>/comments", CommentListCreateView.as_view(), name="post-comments"),
    
    # Comment endpoints
    path("comments/<int:id>", CommentDeleteView.as_view(), name="comment-delete"),
    
    # Dialog and message endpoints
    path("dialogs", DialogListView.as_view(), name="dialog-list"),
    path("dialogs/<int:user_id>", DialogMessagesView.as_view(), name="dialog-messages"),
    path("messages/<int:id>", MessageDeleteView.as_view(), name="message-delete"),
]