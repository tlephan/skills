# AWS Cost Optimization Report — {Project / Stack Name}

**Date:** {YYYY-MM-DD}
**Author:** {name}
**Scope:** {IaC repos / stacks / environments reviewed}
**IaC type:** {CDK | CloudFormation | Terraform}

---

## 1. Executive Summary

- **Resources reviewed:** {count by service}
- **Total recommendations:** {n} (High: {n}, Medium: {n}, Low: {n})
- **Estimated savings potential:** {amount/range and spend scope, or "Not quantified — usage/pricing inputs required"}
- **Top opportunities (up to 3):**
  1. {recommendation — est. savings}
  2. {recommendation — est. savings}
  3. {recommendation — est. savings}

## 2. Current Cost Picture

{What the IaC reveals about the cost drivers: instance families/sizes, Multi-AZ, NAT gateways, log retention, storage classes, capacity modes, etc. Note environment (prod/staging/dev) and any config that looks mismatched to its environment.}

## 3. Recommendations (Prioritized)

| # | Service | Recommendation | Impact | Effort | Est. Savings | Environment | Risk / Trade-off |
|---|---------|----------------|--------|--------|--------------|-------------|------------------|
| 1 | {service} | {specific change} | {High/Medium/Low} | {Low/Medium/High} | {amount/range or unquantified} | {environment} | {risk and required validation} |

Impact reflects absolute savings and scope; state the basis for priority when costs are unknown. Do not sum overlapping alternatives.

## 4. Findings by Service

### {Service, e.g. EC2 / Auto Scaling}
- **Finding:** {what was observed in the IaC — file:line}
- **Recommendation:** {specific change}
- **Rationale:** {why; distinguish observed evidence from assumptions}
- **Savings basis:** {baseline → proposed cost; formula, usage inputs, region, currency, pricing date/source, discounts, and affected spend scope}
- **Confidence / missing evidence:** {what is known and what needs measurement}
- **Trade-offs:** {availability / compatibility / commitment implications}

{Repeat per service: EC2, Lambda, ECS/Fargate, ECR, RDS/Aurora, DynamoDB, S3, EBS, ElastiCache, NAT Gateway, CloudFront, CloudWatch, Load Balancers, Data Transfer.}

## 5. Implementation Steps

> Recommendations only — do **not** apply changes as part of the review. Provide the steps so the owning team can implement and test.

1. **{Recommendation title}**
   - Files to change: `{path:line}`
   - Change: {before → after, e.g. `instanceType: m5.large` → `m6g.large`}
   - Validation: {how to verify — load test, compatibility test, Cost Explorer comparison}
   - Rollback: {how to revert}

## 6. Trade-offs, Risks & Constraints

- {Availability impacts (Multi-AZ, replicas)}
- {Application changes required (Spot interruption handling, ARM rebuild)}
- {Commitment decisions (RIs / Savings Plans) and who must approve}
- {Compliance / security / DR requirements that must be preserved}

## 7. Validation & Monitoring

State whether recommendations use static IaC, measured usage, or billing data. Validate estimates and track realized savings with:
- **Cost Explorer** — confirm current cost drivers and forecast.
- **AWS Pricing Calculator** — model the proposed configuration.
- **Cost Optimization Hub / Trusted Advisor** — cross-check right-sizing and idle-resource findings.
- **Budgets** — set alerts so regressions are caught early.

## 8. Assumptions & Caveats

- {Pricing region and date assumed}
- {Workload patterns assumed (peak times, batch jobs, dev hours)}
- {Anything that could not be determined from IaC alone}
