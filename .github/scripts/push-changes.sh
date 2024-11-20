#!/bin/bash

# Parse command line arguments
SKIP_PRECOMMIT=false
while [[ $# -gt 0 ]]; do
  case $1 in
    --skip-precommit-checks)
      SKIP_PRECOMMIT=true
      shift # Remove argument from processing
      ;;
    *)
      echo "Unknown parameter: $1"
      echo "Usage: $0 [--skip-precommit-checks]"
      exit 1
      ;;
  esac
done

if [ ! -f "./.uncommitted_changes" ]; then
  echo "No .uncommitted_changes file found in project root!"
  exit 1
fi

changes=$(cat ".uncommitted_changes")
echo "Change log from .uncommitted_changes:"
echo "$changes"

untracked_files=$(git ls-files --others --exclude-standard)
echo "Untracked files: $untracked_files"

changed_files=$(git diff --name-only)
echo "Changed files: $changed_files"

if [[ -z $changed_files && -z $untracked_files ]]; then
  echo "No changes detected by git!"
  exit 1
fi

echo "Adding changes to git..."
git add .

# Run pre-commit checks if not skipped
if [ "$SKIP_PRECOMMIT" = false ]; then
  echo "Running pre-commit checks..."
  if ! pre-commit run --all-files; then
    echo "Pre-commit checks failed! Fix the issues or use --skip-precommit-checks to bypass."
    exit 1
  fi
fi

echo "Committing changes..."
git commit -m "$changes" -n
echo "Pushing changes to remote repository..."
git push

echo "Resetting uncommitted changes file..."
echo "" > .uncommitted_changes

echo "Done!"
