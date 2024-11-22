#!/bin/bash

# Create build directory
mkdir -p build

# Copy app files to build directory
cp -r app build/

# Create requirements file excluding development dependencies
poetry export --only main -f requirements.txt --without-hashes --output requirements.txt

# Install dependencies
pip install \
    --target=build \
    --implementation cp \
    --python-version 3.12 \
    --only-binary=:all: \
    --platform manylinux2014_x86_64 \
    --upgrade pydantic \
    -r requirements.txt

# Clean up
cd build
find . -type d -name "tests" -exec rm -rf {} +
find . -type d -name "__pycache__" -exec rm -rf {} +
find . -type f -name "*.pyc" -delete
find . -type f -name "*.pyo" -delete
find . -type f -name "*.pyd" -delete

# Preserve email-validator dist-info while cleaning others
find . -type d -name "*.dist-info" ! -name "email_validator*.dist-info" -exec rm -rf {} +
find . -type d -name "*.egg-info" -exec rm -rf {} +

# Create deployment package
zip -r9 ../lambda_package.zip .

cd ..
echo "Lambda package created successfully:"
pwd
ls -lh lambda_package.zip

# Cleanup build directory
rm -rf build
