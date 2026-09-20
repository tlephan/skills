# ECS / Fargate — Optimization Strategies

| Strategy | Savings | Effort | Use Case |
|----------|---------|--------|----------|
| Fargate Spot | ~70% | Medium | Fault-tolerant workloads |
| EC2 launch type + Spot/RI | up to ~90% | Medium | Steady, predictable workloads |
| Graviton (ARM64) | ~20% | Low | All Fargate tasks / EKS pods |
| Right-size CPU/Memory | Variable | Medium | Over-provisioned tasks (target 50-70%) |
| Reduce task count (non-prod) | Linear | Low | Dev/staging |

- **Fargate vs EC2:** choose **Fargate** for variable/unpredictable workloads that scale frequently and where you want to avoid managing instances. Choose **ECS on EC2** for steady, predictable workloads where Reserved/Spot Instances and infrastructure control deliver more savings.
