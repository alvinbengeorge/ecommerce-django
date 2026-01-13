from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db import transaction

from .serializers import (
    RegisterSerializer, ProductSerializer, OrderSerializer, 
    PlaceOrderSerializer, TenantSerializer, UserSerializer
)
from .models import Product, Order, OrderItem, Tenant, StoreUser
from .permissions import IsStoreOwner, IsOwnerOrStaff, IsCustomer, IsCustomAuthenticated
from .authentication import verify_pass, create_token

class LoginView(APIView):
    permission_classes = [] 

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
             return Response({"error": "Username and password required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = StoreUser.objects.get(username=username)
        except StoreUser.DoesNotExist:
             return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
             
        if verify_pass(password, user.password):
            token = create_token(user)
            return Response({'access': token}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

class RegisterView(APIView):
    permission_classes = []

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({"message": "User created successfully", "username": user.username}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TenantViewSet(viewsets.ModelViewSet):
    queryset = Tenant.objects.all()
    serializer_class = TenantSerializer
    permission_classes = [IsCustomAuthenticated]

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
             return [] # Public?
        return [IsCustomAuthenticated()]

    def perform_create(self, serializer):
        tenant = serializer.save()
        user = self.request.custom_user
        if user:
            user.tenant = tenant
            user.role = 'OWNER'
            user.save()

class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    # Permission handled by get_permissions logic below + IsCustomAuthenticated default if needed
    
    def get_queryset(self):
        # TenantManager handles the filtering automatically via TenantAwareModel
        if self.action in ['list', 'retrieve']:
             return Product.objects.all()
        
        # Admin override?
        user = getattr(self.request, 'custom_user', None)
        # Assuming TenantManager does the heavy lifting, we just return all()
        # But if we want to be explicit:
        return Product.objects.all()

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return []
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsCustomAuthenticated(), IsOwnerOrStaff()]
        return [IsCustomAuthenticated()]

    def perform_create(self, serializer):
        # Explicitly set tenant from the authenticated user to ensure it's not missed
        user = getattr(self.request, 'custom_user', None)
        if user and user.tenant:
            serializer.save(tenant=user.tenant)
        else:
            # Fallback to existing logic (middleware context) or fail if no tenant
            serializer.save()

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsCustomAuthenticated]

    def get_queryset(self):
        user = getattr(self.request, 'custom_user', None)
        if not user:
            return Order.objects.none()
        
        # If Owner/Staff -> Show Tenant Orders (Managed by TenantManager automatically)
        if user.role in ['OWNER', 'STAFF']:
            return Order.objects.all()
            
        # If Customer -> Show Own Orders
        return Order.objects.filter(customer=user)

    def create(self, request, *args, **kwargs):
        input_serializer = PlaceOrderSerializer(data=request.data)
        if not input_serializer.is_valid():
            return Response(input_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        items_data = input_serializer.validated_data['items']
        user = request.custom_user
        
        if not user:
            return Response({"error": "Authentication required"}, status=401)

        product_ids = [item['product_id'] for item in items_data]
        products = Product.objects.filter(id__in=product_ids).select_related('tenant')
        
        if len(products) != len(product_ids):
             return Response({"error": "One or more products found invalid"}, status=400)

        product_map = {p.id: p for p in products}
        orders_by_tenant = {}

        for item in items_data:
            product = product_map.get(item['product_id'])
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
                    
                    # We need to manually set tenant because if the CUSTOMER is buying from Tenant A,
                    # but the context is NOT locked to Tenant A (since customer has no tenant), 
                    # TenantAwareModel might not pick it up automatically or might error.
                    # We should Explicitly set it.
                    
                    order = Order.objects.create(
                        tenant=tenant_obj,
                        customer=user,
                        status='COMPLETED', # Auto-complete for now
                        total_amount=sum(i['product'].price * i['quantity'] for i in order_items)
                    )
                    
                    for item in order_items:
                        OrderItem.objects.create(
                            order=order,
                            product=item['product'],
                            quantity=item['quantity'],
                            price=item['product'].price
                        )
                        # Deduct stock
                        p = item['product']
                        p.stock -= item['quantity']
                        p.save()
                        
                    created_orders.append(order)
                    
        except Exception as e:
            return Response({"error": str(e)}, status=500)

        return Response(OrderSerializer(created_orders, many=True).data, status=status.HTTP_201_CREATED)

class UserViewSet(viewsets.ModelViewSet):
    queryset = StoreUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsCustomAuthenticated] # Only admins?
