#!/bin/bash

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "GitHub CLI (gh) is not installed. Please install it first."
    exit 1
fi

# Check authentication status
echo "Checking GitHub authentication status..."
if ! gh auth status &> /dev/null; then
    echo "Not authenticated with GitHub. Please run 'gh auth login' first."
    exit 1
fi

# Get and display user info
echo -e "\nGitHub User Information:"
echo "------------------------"
USER_INFO=$(gh api user)
LOGIN=$(echo "$USER_INFO" | jq -r '.login')
NAME=$(echo "$USER_INFO" | jq -r '.name')
EMAIL=$(echo "$USER_INFO" | jq -r '.email')

echo "Username: $LOGIN"
echo "Name: $NAME"
echo "Email: $EMAIL"

# Check if user has access to the repository
REPO="$LOGIN/ai-wizard"  # Replace with your repo
echo -e "\nChecking repository access..."
if gh repo view "$REPO" &> /dev/null; then
    echo "✓ Has access to $REPO"
    
    # Check workflow permissions
    echo -e "\nWorkflow Permissions:"
    gh api "repos/$REPO/actions/permissions" | jq -r '.enabled'
else
    echo "✗ No access to $REPO"
fi