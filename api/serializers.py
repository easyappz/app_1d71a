from rest_framework import serializers
from api.models import Member, Post, Comment, Message, Subscription, Like


class MemberShortSerializer(serializers.ModelSerializer):
    """Short serializer for nested user representation"""
    class Meta:
        model = Member
        fields = ['id', 'username', 'first_name', 'last_name', 'avatar', 'is_online']
        read_only_fields = ['id', 'username', 'first_name', 'last_name', 'avatar', 'is_online']


class MemberSerializer(serializers.ModelSerializer):
    """Full member profile serializer"""
    class Meta:
        model = Member
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'avatar', 'bio', 'is_online', 'last_seen', 'created_at']
        read_only_fields = ['id', 'username', 'email', 'created_at']


class MemberRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True, min_length=8, style={'input_type': 'password'})
    
    class Meta:
        model = Member
        fields = ['username', 'email', 'password', 'first_name', 'last_name']
        extra_kwargs = {
            'username': {'min_length': 3, 'max_length': 150},
            'first_name': {'max_length': 150, 'required': True},
            'last_name': {'max_length': 150, 'required': True},
        }
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        member = Member(**validated_data)
        member.set_password(password)
        member.save()
        return member


class MemberLoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True, style={'input_type': 'password'})


class MemberUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile"""
    class Meta:
        model = Member
        fields = ['first_name', 'last_name', 'avatar', 'bio']
        extra_kwargs = {
            'first_name': {'max_length': 150, 'required': False},
            'last_name': {'max_length': 150, 'required': False},
            'avatar': {'required': False, 'allow_null': True},
            'bio': {'required': False},
        }


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing password"""
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True, min_length=8)


class TokenSerializer(serializers.Serializer):
    """Serializer for token response"""
    token = serializers.CharField()
    user = MemberSerializer()


class PostCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating posts"""
    class Meta:
        model = Post
        fields = ['content', 'image']
        extra_kwargs = {
            'content': {'min_length': 1},
            'image': {'required': False, 'allow_null': True},
        }


class PostSerializer(serializers.ModelSerializer):
    """Full post serializer with related data"""
    author = MemberShortSerializer(read_only=True)
    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    
    class Meta:
        model = Post
        fields = ['id', 'author', 'content', 'image', 'likes_count', 'comments_count', 'is_liked', 'created_at']
        read_only_fields = ['id', 'author', 'created_at']
    
    def get_likes_count(self, obj):
        return obj.likes.count()
    
    def get_comments_count(self, obj):
        return obj.comments.count()
    
    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False


class CommentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating comments"""
    class Meta:
        model = Comment
        fields = ['content']
        extra_kwargs = {
            'content': {'min_length': 1},
        }


class CommentSerializer(serializers.ModelSerializer):
    """Full comment serializer with author data"""
    author = MemberShortSerializer(read_only=True)
    post = serializers.PrimaryKeyRelatedField(read_only=True)
    
    class Meta:
        model = Comment
        fields = ['id', 'author', 'post', 'content', 'created_at']
        read_only_fields = ['id', 'author', 'post', 'created_at']


class MessageSerializer(serializers.ModelSerializer):
    """Serializer for messages"""
    class Meta:
        model = Message
        fields = ['id', 'sender', 'receiver', 'content', 'is_read', 'created_at']
        read_only_fields = ['id', 'sender', 'receiver', 'is_read', 'created_at']


class MessageCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating messages"""
    class Meta:
        model = Message
        fields = ['content']
        extra_kwargs = {
            'content': {'min_length': 1, 'max_length': 5000},
        }


class DialogSerializer(serializers.Serializer):
    """Serializer for dialog list"""
    id = serializers.IntegerField()
    participant = MemberShortSerializer()
    last_message = MessageSerializer(allow_null=True)
    unread_count = serializers.IntegerField()


class SubscriptionSerializer(serializers.ModelSerializer):
    """Serializer for subscriptions"""
    subscriber_id = serializers.IntegerField(source='subscriber.id', read_only=True)
    subscribed_to_id = serializers.IntegerField(source='target.id', read_only=True)
    
    class Meta:
        model = Subscription
        fields = ['id', 'subscriber_id', 'subscribed_to_id', 'created_at']
        read_only_fields = ['id', 'subscriber_id', 'subscribed_to_id', 'created_at']