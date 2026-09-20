# Repository Context

This repository contains curated skills for AI coding agents. It is distributed
as the `tlephan-skills` Claude Code plugin through `tlephan-marketplace` and is
licensed under MIT. The current skill reviews AWS infrastructure costs in CDK,
CloudFormation, and Terraform code.

## Layout

- `skills/<skill-name>/SKILL.md`: skill entry point and instructions.
- `skills/<skill-name>/references/`: supporting guides and templates.
- `.claude-plugin/plugin.json`: plugin metadata and release version.
- `.claude-plugin/marketplace.json`: marketplace catalog pointing to this repository.
- `README.md`: installation, usage, and development instructions.
- `LICENSE`: repository license.

## Editing Conventions

- Use lowercase, hyphen-separated skill directory names.
- Start each `SKILL.md` with YAML frontmatter containing `name` and `description`;
  keep license metadata consistent with the repository license.
- Keep skill instructions focused and actionable. Put detailed service guidance
  and reusable templates in `references/`, linked from the skill entry point.
- Keep supporting file paths relative and ensure they resolve within the plugin.
- Preserve the existing skill's evidence requirements, pricing caveats, and
  availability safeguards when editing AWS cost guidance.
- Update `README.md` when installation or usage changes. Bump the plugin version
  when preparing a release.

## Validation

This is primarily a Markdown and JSON repository with no application build step.
For plugin metadata changes, run from the repository root:

```sh
claude plugin validate .claude-plugin/plugin.json
claude plugin validate .claude-plugin/marketplace.json
```

For documentation and skill changes, check frontmatter, relative links, and
referenced files. Run `git diff --check` to catch whitespace errors.

To manually try the plugin, launch `claude --plugin-dir .` from the repository
root, then invoke `/tlephan-skills:aws-cost-optimization` in Claude Code.
