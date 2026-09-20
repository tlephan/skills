# Skills
Awsome agent skills with curated skills, scripts, templates. etc. for AI coding agents.

## Available skills

| Skill | Purpose |
|-------|---------|
| [aws-cost-optimization](skills/aws-cost-optimization/SKILL.md) | Review AWS infrastructure costs with evidence, savings assumptions, and trade-offs. |
| [app-performance-optimization](skills/app-performance-optimization/SKILL.md) | Analyze web application performance and produce a prioritized tuning report across browser, network, backend, and data layers. |
| [token-efficiency](skills/token-efficiency/SKILL.md) | Reduce unnecessary context, tool output, and response verbosity while preserving correctness and required checks. |

### Web application performance review

Use `app-performance-optimization` with a repository, application URL, or existing
performance artifacts. It adapts to the application's stack and produces a report
with evidence, prioritized recommendations, trade-offs, and validation plans.
Repository-only reviews identify hypotheses and the measurements needed to verify
them. Analysis and reporting are the default; implementation can be requested too.

Example in Claude Code:

```text
/tlephan-skills:app-performance-optimization Analyze this web application and write a performance tuning report. Prioritize slow user journeys and distinguish measured bottlenecks from code-based hypotheses.
```

In Cursor, invoke `/app-performance-optimization` with the same request. Reports
default to `app-performance-report.md` unless a different location is requested
or established by the project. See the skill's
[research sources](skills/app-performance-optimization/references/sources.md)
for the primary documentation behind its diagnostic guidance.

## Local skill links

For local development, link `.claude/skills` and `.codex/skills` to the shared
`skills/` directory. On Windows, directory junctions can be used when symbolic
links require administrator privileges. Junctions are local to the checkout
and must be recreated if it moves.
Edit skills in `skills/` so both links expose the same files without copies.

## Claude Code plugin

This repository packages its `skills/` directory as the `tlephan-skills` plugin.
The setup follows the [Claude Code plugin reference](https://code.claude.com/docs/en/plugins-reference).

### Try locally

From the repository root, launch Claude Code with:

```sh
claude --plugin-dir .
```

Then invoke the included skill:

```text
/tlephan-skills:aws-cost-optimization
```

### Install from GitHub

After the plugin files are committed and pushed to GitHub, run these commands inside Claude Code:

```text
/plugin marketplace add tlephan/skills
/plugin install tlephan-skills@tlephan-marketplace
```

Restart Claude Code after installation to load the plugin.

### Development

Add new skills under `skills/<skill-name>/SKILL.md`; Claude Code discovers them automatically.
Bump the version in `.claude-plugin/plugin.json` when releasing updates.
Validate both manifests before publishing:

```sh
claude plugin validate .claude-plugin/plugin.json
claude plugin validate .claude-plugin/marketplace.json
```

## Cursor plugin

The `tlephan-skills` Cursor plugin uses the same `skills/` directory, with metadata
in `.cursor-plugin/`. See the [Cursor plugin reference](https://cursor.com/docs/reference/plugins).

### Try locally

From the repository root, copy the plugin into Cursor's local plugin directory:

```sh
mkdir -p ~/.cursor/plugins/local/tlephan-skills
cp -R .cursor-plugin skills README.md LICENSE ~/.cursor/plugins/local/tlephan-skills/
```

Run **Developer: Reload Window** in Cursor, then open **Customize** to confirm
the skill is available. Invoke it in chat with `/aws-cost-optimization`.
Local plugin imports must be enabled by your organization if managed by a team.
See [Cursor's local testing instructions](https://cursor.com/docs/plugins#test-plugins-locally).

### Distribution

The `.cursor-plugin/marketplace.json` catalog exposes the repository as a plugin
marketplace. After pushing these files, teams can add the repository as a team
marketplace. For a public Cursor Marketplace listing, submit the repository at
[Cursor Marketplace Publish](https://cursor.com/marketplace/publish); listing requires review.

### Development

Keep the shared plugin name, version, description, and license consistent between
the Claude Code and Cursor manifests when releasing updates. New skills under
`skills/` are discovered automatically by both plugins.

Check Cursor manifest JSON syntax locally:

```sh
python3 -m json.tool .cursor-plugin/plugin.json > /dev/null
python3 -m json.tool .cursor-plugin/marketplace.json > /dev/null
```

## External awsome skills

- Anthropic: [Anthropic Skills](https://github.com/anthropics/skills)
- AWS: [Agent Toolkit for AWS](https://github.com/aws/agent-toolkit-for-aws/tree/main)
- Draw.io: [drawio-skill — From Text to Professional Diagrams](https://github.com/Agents365-ai/drawio-skill)
- Caveman: [Caveman - why use many token when few do trick](https://github.com/juliusbrussee/caveman)
