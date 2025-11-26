from django.db import models
from api.models import Member
import secrets


class Token(models.Model):
    """
    The authorization token model.
    """
    key = models.CharField(max_length=40, primary_key=True)
    user = models.OneToOneField(
        Member,
        related_name='auth_token',
        on_delete=models.CASCADE
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'tokens'
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.key:
            self.key = self.generate_key()
        return super().save(*args, **kwargs)

    @classmethod
    def generate_key(cls):
        return secrets.token_hex(20)

    def __str__(self):
        return self.key
