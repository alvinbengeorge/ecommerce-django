from rest_framework import serializers
from .models import Tenant, StoreUser, Product, Order, OrderItem
from .authentication import hash_pass

class TenantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tenant
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoreUser
        fields = ('id', 'username', 'email', 'role', 'tenant')

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = StoreUser
        fields = ('username', 'password', 'email', 'role', 'tenant')

    def create(self, validated_data):
        # Manual password hashing
        password = validated_data.pop('password')
        hashed = hash_pass(password)
        
        user = StoreUser.objects.create(
            password=hashed,
            **validated_data
        )
        return user

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'
        read_only_fields = ('tenant',)

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')

    class Meta:
        model = OrderItem
        fields = ('product', 'quantity', 'price', 'product_name')

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = ('tenant', 'customer', 'total_amount', 'created_at')

class OrderItemInputSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField()

class PlaceOrderSerializer(serializers.Serializer):
    items = OrderItemInputSerializer(many=True)
