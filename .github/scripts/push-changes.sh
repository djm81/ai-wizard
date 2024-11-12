#!/bin/bash

# Navigate to the root of the repository
cd ../../

if [ ! -f ".github/scripts/.uncommitted_changes" ]; then
  echo "No .github/scripts/.uncommitted_changes file found!"
  exit 1
fi

changes=$(cat ".github/scripts/.uncommitted_changes")
echo "Change log from .github/scripts/.uncommitted_changes:"
echo "$changes"

changed_files=$(git diff --name-only)
echo "Changed files: $changed_files"

if [[ -z $changed_files ]]; then
  echo "No changes detected by git!"
  exit 1
fi

echo "Adding changes to git..."
git add .
echo "Committing changes..."
git commit -m "$changes"
echo "Pushing changes to remote repository..."
git push

echo "Removing uncommitted changes file..."
rm .github/scripts/.uncommitted_changes
