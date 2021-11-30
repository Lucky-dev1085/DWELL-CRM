from rest_framework.renderers import JSONRenderer


class CustomChatReportRenderer(JSONRenderer):
    def render(self, data, accepted_media_type=None, renderer_context=None):
        formatted_data = super(CustomChatReportRenderer, self).render({'results': data},
                                                                      accepted_media_type=None,
                                                                      renderer_context=None
                                                                      )
        return formatted_data
