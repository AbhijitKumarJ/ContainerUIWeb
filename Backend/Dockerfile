FROM python:3.11-alpine

WORKDIR /app

# Install bash for shell functionality
RUN apk add --no-cache bash

# Copy requirements first to leverage cache
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Set default directory environment variable for file explorer
ENV DEFAULT_DIRECTORY=/

# Expose port
EXPOSE 8000

# Run the application
CMD ["python", "main.py"]
