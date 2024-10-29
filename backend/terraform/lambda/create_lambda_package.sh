#!/bin/bash
zip -j lambda_package.zip lambda_handler.py
echo "Lambda package created successfully:"
pwd
ls -lh lambda_package.zip