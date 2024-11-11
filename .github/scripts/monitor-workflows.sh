#!/bin/bash

# Repository details
USER=$(gh api user | jq -r '.login')
REPO="$USER/ai-wizard"
BRANCH=$(git branch --show-current)

# Monitor workflows
echo "Monitoring workflows for branch: $BRANCH"

# List and watch recent workflow runs
gh run list --repo $REPO --branch $BRANCH --limit 5

# Watch the latest run
LATEST_RUN_ID=$(gh run list --repo $REPO --branch $BRANCH --limit 1 --json databaseId --jq '.[0].databaseId')
if [ ! -z "$LATEST_RUN_ID" ]; then
    echo "Watching run ID: $LATEST_RUN_ID"
    gh run watch $LATEST_RUN_ID --repo $REPO

    # Check status
    STATUS=$(gh run view $LATEST_RUN_ID --repo $REPO --json conclusion --jq '.conclusion')
    if [ "$STATUS" != "success" ]; then
        echo "Workflow failed. Fetching logs..."
        gh run view $LATEST_RUN_ID --repo $REPO --log
    fi
fi