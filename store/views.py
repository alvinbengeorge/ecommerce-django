
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from django.shortcuts import get_object_or_404
from .serializers import (
    MyTokenObtainPairSerializer, RegisterSerializer, 
    ProductSerializer, OrderSerializer, PlaceOrderSerializer,
    TenantSerializer
)
from .models import Product, Order, OrderItem, Tenant
from .permissions import IsStoreOwner, IsOwnerOrStaff, IsCustomer

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({"message": "User created successfully", "username": user.username}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TenantViewSet(viewsets.ModelViewSet):
    # Allow creating tenants. In production, protect this.
    queryset = Tenant.objects.all()
    serializer_class = TenantSerializer
    permission_classes = [permissions.AllowAny]

class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated or not hasattr(user, 'tenant') or not user.tenant:
            return Product.objects.none()
        return Product.objects.filter(tenant=user.tenant)

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsOwnerOrStaff()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.tenant)

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated or not hasattr(user, 'tenant') or not user.tenant:
            return Order.objects.none()
        
        if user.role in ['OWNER', 'STAFF']:
            return Order.objects.filter(tenant=user.tenant)
        return Order.objects.filter(tenant=user.tenant, customer=user)

    def create(self, request, *args, **kwargs):
        input_serializer = PlaceOrderSerializer(data=request.data)
        if input_serializer.is_valid():
            items_data = input_serializer.validated_data['items']
            total_amount = 0
            
            # Validation pass
            for item in items_data:
                # Ensure product belongs to the same tenant!
                product = get_object_or_404(Product, id=item['product_id'], tenant=request.user.tenant)
                if product.stock < item['quantity']:
                     return Response({"error": f"Not enough stock for {product.name}"}, status=400)
            
            # Creation pass
            order = Order.objects.create(
                tenant=request.user.tenant,
                customer=request.user,
                status='PENDING',
                total_amount=0
            )

            for item in items_data:
                product = Product.objects.get(id=item['product_id'])
                quantity = item['quantity']
                price = product.price
                OrderItem.objects.create(order=order, product=product, quantity=quantity, price=price)
                total_amount += price * quantity
                
                # Deduct stock
                product.stock -= quantity
                product.save()

            order.total_amount = total_amount
            order.save()
            
            return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)
        
        return Response(input_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
