#!/bin/bash

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
echo "Committing changes..."
git commit -m "$changes"
echo "Pushing changes to remote repository..."
git push

echo "Resetting uncommitted changes file..."
echo "" > .uncommitted_changes
