
# Deployment Guide

This guide explains how to deploy your containerized Django application securely.

## 1. Environment Variables
Ensure your production environment uses a `.env` file or environment variable manager with:
```bash
DEBUG=False
SECRET=your-super-secret-production-key
DATABASE_URI=postgres://user:pass@host:5432/dbname
GS_BUCKET_NAME=your-bucket-name
ALLOWED_HOSTS=your-domain.com,api.your-domain.com
```

## 2. Handling `service-account-key.json` (Google Cloud Credentials)

**NEVER** commit this file to Git. There are three common ways to handle this in production:

### Method A: Volume Mount (VPS / Docker Compose)
If you have a Virtual Private Server (VPS) like EC2 or DigitalOcean:
1.  **Securely Copy (SCP)** the `.env` and `service-account-key.json` files to your server.
    ```bash
    scp service-account-key.json user@your-server-ip:/path/to/app/
    scp .env user@your-server-ip:/path/to/app/
    ```
2.  Run `docker-compose up -d --build`.
3.  The `docker-compose.yml` is already configured to mount this file into the container.

### Method B: Google Secret Manager (Cloud Run / GKE)
If deploying to Google Cloud Run:
1.  Upload the `service-account-key.json` content to **Secret Manager**.
2.  Deploy your container to Cloud Run.
3.  Mount the secret as a volume at path `/app/service-account-key.json`.
4.  Set `GOOGLE_APPLICATION_CREDENTIALS=/app/service-account-key.json` env var.

### Method C: Environment Variable Injection (Heroku / Render / Railway)
Most PaaS providers don't support file uploads easily. You can inject the JSON content as an ENV variable.
1.  Create an ENV variable named `GCP_CREDENTIALS_JSON` containing the *entire contents* of your `service-account-key.json`.
2.  Update your `docker-compose.yml` or entrypoint script to write this variable to a file before starting the app:
    ```bash
    # entrypoint.sh
    echo "$GCP_CREDENTIALS_JSON" > /app/service-account-key.json
    exec gunicorn ...
    ```

## 3. Database
*   **Production**: Do *not* run the database inside Docker Compose on the same server (unless it's a small hobby project).
*   Use a managed database provider like **Supabase**, **AWS RDS**, or **Google Cloud SQL**.
*   Ensure your `DATABASE_URI` points to this production database (use the Connection Pooler URL if using Supabase).

## 4. Serving Static Files
In production (DEBUG=False), Django does not serve static files (CSS/JS for Admin).
You must run `python manage.py collectstatic`.
*   **Simple Fix**: `whitenoise` middleware can serve static files efficiently.
*   **Better Fix**: Configure `django-storages` to also upload static files to Google Cloud Storage (requires separate bucket or config).

For now, `whitenoise` is recommended for Docker deployments.
```bash
pip install whitenoise
```
Add to `MIDDLEWARE` in `settings.py` (right after SecurityMiddleware):
```python
"whitenoise.middleware.WhiteNoiseMiddleware",
```
