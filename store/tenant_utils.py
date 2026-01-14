from django.db import models
from django.db.models import Manager
from threading import local

_thread_locals = local()

def get_current_tenant():
    return getattr(_thread_locals, 'tenant', None)

def set_current_tenant(tenant):
    _thread_locals.tenant = tenant

class TenantManager(models.Manager):
    def get_queryset(self):
        queryset = super().get_queryset()
        tenant = get_current_tenant()
        if tenant:
            return queryset.filter(tenant=tenant)
        return queryset

class TenantAwareModel(models.Model):
    tenant = models.ForeignKey('store.Tenant', on_delete=models.CASCADE)
    
    objects = TenantManager()
    all_objects = models.Manager()

    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        if not self.tenant_id:
            tenant = get_current_tenant()
            if tenant:
                self.tenant = tenant
        super().save(*args, **kwargs)
