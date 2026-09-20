# DynamoDB — Optimization Strategies

| Strategy | Savings | Effort | Use Case |
|----------|---------|--------|----------|
| On-demand vs provisioned | Variable | Low | On-demand for spiky; provisioned+autoscale for steady |
| TTL on expiring items | Variable | Low | Auto-delete stale items, cut storage |
| DAX caching | Variable | Medium | Read-heavy hot data (reduces RCUs) |
| Truncate via drop/recreate | Variable | Low | Cheaper/faster than mass delete (adds ops overhead) |

## Pricing

- [DynamoDB Pricing](https://aws.amazon.com/dynamodb/pricing/)
