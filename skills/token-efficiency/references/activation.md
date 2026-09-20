# Persistent Activation

Install the skill, then add one persistent instruction per host and scope.
Templates are optional and are not activated by plugin installation. Preserve
existing instructions when merging. Persistent loading does not guarantee compliance.

## Setup

| Host | Project setup | Personal default |
|------|---------------|------------------|
| Claude Code | Merge [this snippet](../assets/claude-instructions.md) into root `CLAUDE.md`. | Use `~/.claude/CLAUDE.md` with the skill installed at user scope. |
| Cursor | Copy [this rule](../assets/token-efficiency.mdc) to `.cursor/rules/token-efficiency.mdc`; keep `alwaysApply: true` and enable it in Customize. | Paste the rule body without frontmatter into User Rules. |
| AGENTS.md-compatible hosts | Merge [this snippet](../assets/agents-instructions.md) into root `AGENTS.md`. | Follow the host's documented global instruction setup. |

Ensure the host can discover the skill. Without a skill catalog, replace the
catalog lookup with its actual readable `SKILL.md` path; resolve relative paths
from the project root. See [Claude Code memory](https://code.claude.com/docs/en/memory)
and [Cursor rules](https://cursor.com/docs/rules) for host details.

## Verify

1. Start a fresh session and request a coding task without naming the skill.
2. Check the loaded-rule display and invocation or file-read trace: the skill body
   should load before substantive work. Without a trace, activation is unverified.
3. Confirm required checks still run. Repeat after context compaction when relevant.

If activation fails, check instruction scope, enabled status, skill name, and path.
Remove the snippet or rule to disable the default; a request to stop applying the
skill should be honored for the current task.

Load [the measurement guide](measurement.md) only when evaluating savings.
