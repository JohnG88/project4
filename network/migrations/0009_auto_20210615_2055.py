# Generated by Django 3.1.6 on 2021-06-16 03:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0008_remove_profile_following'),
    ]

    operations = [
        migrations.AlterField(
            model_name='post',
            name='content',
            field=models.CharField(max_length=280, null=True),
        ),
    ]
