# Agent compatibility

Unslop is distributed as a provider-neutral Agent Skill: a directory containing SKILL.md, scripts, and references. The workflow does not depend on a specific model API. The host agent supplies file editing, terminal, browser, and image-generation capabilities.

## Supported project locations

| Agent / integration | Skill directory | Integration |
| --- | --- | --- |
| Agent Skills-compatible agents | .agents/skills/unslop | Shared open skill layout |
| OpenAI Codex | .agents/skills/unslop | Native skill discovery |
| Claude Code | .claude/skills/unslop | Native skill discovery; marketplace plugin remains available upstream |
| Gemini CLI | .gemini/skills/unslop | Native skill discovery |
| Google Antigravity | .agents/skills/unslop | Native skill discovery |
| Cursor | .cursor/skills/unslop | Native skill discovery |
| Cline | .agents/skills/unslop | Shared skills plus .clinerules/unslop.md activation bridge |
| OpenCode | .opencode/skills/unslop | Native skill discovery |
| Roo Code | .roo/skills/unslop | Native skill discovery |
| GitHub Copilot | .github/skills/unslop | Native agent skill discovery |
| Continue | .agents/skills/unslop | Shared skill plus .continue/rules/unslop.md activation bridge |
| Windsurf | .agents/skills/unslop | Shared skill plus .windsurf/rules/unslop.md activation bridge |

The installer supports project and user-global scopes for agents with documented global skill locations. Continue and Windsurf are project-only in this installer because the generated rule bridges are project rules.

## Install

Install for every supported target:

~~~bash
node scripts/install.mjs --agent all
~~~

Install only selected agents:

~~~bash
node scripts/install.mjs --agent claude,cursor,codex
~~~

Install into the current user's home directory:

~~~bash
node scripts/install.mjs --agent all --scope global
~~~

Preview the changes:

~~~bash
node scripts/install.mjs --agent all --dry-run
~~~

Update an existing installed copy:

~~~bash
node scripts/install.mjs --agent all --force
~~~

The installer never overwrites an existing skill or rule file unless --force is supplied. When forced, it updates files from this distribution and keeps unrelated files in the destination directory.

## What "any agent" means

An agent that supports the Agent Skills layout can discover the same SKILL.md without a provider-specific integration. Agents that do not implement skill discovery can still use the workflow when their host is instructed to read .agents/skills/unslop/SKILL.md, but activation and tool access depend on that host. No skill can make a tool available when the agent runtime does not provide it.

The skill adapts to available capabilities:
- If a browser or screenshot tool is available, use it to inspect the rendered UI; otherwise inspect the source and state that visual verification was unavailable.
- If an image-generation tool is available, use it only when the design calls for a real visual and after obtaining approval for paid generation.
- If the environment has no image-generation tool, continue with existing assets, CSS, SVG, or HTML.
- Use the host's file and terminal tools; do not assume a branded provider API, MCP server, or command exists.

## References

- [Agent Skills integration guide](https://github.com/microsoft/skills/blob/main/.github/docs/skills.md)
- [Codex skill locations](https://learn.chatgpt.com/docs/build-skills)
- [Claude Code skills](https://docs.anthropic.com/en/docs/claude-code/skills)
- [Gemini CLI Agent Skills](https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/using-agent-skills.md)
- [Antigravity skills](https://antigravity.google/docs/skills)
- [Cursor Agent Skills](https://cursor.com/docs/skills)
- [OpenCode skills](https://opencode.ai/docs/skills/)
- [Roo Code skills](https://roocodeinc.github.io/Roo-Code/features/skills/)
- [GitHub Copilot agent skills](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/add-skills)
- [Continue rules](https://docs.continue.dev/customize/rules)
