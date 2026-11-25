import { afterEach, test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { installSkill, parseArgs } from "../scripts/install.mjs";

const roots = [];
const tempRoot = () => {
  const root = mkdtempSync(join(tmpdir(), "unslop-install-"));
  roots.push(root);
  return root;
};

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

test("installs the complete skill for one native agent target", () => {
  const root = tempRoot();
  const result = installSkill({
    agents: ["cursor"],
    scope: "project",
    cwd: root,
    home: root,
    force: false,
    dryRun: false,
  });

  const skillRoot = join(root, ".cursor", "skills", "unslop");
  assert.equal(result.installed.length, 1);
  assert.ok(existsSync(join(skillRoot, "SKILL.md")));
  assert.ok(existsSync(join(skillRoot, "references", "tokens.md")));
  assert.ok(existsSync(join(skillRoot, "scripts", "snapshot.mjs")));
});

test("all installs shared and vendor-native skill directories plus activation rules", () => {
  const root = tempRoot();
  const result = installSkill({
    agents: parseArgs(["--agent", "all"]).agents,
    scope: "project",
    cwd: root,
    home: root,
    force: false,
    dryRun: false,
  });

  assert.ok(result.installed.length >= 10);
  assert.ok(existsSync(join(root, ".agents", "skills", "unslop", "SKILL.md")));
  assert.ok(existsSync(join(root, ".claude", "skills", "unslop", "SKILL.md")));
  assert.ok(existsSync(join(root, ".gemini", "skills", "unslop", "SKILL.md")));
  assert.ok(existsSync(join(root, ".cursor", "skills", "unslop", "SKILL.md")));
  assert.ok(existsSync(join(root, ".opencode", "skills", "unslop", "SKILL.md")));
  assert.ok(existsSync(join(root, ".roo", "skills", "unslop", "SKILL.md")));
  assert.ok(existsSync(join(root, ".github", "skills", "unslop", "SKILL.md")));
  assert.match(readFileSync(join(root, ".clinerules", "unslop.md"), "utf8"), /\.agents\/skills\/unslop\/SKILL\.md/);
  assert.ok(existsSync(join(root, ".continue", "rules", "unslop.md")));
  assert.ok(existsSync(join(root, ".windsurf", "rules", "unslop.md")));
});

test("existing skill directories are not overwritten unless force is set", () => {
  const root = tempRoot();
  const destination = join(root, ".agents", "skills", "unslop");
  mkdirSync(destination, { recursive: true });
  writeFileSync(join(destination, "SKILL.md"), "user-owned content");

  const first = installSkill({
    agents: ["agents"],
    scope: "project",
    cwd: root,
    home: root,
    force: false,
    dryRun: false,
  });
  assert.equal(first.skipped.length, 1);
  assert.equal(readFileSync(join(destination, "SKILL.md"), "utf8"), "user-owned content");

  writeFileSync(join(destination, "custom.txt"), "keep me");
  const second = installSkill({
    agents: ["agents"],
    scope: "project",
    cwd: root,
    home: root,
    force: true,
    dryRun: false,
  });
  assert.equal(second.installed.length, 1);
  assert.match(readFileSync(join(destination, "SKILL.md"), "utf8"), /^---\nname: unslop/);
  assert.equal(readFileSync(join(destination, "custom.txt"), "utf8"), "keep me");
});

test("global installation uses the selected home and skips project-only rule bridges", () => {
  const home = tempRoot();
  const result = installSkill({
    agents: ["antigravity", "continue"],
    scope: "global",
    cwd: tempRoot(),
    home,
    force: false,
    dryRun: false,
  });

  assert.ok(existsSync(join(home, ".gemini", "config", "skills", "unslop", "SKILL.md")));
  assert.equal(result.warnings.length, 1);
  assert.match(result.warnings[0], /no supported global rule location/);
});

test("dry run reports planned destinations without creating files", () => {
  const root = tempRoot();
  const result = installSkill({
    agents: ["windsurf"],
    scope: "project",
    cwd: root,
    home: root,
    force: false,
    dryRun: true,
  });

  assert.equal(result.installed.length, 2);
  assert.equal(existsSync(join(root, ".agents")), false);
  assert.equal(existsSync(join(root, ".windsurf")), false);
});

test("argument parsing validates target names and scopes", () => {
  assert.deepEqual(parseArgs(["--agent", "cursor,claude", "--scope", "project"]).agents, ["cursor", "claude"]);
  assert.equal(parseArgs(["--scope", "user"]).scope, "global");
  assert.throws(() => parseArgs(["--agent", "unknown"]), /Unknown agent/);
  assert.throws(() => parseArgs(["--scope", "everywhere"]), /Invalid scope/);
  assert.throws(() => parseArgs(["--agent", "all,cursor"]), /Use "all" by itself/);
});
