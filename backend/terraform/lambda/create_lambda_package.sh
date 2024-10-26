#!/bin/bash
zip -j lambda_function.zip lambda_handler.py
echo "Lambda package created successfully:"
pwd
ls -lh lambda_function.zip