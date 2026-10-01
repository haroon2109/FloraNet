# FloraNet FastAPI Backend
# Build context: repo root (.)   Dockerfile path: backend/Dockerfile
# Render setting: Dockerfile Path = backend/Dockerfile, Docker Build Context = . (repo root)
FROM python:3.11-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Context is repo root, so prefix with backend/
COPY backend/requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# ── Final minimal runner ──────────────────────────────────────────────────────
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /root/.local /root/.local
# Copy only the backend app code, not the whole monorepo
COPY backend/app ./app
# data/ contains only runtime-generated files (e.g. pest_watch.sqlite3) — not in git.
# Create the directory so the app can write to it on first run.
RUN mkdir -p ./data

ENV PATH=/root/.local/bin:$PATH
ENV PYTHONUNBUFFERED=1
ENV PORT=7880

EXPOSE 7880

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:7880/ || exit 1

CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7880"]
