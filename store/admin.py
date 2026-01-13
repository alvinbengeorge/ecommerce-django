from django.contrib import admin
from .models import Tenant, StoreUser, Product, Order, OrderItem

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'tenant', 'price', 'stock', 'category', 'created_at')
    list_filter = ('tenant', 'category', 'created_at')
    search_fields = ('name', 'description')

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'tenant', 'customer', 'status', 'total_amount', 'created_at')
    list_filter = ('tenant', 'status', 'created_at')
    search_fields = ('customer__username', 'tenant__name')

admin.site.register(Tenant)
admin.site.register(StoreUser)
admin.site.register(OrderItem)
