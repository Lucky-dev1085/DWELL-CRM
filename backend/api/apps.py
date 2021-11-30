from django.apps import AppConfig


class ApiConfig(AppConfig):
    name = 'backend.api'

    def ready(self):
        import backend.api.signals  # NOQA
