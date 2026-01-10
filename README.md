
# Multi-Tenant E-Commerce Platform

This is a multi-tenant e-commerce backend built with Django, DRF, and JWT.

## Setup Steps

1.  **Clone the Repository** and navigate to the directory.
2.  **Install Dependencies** (Virtual environment recommended):
    ```bash
    pip install django djangorestframework djangorestframework-simplejwt
    ```
3.  **Run Migrations**:
    ```bash
    python3 manage.py makemigrations store
    python3 manage.py migrate
    ```
4.  **Create a Superuser** (optional):
    ```bash
    python3 manage.py createsuperuser
    ```
5.  **Run the Server**:
    ```bash
    python3 manage.py runserver
    ```

## API Endpoints

### Authentication
*   `POST /api/auth/register/`: Register a user.
    *   Fields: `username`, `password`, `email`, `role`, `tenant` (ID).
*   `POST /api/auth/login/`: Login to get JWT access/refresh tokens.
    *   Fields: `username`, `password`.
    *   **Response**: `access` token includes `tenant_id` and `role`.
*   `POST /api/auth/refresh/`: Refresh token.

### Tenants (Public/Admin)
*   `GET /api/tenants/`: List all stores.
*   `POST /api/tenants/`: Create a new store.

### Products
*   `GET /api/products/`: List products for the logged-in user's tenant.
*   `POST /api/products/`: Create product (Owner/Staff only).
*   `GET /api/products/<id>/`: Retrieve product details.
*   `PUT/PATCH /api/products/<id>/`: Update product (Owner/Staff only).
*   `DELETE /api/products/<id>/`: Delete product (Owner/Staff only).

### Orders
*   `GET /api/orders/`: List orders.
    *   **Owner/Staff**: See all orders for the tenant.
    *   **Customer**: See only their own orders.
*   `POST /api/orders/`: Place an order.
    *   Payload: `{"items": [{"product_id": 1, "quantity": 2}, ...]}`
*   `GET /api/orders/<id>/`: details.

## Implementation Details

### Multi-Tenancy
We implemented a **Shared Database, Shared Schema** approach.
*   Every key model (`User`, `Product`, `Order`) has a `tenant` ForeignKey linking it to the `Tenant` model.
*   **Data Isolation**: All `ViewSets` override `get_queryset()` to filter data based on the `request.user.tenant`. This ensures users can only access data belonging to their associated tenant.

### Role-Based Access Control (RBAC)
*   **Roles**: Defined as `OWNER`, `STAFF`, `CUSTOMER` on the custom `User` model.
*   **Permissions**: Custom permission classes (`IsStoreOwner`, `IsStaff`, `IsOwnerOrStaff`) enforce access rules at the view level.
*   **JWT Claims**: The `role` and `tenant_id` are embedded in the JWT token upon login, allowing the frontend to make decisions (though the backend always validates against the database state or token claims).
