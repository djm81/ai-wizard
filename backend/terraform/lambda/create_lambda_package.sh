#!/bin/bash
zip -r lambda_package.zip app
echo "Lambda package created successfully:"
pwd
ls -lh lambda_package.zip
