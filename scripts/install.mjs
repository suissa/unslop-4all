#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const SKILL_SOURCE = fileURLToPath(new URL("../skills/unslop/", import.meta.url));

const rule = (agent) =>
  "# Unslop\n\n" +
  "When a user asks to polish, clean up, redesign, or make a UI look less AI-generated, " +
  "read and follow the complete skill at .agents/skills/unslop/SKILL.md before editing.\n\n" +
  "Use the skill's audit, product-specific visual direction, ordered design passes, and final verification. " +
  "Do not assume a particular model provider, tool name, MCP server, framework, or image service. " +
  "Use only capabilities available in the current agent environment. If a capability is unavailable, " +
  "continue with the best supported alternative and report the limitation.\n\n" +
  "This rule is an activation bridge for " + agent + "; the full workflow remains in the shared skill.\n";

const PROFILES = Object.freeze({
  agents: {
    label: "Agent Skills standard",
    project: [".agents/skills/unslop"],
    global: [".agents/skills/unslop"],
  },
  codex: {
    label: "OpenAI Codex",
    project: [".agents/skills/unslop"],
    global: [".agents/skills/unslop"],
  },
  claude: {
    label: "Claude Code",
    project: [".claude/skills/unslop"],
    global: [".claude/skills/unslop"],
  },
  gemini: {
    label: "Gemini CLI",
    project: [".gemini/skills/unslop"],
    global: [".gemini/skills/unslop"],
  },
  antigravity: {
    label: "Google Antigravity",
    project: [".agents/skills/unslop"],
    global: [".gemini/config/skills/unslop"],
  },
  cursor: {
    label: "Cursor",
    project: [".cursor/skills/unslop"],
    global: [".cursor/skills/unslop"],
  },
  cline: {
    label: "Cline",
    project: [".agents/skills/unslop"],
    global: [".agents/skills/unslop"],
    rules: [{ path: ".clinerules/unslop.md", content: rule("Cline") }],
  },
  opencode: {
    label: "OpenCode",
    project: [".opencode/skills/unslop"],
    global: [".config/opencode/skills/unslop"],
  },
  roo: {
    label: "Roo Code",
    project: [".roo/skills/unslop"],
    global: [".roo/skills/unslop"],
  },
  copilot: {
    label: "GitHub Copilot",
    project: [".github/skills/unslop"],
    global: [".copilot/skills/unslop"],
  },
  continue: {
    label: "Continue",
    project: [".agents/skills/unslop"],
    global: null,
    rules: [{ path: ".continue/rules/unslop.md", content: rule("Continue") }],
  },
  windsurf: {
    label: "Windsurf",
    project: [".agents/skills/unslop"],
    global: null,
    rules: [{ path: ".windsurf/rules/unslop.md", content: rule("Windsurf") }],
  },
});

export function parseArgs(args) {
  const options = {
    agents: ["agents"],
    scope: "project",
    cwd: process.cwd(),
    home: homedir(),
    force: false,
    dryRun: false,
    list: false,
    help: false,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const [flag, inlineValue] = arg.split(/=(.*)/s, 2);
    const takeValue = () => {
      const value = inlineValue ?? args[++index];
      if (!value || value.startsWith("--")) {
        throw new Error(flag + " requires a value.");
      }
      return value;
    };

    switch (flag) {
      case "--agent":
        options.agents = takeValue().split(",").map((name) => name.trim().toLowerCase()).filter(Boolean);
        break;
      case "--scope":
        options.scope = takeValue().toLowerCase();
        break;
      case "--cwd":
        options.cwd = resolve(takeValue());
        break;
      case "--home":
        options.home = resolve(takeValue());
        break;
      case "--force":
        options.force = true;
        break;
      case "--dry-run":
        options.dryRun = true;
        break;
      case "--list":
        options.list = true;
        break;
      case "--help":
      case "-h":
        options.help = true;
        break;
      default:
        throw new Error("Unknown option: " + arg);
    }
  }

  if (options.scope === "user") options.scope = "global";
  if (!["project", "global"].includes(options.scope)) {
    throw new Error('Invalid scope "' + options.scope + '". Use project or global.');
  }

  if (options.agents.includes("all")) {
    if (options.agents.length !== 1) {
      throw new Error('Use "all" by itself, or list individual agents.');
    }
    options.agents = Object.keys(PROFILES);
  }

  for (const name of options.agents) {
    if (!PROFILES[name]) {
      throw new Error('Unknown agent "' + name + '". Run with --list to see supported targets.');
    }
  }

  return options;
}

export function installSkill(options, dependencies = {}) {
  const sourceDir = resolve(dependencies.sourceDir ?? SKILL_SOURCE);
  const log = dependencies.log ?? (() => {});
  const baseDir = options.scope === "global" ? resolve(options.home ?? homedir()) : resolve(options.cwd ?? process.cwd());
  const installed = [];
  const skipped = [];
  const warnings = [];
  const seenDirectories = new Set();
  const seenRules = new Set();

  if (!existsSync(resolve(sourceDir, "SKILL.md"))) {
    throw new Error("The source skill is missing SKILL.md: " + sourceDir);
  }

  for (const name of options.agents) {
    const profile = PROFILES[name];
    const destinations = profile[options.scope];

    if (!destinations) {
      warnings.push(profile.label + " has no supported global rule location; skipped for global scope.");
      continue;
    }

    for (const relativePath of destinations) {
      const destination = resolve(baseDir, relativePath);
      const escaped = relative(baseDir, destination);
      if (escaped === ".." || escaped.startsWith(".." + sep) || isAbsolute(escaped)) {
        throw new Error("Refusing to install outside the selected scope: " + relativePath);
      }
      if (seenDirectories.has(destination)) continue;
      seenDirectories.add(destination);

      if (existsSync(destination) && !options.force) {
        skipped.push(destination);
        log("skip", destination);
        continue;
      }

      if (options.dryRun) {
        installed.push(destination);
        log("would install", destination);
        continue;
      }

      mkdirSync(dirname(destination), { recursive: true });
      cpSync(sourceDir, destination, { recursive: true, force: true });
      installed.push(destination);
      log("installed", destination);
    }

    if (options.scope !== "project") continue;
    for (const nativeRule of profile.rules ?? []) {
      const destination = resolve(baseDir, nativeRule.path);
      if (seenRules.has(destination)) continue;
      seenRules.add(destination);

      if (existsSync(destination) && !options.force) {
        skipped.push(destination);
        log("skip", destination);
        continue;
      }

      if (options.dryRun) {
        installed.push(destination);
        log("would write", destination);
        continue;
      }

      mkdirSync(dirname(destination), { recursive: true });
      writeFileSync(destination, nativeRule.content, "utf8");
      installed.push(destination);
      log("wrote", destination);
    }
  }

  return { installed, skipped, warnings };
}

export function usage() {
  return [
    "Unslop agent installer",
    "",
    "Usage:",
    "  node scripts/install.mjs [options]",
    "",
    "Options:",
    "  --agent <name[,name...]|all>  Target agent(s). Default: agents",
    "  --scope <project|global>      Install in this repository or in the user home",
    "  --cwd <path>                  Project root (default: current directory)",
    "  --home <path>                 Home directory override (useful for testing)",
    "  --force                       Update files that already exist; unrelated files are kept",
    "  --dry-run                     Show planned changes without writing",
    "  --list                        List supported agents",
    "  --help                        Show this help",
    "",
    "Supported agents: " + Object.keys(PROFILES).join(", "),
  ].join("\n");
}

function main() {
  try {
    const options = parseArgs(process.argv.slice(2));
    if (options.help) {
      console.log(usage());
      return;
    }
    if (options.list) {
      for (const [name, profile] of Object.entries(PROFILES)) {
        console.log(name.padEnd(14) + profile.label);
      }
      return;
    }

    const result = installSkill(options, {
      log: (action, destination) => console.log(action + ": " + destination),
    });
    for (const warning of result.warnings) console.warn("warning: " + warning);
    console.log(
      "\nDone. " +
        result.installed.length +
        " target(s) written or planned; " +
        result.skipped.length +
        " existing target(s) skipped.",
    );
    if (result.installed.length === 0 && result.skipped.length === 0) {
      process.exitCode = 1;
    }
  } catch (error) {
    console.error(error.message);
    console.error("\n" + usage());
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main();
}
