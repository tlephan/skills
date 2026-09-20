# Skills
Awsome agent skills with curated skills, scripts, templates. etc. for AI coding agents.

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

## License

[MIT](LICENSE) © 2026 tlephan.

## External awsome skills

- Anthropic: [Anthropic Skills](https://github.com/anthropics/skills)
- AWS: [Agent Toolkit for AWS](https://github.com/aws/agent-toolkit-for-aws/tree/main)
- Draw.io: [drawio-skill — From Text to Professional Diagrams](https://github.com/Agents365-ai/drawio-skill)
