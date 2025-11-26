from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.pagination import PageNumberPagination
from django.utils import timezone
from django.db.models import Q
from drf_spectacular.utils import extend_schema

from api.models import Member
from api.tokens import Token
from api.authentication import TokenAuthentication
from api.serializers import (
    MemberSerializer,
    MemberRegistrationSerializer,
    MemberLoginSerializer,
    MemberUpdateSerializer,
    MessageSerializer,
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
