# CareFlow AI Deployment

Live frontend:

```text
https://careflow-ai-searingshot.vercel.app/
```

## Backend: Hugging Face Spaces

1. Create a free Space with the Docker SDK.
2. Upload the contents of `backend/` to the Space.
3. Add Space secrets:
   - `GEMINI_API_KEY`
   - `CORS_ORIGINS=https://careflow-ai-searingshot.vercel.app`
   - `DATABASE_URL=sqlite:///./CareFlow.db`
4. The Dockerfile starts FastAPI with Uvicorn on port `7860`.
5. Confirm health at `https://searingshot-careflow-ai-backend.hf.space/health`.

SQLite is kept local to the Space and tables initialize at startup through `Base.metadata.create_all`.

## Frontend: Vercel

1. Deploy the `frontend/` folder to Vercel.
2. Set the Vercel environment variable:
   - `VITE_API_BASE_URL=https://searingshot-careflow-ai-backend.hf.space`
3. Build command: `npm run build`.
4. Output directory: `dist`.

For local development, Vite still proxies `/api` to `http://localhost:8000`.
