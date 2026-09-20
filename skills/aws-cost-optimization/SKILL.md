---
name: aws-cost-optimization
description: Review AWS infrastructure costs in CDK, CloudFormation, and Terraform code and produce prioritized recommendations with evidence, savings assumptions, and trade-offs.
---

# AWS Cost Optimization

Guide for reviewing and optimizing AWS infrastructure costs defined in IaC (CDK, CloudFormation, Terraform).

## Prerequisites

- Local directory with IaC code checked out (CDK stacks, CloudFormation templates, Terraform configs).

## Limitations & Caveats

- Use IaC as configuration evidence; use billing exports or usage metrics when supplied or available through authorized tools.
- Static analysis alone cannot establish that a resource is idle or oversized.
- Actual savings depend on real-world usage patterns
- Treat savings ranges in service references as illustrative, not workload estimates. Verify current regional pricing before quoting costs; if pricing or usage is unavailable, provide a formula and identify the missing inputs.
- Some optimizations require application changes (e.g., Spot instance interruption handling)
- Reserved Instances/Savings Plans require upfront commitment decisions
- Graviton migration may require application compatibility testing
- Multi-AZ and redundancy changes affect availability guarantees
- Never compromise production availability for cost savings
- Maintain compliance and security requirements
- Document all trade-offs in recommendations
- Preserve disaster recovery capabilities
- Consider data transfer costs between regions/AZs

## Cost Optimization Lifecycle

Cost optimization is continuous, not a one-time pass. Frame every review against this four-stage lifecycle:

1. **Measure & Monitor** — usage and cost tracking, reporting and alerts, cost allocation, cost/usage trends. *(See [Cost Management & Monitoring Tools](#cost-management--monitoring-tools).)*
2. **Identify** — unused resources, over-provisioned resources, self-managed workloads better served by managed services, accounts/tagging gaps, region and service selection.
3. **Optimize** — terminate unused resources, provision appropriately, leverage managed services, purchase/modify reservations, right-size, re-architect for cost.
4. **Govern** — tie to business goals and metrics, enforce tagging and cost attribution, resource consistency, governance policies, and automation so savings don't regress.

An IaC review primarily delivers **Identify** and **Optimize**. Always point recommendations back to **Measure** (validate with real data) and **Govern** (prevent drift).

## Cost Impact by Service

| Service | Typical Cost Driver | Optimization Potential |
|---------|--------------------|-----------------------|
| EC2/ASG | Instance type, count | High (right-size, Spot, Graviton, scheduling) |
| RDS/Aurora | Instance type, engine/license, Multi-AZ | High (right-size, engine choice, Serverless) |
| NAT Gateway | Per-gateway + data transfer | High (reduce count, VPC endpoints) |
| CloudWatch | Log retention, custom metrics | Workload-dependent (retention, ingestion, filters) |
| ElastiCache | Node type, count | Medium (right-size, Serverless) |
| ECS/Fargate | CPU/Memory, task count | Medium (Spot, Graviton, right-size) |
| Lambda | Memory, duration, invocations | Medium (right-size, ARM64, timeout) |
| ECR | Image storage, cross-region pulls | Medium (lifecycle policies, smaller images) |
| CloudFront | Data transfer, requests, invalidations | Medium (caching, CloudFront Functions) |
| DynamoDB | Capacity mode, RCU/WCU, storage | Medium (on-demand vs provisioned, DAX, TTL) |
| Load Balancers | Per-ALB + LCU | Medium (consolidate) |
| Data Transfer | Cross-AZ, internet egress, cross-region | Medium (VPC endpoints, same-region, architecture) |
| EBS | Volume type, size, snapshots | Low-Medium (gp3, lifecycle, snapshot archive) |
| S3 | Storage class, lifecycle | Low (tiering, lifecycle rules) |

## Optimization Strategies by Service

Per-service strategy tables (savings %, effort, use cases, and key notes) live in `references/services/`. **Load only the files for services actually present in the IaC under review** — don't read them all up front. Use the [Cost Impact by Service](#cost-impact-by-service) table above to prioritize which to open.

| Service | Strategy reference |
|---------|--------------------|
| EC2 / Auto Scaling | [references/services/ec2.md](references/services/ec2.md) |
| RDS / Aurora | [references/services/rds-aurora.md](references/services/rds-aurora.md) |
| EBS | [references/services/ebs.md](references/services/ebs.md) |
| DynamoDB | [references/services/dynamodb.md](references/services/dynamodb.md) |
| NAT Gateway | [references/services/nat-gateway.md](references/services/nat-gateway.md) |
| Lambda | [references/services/lambda.md](references/services/lambda.md) |
| ECS / Fargate | [references/services/ecs-fargate.md](references/services/ecs-fargate.md) |
| ECR | [references/services/ecr.md](references/services/ecr.md) |
| ElastiCache | [references/services/elasticache.md](references/services/elasticache.md) |
| CloudWatch | [references/services/cloudwatch.md](references/services/cloudwatch.md) |
| CloudFront | [references/services/cloudfront.md](references/services/cloudfront.md) |
| S3 | [references/services/s3.md](references/services/s3.md) |

## Environment-Based Optimization

- **Production:** preserve availability, recovery, security, and performance requirements. Evaluate commitments against measured baseline usage and Spot against interruption tolerance.
- **Staging:** establish whether production parity or failover testing is required before reducing capacity or redundancy.
- **Development:** consider scheduling and smaller resources when workload needs permit; confirm shared dependencies before proposing shutdowns.
- Choose log and backup retention from operational and compliance requirements, not environment labels alone. If the environment is unclear, state the assumption and make affected recommendations conditional.

## Optimization Workflow

### Phase 1: Discovery
1. Locate IaC files (CDK stacks, CloudFormation templates, Terraform configs)
2. Catalog all AWS resources by service type
3. Identify environment (prod/staging/dev)
4. Record resource identifiers and `file:line` evidence; trace variables, modules, and environment overrides where possible. Mark unresolved values rather than guessing.

### Phase 2: Analysis
1. Prioritize observed spend when available; otherwise identify likely cost drivers without assuming a fixed service ranking.
2. Flag candidates for right-sizing or cleanup and specify the usage evidence needed to confirm them.
3. Evaluate applicable service strategies; a missing feature alone is not a finding.
4. Check whether environment configurations match workload and availability requirements.

### Phase 3: Recommendations
1. Rank recommendations by estimated absolute savings, confidence, effort, and risk. Use qualitative priority when costs are unknown.
2. Separate observed configuration from workload assumptions and validation needs.
3. For numeric estimates, record baseline and proposed cost, region, currency, pricing date/source, usage assumptions, and discounts or commitments. State which resource or spend scope a percentage applies to.
4. Avoid adding overlapping savings from alternative or dependent recommendations; calculate combined savings against a consistent baseline.

### Phase 4: Reporting

By default, deliver a review report. If the user also requests implementation, apply only the authorized changes and validate them with the project’s IaC checks. A review request does not authorize deployment, resource deletion, or purchasing commitments.

Produce a **cost optimization recommendation report** using [references/report-template.md](references/report-template.md). Include prioritized recommendations, per-service findings with `file:line` references, implementation steps for the owning team, trade-offs/risks, and validation/monitoring guidance.

## Quick Reference: Instance Families

### Compute Optimized
| x86 | Graviton (ARM) | Use Case |
|-----|----------------|----------|
| C5 | C6g, C7g | CPU-intensive |
| M5 | M6g, M7g | General purpose |
| R5 | R6g, R7g | Memory-intensive |
| T3 | T4g | Burstable |

### Database Instances
| x86 | Graviton (ARM) | Savings |
|-----|----------------|---------|
| db.r5 | db.r6g, db.r7g | ~20% |
| db.m5 | db.m6g, db.m7g | ~20% |
| db.t3 | db.t4g | ~20% |

## Cost Management & Monitoring Tools

Recommendations from IaC analysis should be validated and tracked with AWS Cloud Financial Management (CFM) tooling. Point report readers to these:

| Tool | Use |
|------|-----|
| **Cost Explorer** | Visualize/analyze cost & usage; identify drivers; forecast |
| **Budgets** | Custom cost/usage budgets with threshold alerts to prevent overspend |
| **Cost & Usage Report (CUR)** | Hourly-granular cost data for deep dives |
| **Trusted Advisor (Cost)** | Recommendations for underutilized resources |
| **Cost Optimization Hub** | Consolidated, quantified savings opportunities |
| **AWS Pricing Calculator** | Model/simulate cost of a proposed configuration |

## Good Practices

- **Understand each service's pricing model** — different services bill on different dimensions (instance-hours, requests, GB stored, data transfer, capacity units).
- **Use the Pricing Calculator** to estimate and simulate the impact of a config change before committing.
- **Reduce licensing burden** — favor open-source/Aurora engines over license-included (Oracle/SQL Server/Db2) where feasible.
- **Evaluate architectural changes** against total cost, including migration effort, operations, and data transfer; do not assume managed services or additional regions are cheaper.
- **Tag and attribute costs** so savings are measurable and regressions are visible (Govern stage).
- **Think out-of-the-box** — the cheapest option is often architectural, not a config tweak.

## References

- [Per-Service Optimization Strategies](references/services/) — strategy tables per AWS service (load on demand; see [Optimization Strategies by Service](#optimization-strategies-by-service))
- [Report Template](references/report-template.md) — structure for the recommendation report
- [AWS Well-Architected Cost Optimization Pillar](https://docs.aws.amazon.com/wellarchitected/latest/cost-optimization-pillar/welcome.html)
- [AWS Cloud Financial Management](https://aws.amazon.com/aws-cost-management/)
- [AWS Cost Optimization Hub](https://aws.amazon.com/aws-cost-management/cost-optimization/)
- [Graviton Migration Guide](https://github.com/aws/aws-graviton-getting-started)
- [ECR Lifecycle Policies](https://docs.aws.amazon.com/AmazonECR/latest/userguide/LifecyclePolicies.html)
