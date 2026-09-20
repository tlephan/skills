# CloudWatch — Optimization Strategies

One of the most expensive AWS services — driven by detailed monitoring, custom metrics, and long log retention.

| Strategy | Savings | Effort | Use Case |
|----------|---------|--------|----------|
| Set log retention | Variable | Low | All log groups (default = never expire) |
| Shorter retention (non-prod) | Variable | Low | Dev: 3-7 days |
| Subscription filters before storage | Variable | Low | Exclude irrelevant logs |
| Send non-critical logs to S3 | Variable | Low | Cheaper than CloudWatch Logs storage |
| Delete unused custom metrics | Variable | Low | Audit regularly |
| Reduce metric frequency | Variable | Low | 5-min instead of 1-min where precision isn't needed |
| Composite alarms | Variable | Low | One alarm over many metrics vs many alarms |
| Consolidate dashboards | Variable | Low | Free tier: 3 dashboards × up to 50 metrics |

## Pricing

- [CloudWatch Pricing](https://aws.amazon.com/cloudwatch/pricing/)
