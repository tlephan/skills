# NAT Gateway — Optimization Strategies (Hidden Cost Driver)

| Strategy | Savings | Effort | Use Case |
|----------|---------|--------|----------|
| Single NAT for non-prod | ~$64/mo per removed | Low | Dev/staging |
| S3/DynamoDB Gateway Endpoints | 100% on that traffic | Low | All environments (FREE) |
| Interface Endpoints | Variable | Medium | Heavy AWS API usage |
| NAT Instance (t4g.nano) | ~90% | Medium | Low-traffic dev/test |

## Pricing

- [NAT Gateway / VPC Pricing](https://aws.amazon.com/vpc/pricing/)
