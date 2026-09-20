# RDS / Aurora — Optimization Strategies

| Strategy | Savings | Effort | Use Case |
|----------|---------|--------|----------|
| Reduce licensing burden | up to ~60% | High | Migrate Oracle/SQL Server/Db2 → open-source/Aurora |
| Graviton instances (R6g, R7g, T4g) | ~20% | Low | All RDS workloads |
| Aurora Serverless v2 | Variable | Medium | Unpredictable workloads |
| Single-AZ for non-prod | ~50% | Low | Dev/staging environments |
| Auto-scale read replicas | Variable | Medium | Adjust read capacity to demand |
| Remove read replicas (non-prod) | ~50% | Low | Dev/staging environments |
| Aurora I/O-Optimized | Variable | Low | High I/O workloads |
| Reserved Instances | up to ~60% | Low | Predictable usage (1-3 yr) |
| Right-sizing | 20-50% | Medium | Oversized instances |
| Snapshot retention cleanup | Variable | Low | Delete old snapshots; optimize retention |

- **Engine/licensing:** compare equivalent capacity and availability, including license, storage, I/O, backup, and migration costs. Do not infer savings from unlike instance or deployment configurations.

## Pricing

- [RDS Pricing](https://aws.amazon.com/rds/pricing/)
- [RDS / Aurora Pricing](https://aws.amazon.com/rds/aurora/pricing/)
