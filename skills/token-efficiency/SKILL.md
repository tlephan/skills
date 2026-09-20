---
name: token-efficiency
description: Apply token-efficient practices when investigating, implementing, reviewing, or testing code. Reduce unnecessary context, tool output, and response verbosity while preserving correctness and required checks. Does not optimize an application's LLM integration or provider billing configuration.
---

# Token Efficiency

Aim for lower total usage per correctly completed task. Apply these practices with the tools available; preserve the user's scope, required checks, and higher-priority instructions. Keep explanations clear and expand when the user requests detail.

## Read selectively

- Locate paths and symbols first, then read relevant definitions and surrounding code. Prefer available symbol navigation when it answers the question precisely; otherwise use scoped search, such as `rg`.
- Follow dependencies, callers, configuration, and tests when they affect the decision. Expand an inconclusive search instead of treating a limited result as proof of absence.
- Load supporting references only when needed. Avoid loading generated files, dependency trees, and unrelated documentation unless they are evidence for the task.
- Reuse findings already in context. Re-read when files change, results become stale, or essential details are missing.
- At handoff or compaction boundaries, preserve the objective, constraints, findings with file paths, changed files, verification results, and unresolved work in a concise summary. Resume from that state and verify stale facts instead of restarting discovery.

## Control tool output

- Request relevant fields, paths, ranges, or result limits at the source when supported. Summarizing a large result afterward does not undo its input cost.
- When source filtering is unavailable, filter or aggregate large logs, JSON, and datasets in the execution environment before returning them to the model. Include relevant records, counts, and evidence locations; distinguish samples from complete results and retain access to the full data.
- For long command output, retain a retrievable full log when possible and inspect the relevant portions. Preserve exit status, failure counts, exact errors, and enough context to diagnose them; expand truncated results before drawing conclusions.
- Group related independent lookups when useful. Parallelism can reduce latency but does not inherently reduce tokens.
- Tie follow-up investigation to an unresolved question or changed evidence. After a failed attempt, revise the hypothesis or method; retry unchanged only when there is evidence of a transient failure.
- Finish when the requested outcome and required checks are complete. Expand verification for changes, failures, or unresolved risks; brevity is never a reason to omit required checks.

## Communicate concisely

- Lead with the result or next meaningful action. Avoid repeated plans, echoed tool output, and narration that adds no information; retain required progress updates.
- Prefer plain language and short explanations. Do not invent abbreviations or compress wording until meaning becomes ambiguous.
- Prefer focused edits over whole-file rewrites when practical. Avoid unrelated changes and reproducing code already available to the user unless requested or needed to explain the result.
- Add code comments only when they clarify non-obvious intent or constraints. Use the fewest words and lines needed; avoid verbose explanations and comments that restate the code.
- Preserve exact code, commands, paths, identifiers, error strings, numbers, negations, uncertainty, and material risks. Keep code and shared artifacts readable.
- Report what changed, relevant validation, and remaining limitations without reproducing the diff unless requested.

## Measure before claiming savings

The skill itself consumes context. It cannot guarantee savings, control hidden reasoning, or configure model selection, caching, or billing through instructions alone. Do not change those settings without task authorization.

For benchmarking or savings claims, load [the measurement guide](references/measurement.md). Otherwise, leave it unloaded.

For installation or persistent activation setup only, read [the activation guide](references/activation.md). Do not load it during ordinary coding tasks.
