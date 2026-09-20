# CloudFront — Optimization Strategies

| Strategy | Savings | Effort | Use Case |
|----------|---------|--------|----------|
| Cache effectively + compression | Variable | Low | Tune cache headers/TTL to cut origin requests |
| CloudFront Functions over Lambda@Edge | ~5/6 cheaper | Low | Lightweight request/response logic |
| Geo restriction | Variable | Low | Block delivery to regions you don't serve |
| Stay within invalidation free tier | up to 100% on invalidations | Low | First 1,000 paths/month free; bundle assets |

- Estimate each affected billing dimension separately using traffic measurements and current pricing; do not apply a blanket savings percentage to the distribution.

## Pricing

- [CloudFront Pricing](https://aws.amazon.com/cloudfront/pricing/)
