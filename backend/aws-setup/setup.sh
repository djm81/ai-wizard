#!/bin/bash

# Prompt for AWS account ID and region
read -p "Enter your AWS Account ID: " aws_account_id
read -p "Enter your AWS Region (e.g., eu-west-1): " aws_region

# Define stack names
ai_wizard_role_stack="AIWizardDeploymentRoleStack"
ai_wizard_ecr_stack="AIWizardECRStack"

# Check if the AI Wizard Role stack exists
if aws cloudformation describe-stacks --stack-name "$ai_wizard_role_stack" >/dev/null 2>&1; then
    echo "Updating stack: $ai_wizard_role_stack"
    aws cloudformation update-stack --stack-name "$ai_wizard_role_stack" --template-body file://./cf-ai-wizard-deployment-role.yaml --parameters ParameterKey=TrustedAccount,ParameterValue="$aws_account_id" --capabilities CAPABILITY_NAMED_IAM --region $aws_region
else
    echo "Creating stack: $ai_wizard_role_stack"
    aws cloudformation create-stack --stack-name "$ai_wizard_role_stack" --template-body file://./cf-ai-wizard-deployment-role.yaml --parameters ParameterKey=TrustedAccount,ParameterValue="$aws_account_id" --capabilities CAPABILITY_NAMED_IAM --region $aws_region
fi

# Check if the AI Wizard ECR stack exists
if aws cloudformation describe-stacks --stack-name "$ai_wizard_ecr_stack" >/dev/null 2>&1; then
    echo "Updating stack: $ai_wizard_ecr_stack"
    aws cloudformation update-stack --stack-name "$ai_wizard_ecr_stack" --template-body file://./cf-ai-wizard-private-ecr.yaml --capabilities CAPABILITY_NAMED_IAM --region $aws_region
else
    echo "Creating stack: $ai_wizard_ecr_stack"
    aws cloudformation create-stack --stack-name "$ai_wizard_ecr_stack" --template-body file://./cf-ai-wizard-private-ecr.yaml --capabilities CAPABILITY_NAMED_IAM --region $aws_region
fi