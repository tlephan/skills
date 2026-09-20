# ECR — Optimization Strategies

| Strategy | Savings | Effort | Use Case |
|----------|---------|--------|----------|
| Image lifecycle policies | Variable | Low | Auto-delete old/untagged images by age or tag |
| Smaller base images | Variable | Low | alpine/distroless; drop unused layers/files |
| Cache frequently pulled images | Variable | Low | Avoid repeated pulls on compute nodes |
| Pull from same region | 100% on that transfer | Low | Avoid cross-region data transfer cost |
