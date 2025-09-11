#!/bin/bash

# Generate EA Assessment and save to output folder
# Usage: ./generate-assessment.sh <repo-url> <change-request> [branch]

REPO_URL=$1
CHANGE_REQUEST=$2
BRANCH=${3:-main}

if [ -z "$REPO_URL" ] || [ -z "$CHANGE_REQUEST" ]; then
    echo "Usage: $0 <repo-url> <change-request> [branch]"
    echo "Example: $0 https://github.com/user/repo.git 'Implement new feature' main"
    exit 1
fi

# Extract repo name from URL
REPO_NAME=$(echo $REPO_URL | sed 's/.*\///' | sed 's/\.git$//')
OUTPUT_DIR="/Users/jjayaraj/workspaces/studios/architectAgent/output/$REPO_NAME"

echo "Generating EA assessment for: $REPO_NAME"
echo "Change Request: $CHANGE_REQUEST"
echo "Branch: $BRANCH"

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Generate timestamp for filename
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Call the API and save to output folder
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d "{
    \"repoUrl\": \"$REPO_URL\",
    \"branch\": \"$BRANCH\",
    \"changeRequest\": \"$CHANGE_REQUEST\"
  }" 2>/dev/null | jq -r '.artifacts.sprint0Review' > "$OUTPUT_DIR/sprint0-assessment-$TIMESTAMP.md"

# Also create a symlink to latest
ln -sf "sprint0-assessment-$TIMESTAMP.md" "$OUTPUT_DIR/sprint0-assessment-latest.md"

echo "Assessment saved to: $OUTPUT_DIR/sprint0-assessment-$TIMESTAMP.md"
echo "Latest symlink: $OUTPUT_DIR/sprint0-assessment-latest.md"

# Check if file has content
FILE_SIZE=$(wc -c < "$OUTPUT_DIR/sprint0-assessment-$TIMESTAMP.md")
if [ $FILE_SIZE -lt 100 ]; then
    echo "Warning: Generated assessment seems empty or invalid. Checking error..."
    cat "$OUTPUT_DIR/sprint0-assessment-$TIMESTAMP.md"
else
    echo "Success! Assessment generated with $FILE_SIZE bytes"
fi