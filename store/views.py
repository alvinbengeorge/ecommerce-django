
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from django.shortcuts import get_object_or_404
from .serializers import (
    MyTokenObtainPairSerializer, RegisterSerializer, 
    ProductSerializer, OrderSerializer, PlaceOrderSerializer,
    TenantSerializer, UserSerializer
)
from .models import Product, Order, OrderItem, Tenant, User
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
    queryset = Tenant.objects.all()
    serializer_class = TenantSerializer
    permission_classes = [permissions.IsAuthenticated] 

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        # Create the tenant
        tenant = serializer.save()
        
        # Assign this tenant to the user who created it, making them the owner
        user = self.request.user
        user.tenant = tenant
        user.role = 'OWNER' # Enforce Owner role
        user.save()

class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Allow anyone to see products, but filter?
        # For a marketplace, usually we show ALL products or filter by query params.
        # But the original code restricted it to "user.tenant".
        # We want a GLOBAL marketplace view for the homepage?
        # Or is this a tenant-specific dashboard?
        # "Multi-Vendor Marketplace" -> Customers see everything.
        if self.action in ['list', 'retrieve']:
             queryset = Product.objects.all()
             tenant_id = self.request.query_params.get('tenant')
             if tenant_id:
                 queryset = queryset.filter(tenant_id=tenant_id)
             return queryset
        
        # For managing products, restrict to tenant
        user = self.request.user
        
        # Admins can edit anything
        if user.is_superuser:
            return Product.objects.all()

        if not user.is_authenticated or not hasattr(user, 'tenant') or not user.tenant:
            return Product.objects.none()
        return Product.objects.filter(tenant=user.tenant)

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsOwnerOrStaff()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.tenant)

from django.db import transaction

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Order.objects.none()
        
        # If user is a Seller (Owner/Staff), show orders for their store
        if user.role in ['OWNER', 'STAFF'] and user.tenant:
            return Order.objects.filter(tenant=user.tenant)
            
        # Otherwise (Customer), show their own orders
        return Order.objects.filter(customer=user)

    def create(self, request, *args, **kwargs):
        input_serializer = PlaceOrderSerializer(data=request.data)
        if not input_serializer.is_valid():
            return Response(input_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        items_data = input_serializer.validated_data['items']
        
        # 1. Group items by Tenant (Seller)
        # We need to fetch products first to know their tenant
        product_ids = [item['product_id'] for item in items_data]
        products = Product.objects.filter(id__in=product_ids).select_related('tenant')
        
        if len(products) != len(product_ids):
             return Response({"error": "One or more products found invalid"}, status=400)

        product_map = {p.id: p for p in products}
        
        # Group: { tenant_id: [ {product, quantity} ] }
        orders_by_tenant = {}

        for item in items_data:
            product = product_map.get(item['product_id'])
            if not product:
                continue # Should be caught above
            
            if product.stock < item['quantity']:
                return Response({"error": f"Not enough stock for {product.name}"}, status=400)

            tenant_id = product.tenant.id
            if tenant_id not in orders_by_tenant:
                orders_by_tenant[tenant_id] = []
            orders_by_tenant[tenant_id].append({
                'product': product,
                'quantity': item['quantity']
            })

        created_orders = []

        try:
            with transaction.atomic():
                for tenant_id, order_items in orders_by_tenant.items():
                    # Create Order for this tenant
                    tenant_obj = order_items[0]['product'].tenant
                    
                    order = Order.objects.create(
                        tenant=tenant_obj,
                        customer=request.user,
                        status='PENDING',
                        total_amount=0
                    )

                    total_amount = 0
                    for item_info in order_items:
                        product = item_info['product']
                        quantity = item_info['quantity']
                        price = product.price # Snapshot price
                        
                        OrderItem.objects.create(
                            order=order,
                            product=product,
                            quantity=quantity,
                            price=price
                        )
                        
                        total_amount += price * quantity
                        
                        # Deduct stock
                        product.stock -= quantity
                        product.save()

                    order.total_amount = total_amount
                    order.save()
                    created_orders.append(order)
                    
        except Exception as e:
            return Response({"error": str(e)}, status=500)
            
        # Return the first order (or list? StandardViewSet usually expects one, but we made multiple)
        # For now, let's return the data of all created orders or just success message
        return Response(OrderSerializer(created_orders, many=True).data, status=status.HTTP_201_CREATED)

    def perform_update(self, serializer):
        user = self.request.user
        order = self.get_object()
        
        # Only Tenant Owner/Staff can change status
        if user.role not in ['OWNER', 'STAFF']:
             # Unless it's a cancellation? For now restrict strictly.
             raise permissions.PermissionDenied("Customers cannot update orders.")
             
        if user.tenant != order.tenant:
             raise permissions.PermissionDenied("You do not have permission for this order.")
             
        serializer.save()

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_superuser:
            return User.objects.all()
        # Users can only see themselves (or maybe staff see customers? let's stick to self for now)
        return User.objects.filter(id=self.request.user.id)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
