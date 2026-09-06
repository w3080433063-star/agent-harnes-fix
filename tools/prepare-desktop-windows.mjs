import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, copyFile, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
if (process.platform !== "win32" || process.arch !== "x64")
  throw new Error("This bootstrap supports Windows x64. Other platforms: npm run build.");
const npm = process.env.npm_execpath;
if (!npm) throw new Error("Run with npm run desktop:prepare");
const download = path.join(root, "downloads");
await mkdir(download, { recursive: true });
const archive = path.join(download, "codexhost-cli-win32-x64-0.5.0.tgz");
try {
  await access(archive);
} catch {
  execFileSync(
    process.execPath,
    [
      npm,
      "pack",
      "@codexhost/cli-win32-x64@0.5.0",
      "--ignore-scripts",
      "--pack-destination",
      download,
    ],
    { cwd: root, stdio: "inherit", windowsHide: true },
  );
}
const integrity =
  "O+mpbiknp6WDOlEP8fe06Vdh5nV+q6+aeZV9yEeWaMCC7s7LbMLDE53oPleH01j1qSI/KBf++iTYXm3U+ZaJVQ==";
if (
  createHash("sha512")
    .update(await readFile(archive))
    .digest("base64") !== integrity
)
  throw new Error("Native archive integrity mismatch");
const unpack = path.join(download, "native-0.5.0");
await mkdir(unpack, { recursive: true });
execFileSync("tar", ["-xzf", archive, "-C", unpack], { windowsHide: true });
const target = path.join(root, "target", "debug");
await mkdir(target, { recursive: true });
for (const [from, to] of [
  ["bin/codexhost.exe", "codexhost.exe"],
  ["libexec/codexhost-shim.exe", "codexhost-shim.exe"],
  ["libexec/codexhost-updater.exe", "codexhost-updater.exe"],
])
  await copyFile(path.join(unpack, "package", from), path.join(target, to));
for (const task of ["build:typescript", "build:renderer"])
  execFileSync(process.execPath, [npm, "run", task], {
    cwd: root,
    stdio: "inherit",
    windowsHide: true,
  });
console.log(
  "Desktop artifacts ready. Native launcher/shim: upstream v0.5.0. Host and renderer: this source checkout. Run npm start -- --no-build to restart Codex Desktop.",
);
