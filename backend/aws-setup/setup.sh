#!/bin/bash

# Prompt for AWS account ID and region
read -p "Enter your AWS Account ID: " aws_account_id
read -p "Enter your AWS Region (e.g., eu-west-1): " aws_region

# Define stack names
ai_wizard_role_stack="AIWizardDeploymentRoleStack"
ai_wizard_ecr_stack="AIWizardECRStack"

ai_wizard_role_template="./cf-ai-wizard-deployment-role.yaml"
ai_wizard_ecr_template="./cf-ai-wizard-private-ecr.yaml"

# Validate template
echo "Validating template for AI Wizard Deployment Role ..."
aws cloudformation validate-template --template-body file://$ai_wizard_role_template --no-cli-pager
if [ $? -ne 0 ]; then
    echo "CloudFormation template validation failed. Aborting script."
    exit 1
fi

# Check if the AI Wizard Role stack exists
if aws cloudformation describe-stacks --stack-name "$ai_wizard_role_stack" >/dev/null 2>&1; then
    # Get the deployed template
    deployed_ai_wizard_role_template=$(aws cloudformation get-template --stack-name $ai_wizard_role_stack --query 'TemplateBody' --output text)

    # Compare deployed with local template for changes
    if ! diff <(echo "$deployed_ai_wizard_role_template") "$ai_wizard_role_template" > /dev/null; then
        echo "Updating stack: $ai_wizard_role_stack"
        aws cloudformation update-stack --stack-name "$ai_wizard_role_stack" --template-body file://$ai_wizard_role_template --parameters ParameterKey=TrustedAccount,ParameterValue="$aws_account_id" --capabilities CAPABILITY_NAMED_IAM --region $aws_region
    else
        echo "The AI Wizard Deployment Role stack is up to date."
    fi
else
    echo "Creating stack: $ai_wizard_role_stack"
    aws cloudformation create-stack --stack-name "$ai_wizard_role_stack" --template-body file://$ai_wizard_role_template --parameters ParameterKey=TrustedAccount,ParameterValue="$aws_account_id" --capabilities CAPABILITY_NAMED_IAM --region $aws_region
fi

# Validate template
echo "Validating template for AI Wizard ECR ..."
aws cloudformation validate-template --template-body file://$ai_wizard_ecr_template --no-cli-pager
if [ $? -ne 0 ]; then
    echo "CloudFormation template validation failed. Aborting script."
    exit 1
fi

# Check if the AI Wizard ECR stack exists
if aws cloudformation describe-stacks --stack-name "$ai_wizard_ecr_stack" >/dev/null 2>&1; then
    # Get the deployed template
    deployed_ai_wizard_ecr_template=$(aws cloudformation get-template --stack-name $ai_wizard_ecr_stack --query 'TemplateBody' --output text)

    # Compare deployed with local template for changes
    if ! diff <(echo "$deployed_ai_wizard_ecr_template") "$ai_wizard_ecr_template" > /dev/null; then
        echo "Updating stack: $ai_wizard_ecr_stack"
        aws cloudformation update-stack --stack-name "$ai_wizard_ecr_stack" --template-body file://$ai_wizard_ecr_template --capabilities CAPABILITY_NAMED_IAM --region $aws_region
    else
        echo "The AI Wizard ECR stack is up to date."
    fi
else
    echo "Creating stack: $ai_wizard_ecr_stack"
    aws cloudformation create-stack --stack-name "$ai_wizard_ecr_stack" --template-body file://$ai_wizard_ecr_template --capabilities CAPABILITY_NAMED_IAM --region $aws_region
fi