from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LoginView, RegisterView, ProductViewSet, OrderViewSet, TenantViewSet, UserViewSet

router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'tenants', TenantViewSet, basename='tenant')
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/login/', LoginView.as_view(), name='auth_login'),
    # No refresh endpoint for now, or implement manually if needed
]
