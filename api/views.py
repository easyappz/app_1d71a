from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.pagination import PageNumberPagination
from django.utils import timezone
from django.db.models import Q, Count
from drf_spectacular.utils import extend_schema

from api.models import Member, Post, Like, Comment
from api.tokens import Token
from api.authentication import TokenAuthentication
from api.serializers import (
    MemberSerializer,
    MemberRegistrationSerializer,
    MemberLoginSerializer,
    MemberUpdateSerializer,
    MessageSerializer,
    PostSerializer,
    PostCreateSerializer,
    CommentSerializer,
    CommentCreateSerializer,
)


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class RegisterView(APIView):
    """
    Register a new user account.
    """
    permission_classes = [AllowAny]

    @extend_schema(
        request=MemberRegistrationSerializer,
        responses={201: MemberSerializer, 400: dict},
        description="Create a new user account"
    )
    def post(self, request):
        serializer = MemberRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            member = serializer.save()
            response_serializer = MemberSerializer(member)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """
    Authenticate user and create session token.
    """
    permission_classes = [AllowAny]

    @extend_schema(
        request=MemberLoginSerializer,
        responses={200: MemberSerializer, 401: dict},
        description="Authenticate user and create session"
    )
    def post(self, request):
        serializer = MemberLoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        username = serializer.validated_data['username']
        password = serializer.validated_data['password']

        try:
            member = Member.objects.get(username=username)
        except Member.DoesNotExist:
            return Response(
                {"error": "Invalid credentials", "detail": "Username or password is incorrect"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not member.check_password(password):
            return Response(
                {"error": "Invalid credentials", "detail": "Username or password is incorrect"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Update online status
        member.is_online = True
        member.last_seen = timezone.now()
        member.save()

        # Create or get token
        token, created = Token.objects.get_or_create(user=member)

        response_serializer = MemberSerializer(member)
        response_data = response_serializer.data
        response_data['token'] = token.key

        return Response(response_data, status=status.HTTP_200_OK)


class LogoutView(APIView):
    """
    Logout user and terminate session.
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={200: dict, 401: dict},
        description="Terminate user session"
    )
    def post(self, request):
        # Delete token
        if hasattr(request.user, 'auth_token'):
            request.user.auth_token.delete()

        # Update online status
        request.user.is_online = False
        request.user.last_seen = timezone.now()
        request.user.save()

        return Response({"message": "Successfully logged out"}, status=status.HTTP_200_OK)


class MeView(APIView):
    """
    Get current authenticated user information.
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={200: MemberSerializer, 401: dict},
        description="Retrieve currently authenticated user information"
    )
    def get(self, request):
        serializer = MemberSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UserListView(APIView):
    """
    Get paginated list of all users.
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    @extend_schema(
        responses={200: MemberSerializer(many=True), 401: dict},
        description="Retrieve paginated list of all users"
    )
    def get(self, request):
        queryset = Member.objects.all().order_by('-created_at')
        paginator = self.pagination_class()
        paginated_queryset = paginator.paginate_queryset(queryset, request)
        serializer = MemberSerializer(paginated_queryset, many=True)
        return paginator.get_paginated_response(serializer.data)


class UserDetailView(APIView):
    """
    Get or update specific user profile.
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={200: MemberSerializer, 404: dict, 401: dict},
        description="Retrieve specific user profile by ID"
    )
    def get(self, request, id):
        try:
            member = Member.objects.get(id=id)
        except Member.DoesNotExist:
            return Response(
                {"error": "Not found", "detail": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = MemberSerializer(member)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        request=MemberUpdateSerializer,
        responses={200: MemberSerializer, 400: dict, 403: dict, 404: dict, 401: dict},
        description="Update specific user profile fields"
    )
    def patch(self, request, id):
        try:
            member = Member.objects.get(id=id)
        except Member.DoesNotExist:
            return Response(
                {"error": "Not found", "detail": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if user is updating their own profile
        if request.user.id != member.id:
            return Response(
                {"error": "Permission denied", "detail": "You can only update your own profile"},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = MemberUpdateSerializer(member, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            response_serializer = MemberSerializer(member)
            return Response(response_serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserSearchView(APIView):
    """
    Search users by username, first name, or last name.
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    @extend_schema(
        responses={200: MemberSerializer(many=True), 400: dict, 401: dict},
        description="Search users by username, first name, or last name"
    )
    def get(self, request):
        query = request.query_params.get('q', '')
        
        if not query:
            return Response(
                {"error": "Invalid search query", "detail": "Search query parameter 'q' is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        queryset = Member.objects.filter(
            Q(username__icontains=query) |
            Q(first_name__icontains=query) |
            Q(last_name__icontains=query)
        ).order_by('-created_at')

        paginator = self.pagination_class()
        paginated_queryset = paginator.paginate_queryset(queryset, request)
        serializer = MemberSerializer(paginated_queryset, many=True)
        return paginator.get_paginated_response(serializer.data)


class PostListCreateView(APIView):
    """
    Get posts feed or create a new post.
    """
    authentication_classes = [TokenAuthentication]
    pagination_class = StandardResultsSetPagination

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated()]
        return [AllowAny()]

    @extend_schema(
        responses={200: PostSerializer(many=True)},
        description="Retrieve paginated list of all posts sorted by date"
    )
    def get(self, request):
        queryset = Post.objects.all().order_by('-created_at')
        paginator = self.pagination_class()
        paginated_queryset = paginator.paginate_queryset(queryset, request)
        serializer = PostSerializer(paginated_queryset, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)

    @extend_schema(
        request=PostCreateSerializer,
        responses={201: PostSerializer, 400: dict, 401: dict},
        description="Create a new post with content and optional image"
    )
    def post(self, request):
        serializer = PostCreateSerializer(data=request.data)
        if serializer.is_valid():
            post = serializer.save(author=request.user)
            response_serializer = PostSerializer(post, context={'request': request})
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PostDetailView(APIView):
    """
    Get or delete specific post.
    """
    authentication_classes = [TokenAuthentication]

    def get_permissions(self):
        if self.request.method == 'DELETE':
            return [IsAuthenticated()]
        return [AllowAny()]

    @extend_schema(
        responses={200: PostSerializer, 404: dict},
        description="Retrieve specific post by ID"
    )
    def get(self, request, id):
        try:
            post = Post.objects.get(id=id)
        except Post.DoesNotExist:
            return Response(
                {"error": "Not found", "detail": "Post not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = PostSerializer(post, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        responses={204: None, 403: dict, 404: dict, 401: dict},
        description="Delete specific post by ID"
    )
    def delete(self, request, id):
        try:
            post = Post.objects.get(id=id)
        except Post.DoesNotExist:
            return Response(
                {"error": "Not found", "detail": "Post not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if user is the author
        if request.user.id != post.author.id:
            return Response(
                {"error": "Permission denied", "detail": "You can only delete your own posts"},
                status=status.HTTP_403_FORBIDDEN
            )

        post.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class UserPostsView(APIView):
    """
    Get posts by specific user.
    """
    permission_classes = [AllowAny]
    pagination_class = StandardResultsSetPagination

    @extend_schema(
        responses={200: PostSerializer(many=True), 404: dict},
        description="Retrieve paginated list of posts by specific user"
    )
    def get(self, request, id):
        try:
            user = Member.objects.get(id=id)
        except Member.DoesNotExist:
            return Response(
                {"error": "Not found", "detail": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        queryset = Post.objects.filter(author=user).order_by('-created_at')
        paginator = self.pagination_class()
        paginated_queryset = paginator.paginate_queryset(queryset, request)
        serializer = PostSerializer(paginated_queryset, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)


class LikeView(APIView):
    """
    Like or unlike a post.
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={201: dict, 400: dict, 404: dict, 401: dict},
        description="Add a like to specific post"
    )
    def post(self, request, id):
        try:
            post = Post.objects.get(id=id)
        except Post.DoesNotExist:
            return Response(
                {"error": "Not found", "detail": "Post not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if already liked
        if Like.objects.filter(user=request.user, post=post).exists():
            return Response(
                {"error": "Already liked", "detail": "You have already liked this post"},
                status=status.HTTP_400_BAD_REQUEST
            )

        Like.objects.create(user=request.user, post=post)
        likes_count = post.likes.count()

        return Response(
            {"message": "Post liked successfully", "likes_count": likes_count},
            status=status.HTTP_201_CREATED
        )

    @extend_schema(
        responses={200: dict, 400: dict, 404: dict, 401: dict},
        description="Remove like from specific post"
    )
    def delete(self, request, id):
        try:
            post = Post.objects.get(id=id)
        except Post.DoesNotExist:
            return Response(
                {"error": "Not found", "detail": "Post not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            like = Like.objects.get(user=request.user, post=post)
        except Like.DoesNotExist:
            return Response(
                {"error": "Not liked yet", "detail": "You have not liked this post yet"},
                status=status.HTTP_400_BAD_REQUEST
            )

        like.delete()
        likes_count = post.likes.count()

        return Response(
            {"message": "Post unliked successfully", "likes_count": likes_count},
            status=status.HTTP_200_OK
        )


class CommentListCreateView(APIView):
    """
    Get comments for a post or create a new comment.
    """
    authentication_classes = [TokenAuthentication]
    pagination_class = StandardResultsSetPagination

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated()]
        return [AllowAny()]

    @extend_schema(
        responses={200: CommentSerializer(many=True), 404: dict},
        description="Retrieve paginated list of comments for specific post"
    )
    def get(self, request, id):
        try:
            post = Post.objects.get(id=id)
        except Post.DoesNotExist:
            return Response(
                {"error": "Not found", "detail": "Post not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        queryset = Comment.objects.filter(post=post).order_by('-created_at')
        paginator = self.pagination_class()
        paginated_queryset = paginator.paginate_queryset(queryset, request)
        serializer = CommentSerializer(paginated_queryset, many=True)
        return paginator.get_paginated_response(serializer.data)

    @extend_schema(
        request=CommentCreateSerializer,
        responses={201: CommentSerializer, 400: dict, 404: dict, 401: dict},
        description="Create a new comment on specific post"
    )
    def post(self, request, id):
        try:
            post = Post.objects.get(id=id)
        except Post.DoesNotExist:
            return Response(
                {"error": "Not found", "detail": "Post not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = CommentCreateSerializer(data=request.data)
        if serializer.is_valid():
            comment = serializer.save(author=request.user, post=post)
            response_serializer = CommentSerializer(comment)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CommentDeleteView(APIView):
    """
    Delete specific comment.
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={204: None, 403: dict, 404: dict, 401: dict},
        description="Delete specific comment by ID"
    )
    def delete(self, request, id):
        try:
            comment = Comment.objects.get(id=id)
        except Comment.DoesNotExist:
            return Response(
                {"error": "Not found", "detail": "Comment not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if user is the author
        if request.user.id != comment.author.id:
            return Response(
                {"error": "Permission denied", "detail": "You can only delete your own comments"},
                status=status.HTTP_403_FORBIDDEN
            )

        comment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class HelloView(APIView):
    """
    A simple API endpoint that returns a greeting message.
    """

    @extend_schema(
        responses={200: MessageSerializer}, description="Get a hello world message"
    )
    def get(self, request):
        data = {"message": "Hello!", "timestamp": timezone.now()}
        serializer = MessageSerializer(data)
        return Response(serializer.data)
