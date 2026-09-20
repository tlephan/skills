# Measuring Token Efficiency

Use this guide when evaluating the skill or reporting savings. The goal is lower usage per correctly completed task, including instruction overhead and recovery from mistakes.

## Comparison procedure

1. Choose representative tasks with observable acceptance criteria: a localized bug fix, a change spanning callers and tests, and a diagnosis involving a long failure log. Include a small task where skill overhead may outweigh savings.
2. Compare three conditions: no efficiency instruction, a simple "answer concisely" instruction, and this skill. Keep task prompts, repository snapshots, model, settings, tools, permissions, and acceptance criteria the same.
3. Start each run in a fresh conversation and isolated working copy. Record the skill revision and effective instructions. Avoid loading this guide into the tested agent unless evaluating measurement work itself.
4. Repeat each condition when feasible and vary run order. Record cache conditions; do not compare a warm-cache run with a cold-cache run as though they were equivalent.
5. Evaluate the resulting behavior and artifacts against the same acceptance criteria. Include failed attempts, follow-up corrections, and retries in each task's usage. Report incomplete tasks separately rather than counting them as cheap successes.

Run only tasks and tools authorized for the evaluation. A benchmark does not itself authorize paid workloads, external mutations, or deployment.

## Record

| Field | What to capture |
|-------|-----------------|
| Setup | Task, repository revision, skill revision, agent/model version, settings, condition, run ID |
| Input usage | Provider-reported input tokens, including skill and tool-result overhead; cache categories where available |
| Output usage | Provider-reported output tokens; reasoning usage separately where exposed |
| Other usage | Tool calls, retries, corrections, elapsed time, separately billed tools |
| Outcome | Acceptance criteria passed, required checks completed, regressions or missing information |
| Cost | Reported charge or estimate using dated rates and documented billing categories |

Use the provider's definitions: cached tokens or reasoning tokens may already be included in another reported total. Avoid double-counting. Missing telemetry is unknown, not zero. Character counts, word counts, and counts from a different tokenizer are only proxies and must be labeled as such.

## Interpret

- For a nonzero baseline, compute relative reduction as `(baseline - candidate) / baseline × 100%`, separately for comparable usage categories and cost. Negative results mean an increase.
- Compare paired runs and report sample size, variation, completion rate, and absolute usage alongside percentages. Do not select only the best run.
- To summarize cost per successful completion, divide total measured cost across all attempts by successful completions; also report failures. The ratio is undefined when none succeed.
- Shorter final replies alone do not establish lower total usage. More searches, missed context, or extra correction turns can erase the savings.
- Claim monetary savings only with reported charges or documented rates for the relevant billing model. Token reductions do not automatically reduce subscription fees or request-based charges.
- Treat any measured gain as specific to the tested workload, agent, model, and settings. Do not promise a universal percentage or unchanged quality from a small sample.

## Report template

```text
Tasks and acceptance criteria:
Agent/model/settings and revisions:
Conditions, repetitions, and cache treatment:
Completion results and regressions:
Input/output usage, including retries and instruction overhead:
Cost source or estimation method, if available:
Paired differences and variation:
Missing telemetry and limitations:
```
