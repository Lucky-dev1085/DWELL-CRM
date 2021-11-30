from django.core.management.base import BaseCommand
from django.db import transaction
from backend.api.factories import Property


class Command(BaseCommand):
    help = 'Creates initial thousands of leads for leads table test'

    def add_arguments(self, parser):
        parser.add_argument(
            '--num',
            help="""Number of leads to be created."""
        )

    @transaction.atomic
    def handle(self, *args, **options):
        """
        Creates initial thousands of leads for leads table test

        """
        for property in Property.objects.all():
            design = property.page_data.filter(section='DESIGN').first()
            if design:
                values = design.values
                labels = values.get('labels', [])
                existing = next((i for i in labels if i.get('name') == '$Footer-links-color'), None)
                if not existing:
                    labels.append({
                        'name': '$footer-links-color',
                        'label': 'Footer links color'
                    })

                    colors = values.get('customColors', {})

                    colors['V1'].append({
                        'name': '$footer-links-color',
                        'value': 'white'
                    })
                    colors['V2'].append({
                        'name': '$footer-links-color',
                        'value': '#423F43'
                    })
                    colors['V3'].append({
                        'name': '$footer-links-color',
                        'value': 'white'
                    })
                    colors['V4'].append({
                        'name': '$footer-0links-color',
                        'value': '#423F43'
                    })

                    values['customColors'] = colors

                    design.values = values
                    design.save()
