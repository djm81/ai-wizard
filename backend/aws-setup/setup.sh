#!/bin/bash

# Function to display help
function show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -a, --aws_account_id   AWS Account ID for the deployment"
    echo "  -z, --route53_zone_id  Route53 Hosted Zone ID for the domain"
    echo "  -r, --aws_region       AWS Region (e.g., eu-west-1)"
    echo "  -h, --help             Show this help message and exit"
}

# Parse command line arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        -a|--aws_account_id) aws_account_id="$2"; shift ;;
        -r|--aws_region) aws_region="$2"; shift ;;
        -z|--route53_zone_id) route53_zone_id="$2"; shift ;;
        -h|--help) show_help; exit 0 ;;
        *) echo "Unknown parameter passed: $1"; show_help; exit 1 ;;
    esac
    shift
done

# Prompt for AWS account ID if not provided
if [ -z "$aws_account_id" ]; then
    read -p "Enter your AWS Account ID: " aws_account_id
fi

# Prompt for AWS Region if not provided
if [ -z "$aws_region" ]; then
    read -p "Enter your AWS Region (e.g., eu-west-1): " aws_region
fi

# Prompt for Route53 Zone ID if not provided
if [ -z "$route53_zone_id" ]; then
    read -p "Enter your Route53 Hosted Zone ID: " route53_zone_id
fi

# Define stack names
ai_wizard_role_stack="AIWizardDeploymentRoleStack"
ai_wizard_role_template="./cf-ai-wizard-deployment-role.yaml"

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
        aws cloudformation update-stack --stack-name "$ai_wizard_role_stack" --template-body file://$ai_wizard_role_template --parameters ParameterKey=TrustedAccount,ParameterValue="$aws_account_id" ParameterKey=Route53ZoneId,ParameterValue="$route53_zone_id" ParameterKey=S3BucketRegion,ParameterValue="$aws_region" --capabilities CAPABILITY_NAMED_IAM --region $aws_region
    else
        echo "The AI Wizard Deployment Role stack is up to date."
    fi
else
    echo "Creating stack: $ai_wizard_role_stack"
    aws cloudformation create-stack --stack-name "$ai_wizard_role_stack" --template-body file://$ai_wizard_role_template --parameters ParameterKey=TrustedAccount,ParameterValue="$aws_account_id" ParameterKey=Route53ZoneId,ParameterValue="$route53_zone_id" ParameterKey=S3BucketRegion,ParameterValue="$aws_region" --capabilities CAPABILITY_NAMED_IAM --region $aws_region
fi
