import os
import django
from django.conf import settings

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from store.models import Product, StoreUser, Tenant

print("--- Database State ---")
print(f"Users: {StoreUser.objects.count()}")
for u in StoreUser.objects.all():
    print(f"  User: {u.id} - {u.username} (Role: {u.role}, Tenant: {u.tenant})")

print(f"\nTenants: {Tenant.objects.count()}")
for t in Tenant.objects.all():
    print(f"  Tenant: {t.id} - {t.name}")

print(f"\nProducts: {Product.objects.count()}")
for p in Product.objects.all():
    print(f"  Product: {p.id} - {p.name} (Tenant: {p.tenant.id})")
