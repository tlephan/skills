# EC2 / Auto Scaling — Optimization Strategies

| Strategy | Savings | Effort | Use Case |
|----------|---------|--------|----------|
| Graviton (ARM) instances | ~20-40% | Low | All workloads (test compatibility) |
| Spot instances | up to ~90% | Medium | Fault-tolerant, stateless, batch, dev/test |
| Right-sizing | 20-50% | Medium | Oversized instances (target 50-70% util) |
| Instance scheduling | ~65% (nights/weekends) | Low | Lower environments (off outside office hours) |
| Burstable (T4g) | ~40% | Low | Variable/low CPU workloads |
| Reserved Instances | ~30-72% | Low | Steady-state production |
| Savings Plans | ~30-66% | Low | Flexible commitment |
| Region selection | Variable | Medium | Pricing varies by region |

- **Right-sizing target:** aim for **50-70% utilization** across CPU, memory, and network. Sustained <40% = downsize; >80% = leave alone (availability risk).
- **Scheduling:** turn instances off during non-peak / outside office hours in lower environments (Auto Scaling scheduled actions or instance scheduler).
- **Purchasing options:** compare current regional prices, term, payment option, flexibility, and existing commitment coverage against measured baseline usage.

## Pricing

- [EC2 Pricing](https://aws.amazon.com/ec2/pricing/)
- [EC2 Instance Types](https://aws.amazon.com/ec2/instance-types/)
- [Spot Instance Pricing](https://aws.amazon.com/ec2/spot/pricing/)
- [Graviton Processors](https://aws.amazon.com/ec2/graviton/)
- [Savings Plans](https://aws.amazon.com/savingsplans/pricing/)
