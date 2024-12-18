import os
from datetime import datetime, timedelta

import boto3
import click
from elasticsearch import Elasticsearch


@click.command()
@click.option('--request-id', help='Specific request ID to trace')
@click.option('--timeframe', default='15m', help='Timeframe to analyze (e.g. 15m, 1h, 1d)')
def analyze_logs(request_id, timeframe):
    """Analyze logs across all services for a specific request or timeframe"""

    es = Elasticsearch([os.environ['ELASTICSEARCH_ENDPOINT']])

    if request_id:
        # Trace specific request
        query = {
            "query": {
                "match": {
                    "requestId": request_id
                }
            }
        }
    else:
        # Analyze timeframe
        time_unit = timeframe[-1]
        time_value = int(timeframe[:-1])

        from_time = datetime.now() - timedelta(
            minutes=time_value if time_unit == 'm' else 0,
            hours=time_value if time_unit == 'h' else 0,
            days=time_value if time_unit == 'd' else 0
        )

        query = {
            "query": {
                "range": {
                    "@timestamp": {
                        "gte": from_time.isoformat()
                    }
                }
            }
        }

    # Get logs from Elasticsearch
    results = es.search(index="logs", body=query)

    # Process and display results
    for hit in results['hits']['hits']:
        log = hit['_source']
        print(f"[{log['@timestamp']}] {log['message']}")

if __name__ == '__main__':
    analyze_logs()
