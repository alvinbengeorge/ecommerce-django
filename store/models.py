from django.db import models
from .tenant_utils import TenantAwareModel

class Tenant(models.Model):
    name = models.CharField(max_length=100)
    logo = models.ImageField(upload_to='tenant_logos/', blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class StoreUser(models.Model):
    ROLE_CHOICES = (
        ('OWNER', 'Store Owner'),
        ('STAFF', 'Staff'),
        ('CUSTOMER', 'Customer'),
    )
    username = models.CharField(max_length=150, unique=True)
    password = models.CharField(max_length=255) # Hashed
    email = models.EmailField(unique=True)
    
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='users', null=True, blank=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='CUSTOMER')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.username} ({self.role})"

class Product(TenantAwareModel):
    # tenant field inherited from TenantAwareModel
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.IntegerField(default=0)
    category = models.CharField(max_length=100, blank=True)
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.tenant.name})"

class Order(TenantAwareModel):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('PAID', 'Paid'),
        ('SHIPPED', 'Shipped'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    )
    # tenant field inherited from TenantAwareModel
    customer = models.ForeignKey(StoreUser, on_delete=models.CASCADE, related_name='orders')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order #{self.id} - {self.customer.username}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2) # Price at time of order
