# Generated by Django 3.1.6 on 2021-08-08 16:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0009_auto_20210615_2055'),
    ]

    operations = [
        migrations.AlterField(
            model_name='post',
            name='content',
            field=models.CharField(blank=True, max_length=280, null=True),
        ),
    ]