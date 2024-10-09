FROM python:3.12

# Create a non-root user
RUN useradd -m appuser

WORKDIR /app

# Copy poetry files
COPY pyproject.toml poetry.lock ./

COPY pyproject.toml poetry.lock ./
RUN pip install poetry==1.8.3 && \
    poetry config virtualenvs.create false && \
    poetry install --only main

# COPY . .
# Copy only the backend files, excluding the frontend folder
COPY app app
COPY tests tests
COPY alembic.ini .
COPY .env .
COPY .env.* .
COPY migrations migrations
COPY LICENSE README.md ./

# Change to the non-root user
USER appuser

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]