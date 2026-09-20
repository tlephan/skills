# Lambda — Optimization Strategies

| Strategy | Savings | Effort | Use Case |
|----------|---------|--------|----------|
| ARM64 architecture | ~17-34% | Low | All Lambda (test compatibility) |
| Right-size memory | Variable | Medium | Profile first; cost scales with memory |
| Set appropriate timeout | Variable | Low | Avoid paying for idle time (default 15 min) |
| Remove Provisioned Concurrency | 100% of PC cost | Low | Non-latency-critical |
| Move intensive compute off Lambda | Variable | Medium | Long/CPU-heavy jobs → EC2 Spot/On-Demand |
| CloudFront cache in front of API Gateway | Variable | Low | Cacheable, infrequently changing responses |
| Batch SQS-triggered invocations | Variable | Low | Raise `BatchSize` to process more per invocation |

- Compare architecture and memory options using measured duration and current pricing; distinguish unit-price savings from workload price-performance.

## Pricing

- [Lambda Pricing](https://aws.amazon.com/lambda/pricing/)
