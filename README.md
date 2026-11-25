# unslop-4all

A portable, provider-neutral design skill that turns vibecoded, AI-looking UI into a designed interface with its own character. It audits the screen, derives a direction from the actual product, and improves the UI in deliberate passes instead of applying a generic template.

The original Unslop skill was created by Damir Sokolovsky ([@heydamir](https://x.com/heydamir)) as part of the [Unslopping series](https://x.com/heydamir/status/2115063463063998736). This repository preserves the original attribution and CC BY 4.0 license while adding multi-agent installation support.

![A vibecoded dashboard unslopping itself, frame by frame](skills/unslop/references/refs/story-dashboard-frames.webp)

## Works across agents

The core is a plain Agent Skill: one SKILL.md with bundled scripts and references. It is not coupled to Claude, OpenAI, Gemini, or a specific model provider.

Native skill locations are provided for Agent Skills-compatible environments, including:

- OpenAI Codex
- Claude Code
- Gemini CLI
- Google Antigravity
- Cursor
- Cline
- OpenCode
- Roo Code
- GitHub Copilot

Continue and Windsurf receive small native rule files that activate the shared skill. Other agents can use the same workflow whenever their host can read a project file or load Markdown instructions. Tool availability remains the responsibility of the agent runtime.

See [agent compatibility and installation details](docs/agent-compatibility.md).

## Install

Install the skill for all supported agents in the current repository:

~~~bash
node scripts/install.mjs --agent all
~~~

Install only the integrations you use:

~~~bash
node scripts/install.mjs --agent claude,cursor,codex
~~~

Install globally for your user account:

~~~bash
node scripts/install.mjs --agent all --scope global
~~~

Preview changes or update existing installed copies:

~~~bash
node scripts/install.mjs --agent all --dry-run
node scripts/install.mjs --agent all --force
~~~

The installer preserves existing installations by default. It only replaces files when --force is supplied, and it keeps unrelated files in the destination directory.

## Manual installation

For any agent that supports the Agent Skills standard, copy the complete skills/unslop directory to .agents/skills/unslop in the project or ~/.agents/skills/unslop for your user account.

You can also install from the project root by asking a filesystem-capable agent to read skills/unslop/SKILL.md and follow it.

## Use

Ask your agent to unslop, polish, clean up, or redesign a screen:

~~~text
/unslop this dashboard
/unslop the hero of https://example.com
Make this landing page feel designed rather than AI-generated.
~~~

The skill automatically activates in agents that support skill discovery when the task matches its description. In other environments, reference the skill path explicitly.

## What it does

- **Audit.** Lists every sign of slop with where it lives.
- **Direction.** Derives a product-specific character, world, moments, and signature detail.
- **Passes.** Works through spacing, color, icons, copy, type, layout, details, visuals, and motion in order.
- **Visuals.** Uses available image tools only when they add value; otherwise it works with the assets and code already available.
- **Verification.** Checks the edited screen against the initial audit and reports anything that could not be verified.
- **Story video.** Can create a short screen-recording-style story with Playwright and ffmpeg.

The skill works with React, Tailwind, HTML, CSS, Vue, Svelte, and other stacks because it focuses on the rendered interface and the source files that produce it.

## Optional browser and video dependencies

To snapshot a live site or create a story video, install Playwright and Chromium in the project:

~~~bash
npm install -D playwright
npx playwright install chromium
~~~

Story videos also require ffmpeg on your PATH. These dependencies are optional; the design workflow itself does not require them.

## Development

Run the test suite:

~~~bash
npm test
~~~

CI tests supported Node.js LTS lines.

## License and attribution

[CC BY 4.0](LICENSE). Use, adapt, and share this work, including commercially, while crediting Damir Sokolovsky ([@heydamir](https://x.com/heydamir)) and linking to the original [Unslop repository](https://github.com/heydamir/unslop).
