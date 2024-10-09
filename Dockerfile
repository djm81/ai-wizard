FROM python:3.12

# Create a non-root user
RUN useradd -m appuser

WORKDIR /app

COPY pyproject.toml poetry.lock ./
RUN pip install poetry==1.8.3 && \
    poetry config virtualenvs.create false && \
    poetry install --only main

COPY . .

# Change to the non-root user
USER appuser

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]