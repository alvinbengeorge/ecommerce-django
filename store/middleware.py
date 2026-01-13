from django.utils.deprecation import MiddlewareMixin
from .tenant_utils import set_current_tenant
from .models import Tenant
from .authentication import get_user_from_token

class CustomAuthMiddleware(MiddlewareMixin):
    def process_request(self, request):
        auth_header = request.headers.get('Authorization')
        request.custom_user = None # Default to None

        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            user = get_user_from_token(token)
            if user:
                request.custom_user = user

class TenantMiddleware(MiddlewareMixin):
    def process_request(self, request):
        # Relies on CustomAuthMiddleware running BEFORE this
        user = getattr(request, 'custom_user', None)
        tenant = None

        if user:
            # If user is OWNER or STAFF, their context is their Tenant
            if user.role in ['OWNER', 'STAFF'] and user.tenant:
                tenant = user.tenant
        
        # Fallback: Header for testing / public access
        if not tenant:
            tenant_header = request.headers.get('X-Tenant-ID')
            if tenant_header:
                try:
                    tenant = Tenant.objects.get(id=tenant_header)
                except Tenant.DoesNotExist:
                    pass

        # Fallback: Query Param for public access (e.g. store front)
        if not tenant:
             tenant_param = request.GET.get('tenant')
             if tenant_param:
                 try:
                     tenant = Tenant.objects.get(id=tenant_param)
                 except (Tenant.DoesNotExist, ValueError):
                     pass
        
        set_current_tenant(tenant)
