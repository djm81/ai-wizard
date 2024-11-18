# Logging

The application uses a dual logging strategy:

- **Local Development**: Logs are written to the `backend/logs` directory
- **AWS Lambda**: Logs are automatically sent to CloudWatch Logs

No additional configuration is needed - the environment is automatically detected and the appropriate logging strategy is used.

To view logs:
- Local: Check the `backend/logs` directory
- Lambda: Check CloudWatch Logs in the AWS Console

## Log Format
All logs include:
- Timestamp
- Log level
- Module name
- Message

In Lambda, logs are automatically formatted for CloudWatch with request IDs and other AWS-specific information.
