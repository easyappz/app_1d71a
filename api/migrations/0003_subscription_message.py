# Generated migration for Subscription and Message models

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_token'),
    ]

    operations = [
        migrations.CreateModel(
            name='Subscription',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('subscriber', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='subscriptions', to='api.member')),
                ('target', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='subscribers', to='api.member')),
            ],
            options={
                'db_table': 'subscriptions',
                'ordering': ['-created_at'],
                'unique_together': {('subscriber', 'target')},
            },
        ),
        migrations.CreateModel(
            name='Message',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('content', models.TextField()),
                ('is_read', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('sender', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sent_messages', to='api.member')),
                ('receiver', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='received_messages', to='api.member')),
            ],
            options={
                'db_table': 'messages',
                'ordering': ['-created_at'],
            },
        ),
    ]