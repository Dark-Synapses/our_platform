# syntax=docker/dockerfile:1
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements-lock.txt ./
RUN pip install --no-cache-dir -r requirements-lock.txt

ARG INSTALL_KAREN=false
ARG KAREN_OFFLINE=false

COPY requirements-karen-lock.txt ./

RUN --mount=type=bind,source=.,target=/build-context,readonly \
    --mount=type=cache,target=/root/.cache/pip \
    if [ "$INSTALL_KAREN" = "true" ]; then \
      if [ "$KAREN_OFFLINE" = "true" ]; then \
        pip install --no-index \
          --find-links=/build-context/karen-wheelhouse \
          -c requirements-lock.txt \
          -r requirements-karen-lock.txt; \
      else \
        pip install --timeout 120 --retries 10 \
          -c requirements-lock.txt \
          -r requirements-karen-lock.txt; \
      fi && pip check; \
    fi

RUN useradd --create-home appuser && \
    mkdir -p /app/model-cache && \
    chown appuser:appuser /app/model-cache

COPY --chown=appuser:appuser . .

USER appuser

EXPOSE 10000

CMD ["sh", "-c", "exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-10000}"]
