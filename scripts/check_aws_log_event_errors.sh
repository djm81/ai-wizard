#!/bin/bash 

LOG_GROUP="/aws/lambda/ai-wizard-backend-dev-v2"

LAST_LOG_STREAM=$(aws logs describe-log-streams --log-group-name $LOG_GROUP --limit 1 --descending --output json)
LOG_STREAM_NAME=$(echo $LAST_LOG_STREAM | jq -r '.logStreams[0].logStreamName')

echo "Checking log stream: $LOG_STREAM_NAME for errors ..."

LOG_EVENTS=$(aws logs get-log-events --log-group-name $LOG_GROUP --log-stream-name $LOG_STREAM_NAME --output json | jq -c '.events')
LOG_EVENTS_COUNT=$(echo $LOG_EVENTS | jq -c '.[].timestamp' | wc -l | tr -d ' ')
echo "Retrieved $LOG_EVENTS_COUNT log events."

LOG_ERRORS=$(echo "$LOG_EVENTS" | jq -c '.[] | select(.message | contains("[ERROR]"))')
LOG_ERRORS_COUNT=$(echo "$LOG_ERRORS" | wc -l | tr -d ' ')

if [ -z "$LOG_ERRORS" -o "$LOG_ERRORS_COUNT" -eq 0 ]; then
    echo "No errors found"
    exit 0
fi

echo "Found $LOG_ERRORS_COUNT error events in selected log stream:"
echo "------------------------------------------------------------"
echo "$LOG_ERRORS" | jq -c '.message' | while IFS= read -r ERROR; do
    #echo "----------------------------------------"
    if [[ "$ERROR" == *"[ERROR]"* ]]; then
        # Print the first line in red
        echo -e "\033[31m$ERROR\033[0m" | sed 's/^"\(.*\)"$/\1/' | sed 's/\\t/\t/g; s/\\n/\n/g'
        # Set a flag to indicate that the next lines should be printed normally
        PRINT_NORMAL=1
    elif [[ -n "$PRINT_NORMAL" ]]; then
        # Print subsequent lines normally
        echo "$ERROR" | sed 's/^"\(.*\)"$/\1/' | sed 's/\\t/\t/g; s/\\n/\n/g'
    fi
    # Reset the flag if the line does not contain [ERROR]
    if [[ "$ERROR" != *"[ERROR]"* ]]; then
        unset PRINT_NORMAL
    fi
    echo "----------------------------------------"
done

echo "Summary: Found $LOG_ERRORS_COUNT error events in selected log stream."

exit 1