---
name: token-efficiency
description: Apply token-efficient practices when investigating, implementing, reviewing, or testing code. Reduce unnecessary context, tool output, and response verbosity while preserving correctness and required checks. Does not optimize an application's LLM integration or provider billing configuration.
---

# Token Efficiency

Aim for lower total usage per correctly completed task. Apply these practices with the tools available; preserve the user's scope, required checks, and higher-priority instructions. Keep explanations clear and expand when the user requests detail.

## Read selectively

- Locate relevant files and symbols before reading large files. Use scoped search, such as `rg` when available, then read enough surrounding code to understand behavior.
- Follow dependencies, callers, configuration, and tests when they affect the decision. Expand an inconclusive search instead of treating a limited result as proof of absence.
- Load supporting references only when needed. Avoid loading generated files, dependency trees, and unrelated documentation unless they are evidence for the task.
- Reuse findings already in context. Re-read when files change, results become stale, or essential details are missing.

## Control tool output

- Request relevant fields, paths, ranges, or result limits at the source when supported. Summarizing a large result afterward does not undo its input cost.
- For long command output, retain a retrievable full log when possible and inspect the relevant portions. Preserve exit status, failure counts, exact errors, and enough context to diagnose them; expand truncated results before drawing conclusions.
- Group related independent lookups when useful. Parallelism can reduce latency but does not inherently reduce tokens.
- Repeat a tool call or test when a change, failure, or unresolved question justifies it. Run all required checks; brevity is never a reason to omit verification.

## Communicate concisely

- Lead with the result or next meaningful action. Avoid repeated plans, echoed tool output, and narration that adds no information; retain required progress updates.
- Prefer plain language and short explanations. Do not invent abbreviations or compress wording until meaning becomes ambiguous.
- Preserve exact code, commands, paths, identifiers, error strings, numbers, negations, uncertainty, and material risks. Keep code and shared artifacts readable.
- Report what changed, relevant validation, and remaining limitations without reproducing the diff unless requested.

## Measure before claiming savings

The skill itself consumes context. It cannot guarantee savings, control hidden reasoning, or configure model selection, caching, or billing through instructions alone. Do not change those settings without task authorization.

For benchmarking or savings claims, load [the measurement guide](references/measurement.md). Otherwise, leave it unloaded.

For installation or persistent activation setup only, read [the activation guide](references/activation.md). Do not load it during ordinary coding tasks.
