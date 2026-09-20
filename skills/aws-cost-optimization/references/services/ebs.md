# EBS — Optimization Strategies

| Strategy | Savings | Effort | Use Case |
|----------|---------|--------|----------|
| gp3 over gp2 | ~20% | Low | General-purpose volumes (better baseline) |
| st1/sc1 for throughput/cold | Variable | Low | Throughput-intensive or infrequent access |
| Delete orphaned volumes | 100% | Low | Unattached volumes left after termination |
| Snapshot lifecycle (DLM) | Variable | Low | Automate snapshots, delete obsolete ones |
| Snapshot Archive | up to ~75% | Low | Infrequently accessed snapshots |

## Pricing

- [EBS Pricing](https://aws.amazon.com/ebs/pricing/)
