Quick Coolify deployment notes

1. In Coolify create a new application:
   - Build method: Dockerfile
   - Dockerfile path: backend/Dockerfile
   - Context: the repository root (or backend/)

2. Set the port to `8000` (or provide `PORT` env var) and add environment variables:
   - OPENAI_API_KEY (required)
   - SUPABASE_URL
   - SUPABASE_ANON_KEY
   - Any other keys from .env.example

3. (Optional) Add a health check endpoint `/` which returns status 200.

4. For uploads (Supabase), ensure outbound network access is allowed.

Local dev with Docker Compose:

```bash
cd backend
docker-compose up --build
```

That's it — the provided Dockerfile is minimal and should work on Coolify. If you want a Procfile-style or more advanced coolify.yml, tell me your Coolify setup and I'll tailor it.
