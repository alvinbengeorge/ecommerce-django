# 🛍️ Multi-Tenant E-Commerce Platform

![Python](https://img.shields.io/badge/Python-3.13-blue?style=for-the-badge&logo=python&logoColor=white)
![Django](https://img.shields.io/badge/Django-6.0-092E20?style=for-the-badge&logo=django&logoColor=white)
![DRF](https://img.shields.io/badge/Django_REST-Framework-red?style=for-the-badge&logo=django&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

A robust, scalable backend for hosting multiple e-commerce stores on a single platform. Built with **Django** and **Django Rest Framework (DRF)**, featuring a shared-database multi-tenancy architecture and JWT-based authentication.

---

## ✨ Key Features

*   **🏢 Multi-Tenancy**: Shared database, shared schema approach. Data is strictly isolated per tenant (store).
*   **🔐 RBAC (Role-Based Access Control)**: Granular permissions for `OWNER`, `STAFF`, and `CUSTOMER` roles.
*   **🔑 Secure Authentication**: JWT (JSON Web Token) authentication with custom payload claims (role, tenant_id).
*   **📦 Product Management**: Full CRUD operations for products, isolated by store.
*   **🛒 Order System**: Complete order lifecycle management with stock validation and atomic transactions.
*   **🐳 Dockerized**: Production-ready container setup with automated migrations.

---

## 🛠️ Tech Stack

*   **Framework**: Django 6.0 & Django Rest Framework 3.16
*   **Database**: SQLite (Dev) / PostgreSQL (Prod ready)
*   **Authentication**: Simple JWT
*   **Documentation**: DRF Spectacular (OpenAPI 3.0)
*   **Infrastructure**: Docker & Docker Compose

---

## 🚀 Getting Started

### Prerequisites

*   Python 3.10+
*   pip
*   **OR** Docker & Docker Compose

### Option A: Local Development (Manual)

1.  **Clone the Repository**
    ```bash
    git clone git@github.com:alvinbengeorge/ecommerce-django.git
    cd ecommerce_platform
    ```

2.  **Set up Virtual Environment**
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```

3.  **Install Dependencies**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Run Migrations**
    ```bash
    python manage.py makemigrations
    python manage.py migrate
    ```

5.  **Create Superuser** (Optional)
    ```bash 
    python manage.py createsuperuser # if you want to manage through admin panel
    ```

6.  **Run Server**
    ```bash
    python manage.py runserver
    ```

### Option B: Docker Setup (Recommended)

1.  **Build and Run**
    ```bash
    docker pull alvinbengeorge/ecommerce:latest
    docker compose up --build
    ```
    *This will automatically apply migrations and collect static files.*

2.  **Access the Application**
    The API will be available at `http://localhost:8000/`.

---

## 📡 API Endpoints

### 🔐 Authentication
| Method | Endpoint | Description | Payload |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register/` | Register new user | `{username, password, email, role, tenant}` |
| `POST` | `/api/auth/login/` | Login & get Token | `{username, password}` |

### 🏢 Tenants (Stores)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/tenants/` | List all stores | Authenticated |
| `POST` | `/api/tenants/` | Create a new store | Authenticated |
| `GET` | `/api/tenants/<id>/` | Retrieve store details | Authenticated |
| `PUT` | `/api/tenants/<id>/` | Update store | Authenticated |
| `DELETE` | `/api/tenants/<id>/` | Delete store | Authenticated |

### 📦 Products
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products/` | List tenant's products | Public |
| `POST` | `/api/products/` | Create product | Owner/Staff |
| `GET` | `/api/products/<id>/` | Product details | Public |
| `PUT` | `/api/products/<id>/` | Update product | Owner/Staff |
| `DELETE` | `/api/products/<id>/` | Delete product | Owner/Staff |

### 🛒 Orders
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/orders/` | List orders | Owner (all) / Customer (own) |
| `POST` | `/api/orders/` | Place order | Authenticated |
| `GET` | `/api/orders/<id>/` | Order details | Owner / Customer (own) |
| `PUT` | `/api/orders/<id>/` | Update order | Owner (all) |

### 👤 Users
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users/` | List users | Authenticated |
| `POST` | `/api/users/` | Create user | Authenticated |
| `GET` | `/api/users/<id>/` | Retrieve user | Authenticated |
| `PUT` | `/api/users/<id>/` | Update user | Authenticated |
| `DELETE` | `/api/users/<id>/` | Delete user | Authenticated |

### 📚 Documentation
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/docs/` | Swagger UI (Redirect) |
| `GET` | `/api/schema/swagger-ui/` | Swagger UI |
| `GET` | `/api/schema/redoc/` | ReDoc |
| `GET` | `/api/schema/` | OpenAPI 3.0 Schema (JSON) |

---

## 🏗️ Architecture Deep Dive

### Multi-Tenancy Strategy
We utilize a **Shared Database, Shared Schema** strategy for efficiency and simplicity.
*   **Isolation**: Every `TenantAwareModel` (Product, Order, etc.) has a `ForeignKey` to the `Tenant` model.
*   **Security**: A custom `TenantMiddleware` automatically intercepts requests to determine the context. All `ViewSets` use a base QuerySet filter to strictly limit data access to the active tenant.

### Authorization Flow
1.  User logs in $\rightarrow$ Receives JWT with `role` and `tenant_id` claims.
2.  Request sent with `Authorization: Bearer <token>`.
3.  `CustomAuthMiddleware` decodes token and sets `request.custom_user`.
4.  `TenantMiddleware` sets the global tenant context based on the user.
5.  Views enforce permissions using `IsStoreOwner`, `IsStaff`, etc.

---

Made with ❤️ by Alvin using Django
