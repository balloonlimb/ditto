import { spawnSync } from "node:child_process";

export interface ReinstallResult {
  ok: boolean;
  stdout: string;
  stderr: string;
  code: number | null;
  command: string;
}

export function reinstallClaudeCode(version: string, npmBin = "npm"): ReinstallResult {
  const spec = `@anthropic-ai/claude-code@${version}`;
  const args = ["install", "-g", spec];
  const res = spawnSync(npmBin, args, {
    encoding: "utf8",
    timeout: 300_000,
  });
  const stdout = res.stdout ?? "";
  const stderr = res.stderr ?? "";
  const ok = res.status === 0 && !res.error;
  return { ok, stdout, stderr, code: res.status, command: `${npmBin} ${args.join(" ")}` };
}
