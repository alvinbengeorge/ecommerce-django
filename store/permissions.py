from rest_framework import permissions

class IsCustomAuthenticated(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.custom_user)

class IsStoreOwner(permissions.BasePermission):
    def has_permission(self, request, view):
        user = getattr(request, 'custom_user', None)
        return bool(user and user.role == 'OWNER')

class IsOwnerOrStaff(permissions.BasePermission):
    def has_permission(self, request, view):
        user = getattr(request, 'custom_user', None)
        return bool(user and user.role in ['OWNER', 'STAFF'])

class IsCustomer(permissions.BasePermission):
    def has_permission(self, request, view):
        user = getattr(request, 'custom_user', None)
        return bool(user and user.role == 'CUSTOMER')
