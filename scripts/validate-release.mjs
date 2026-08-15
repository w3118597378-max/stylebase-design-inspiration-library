import { readFile, readdir, stat } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
let checks = 0;

function check(condition, message) {
  checks += 1;
  if (!condition) failures.push(message);
}

async function exists(target) {
  try {
    await stat(target);
    return true;
  } catch {
    return false;
  }
}

async function walk(directory, relative = "") {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (
      entry.name === ".git" ||
      entry.name === "node_modules" ||
      entry.name === ".worktrees"
    )
      continue;
    const relativePath = path.posix.join(relative, entry.name);
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(absolutePath, relativePath)));
    } else {
      files.push(relativePath);
    }
  }

  return files.sort();
}

const requiredFiles = [
  ".env.example",
  ".gitignore",
  "CHANGELOG.md",
  "CONTRIBUTING.md",
  "LICENSE",
  "README.md",
  "README.zh-CN.md",
  "SECURITY.md",
  "docs/architecture.md",
  "docs/privacy-and-content-rights.md",
  "docs/troubleshooting.md",
  "docs/verification.md",
  "library/inbox/.gitkeep",
  "package.json",
  "public/app.js",
  "scripts/smoke-test.mjs",
  "server.mjs",
  "src/db.mjs",
  "tests/library.test.mjs",
];

const files = await walk(root);
const distributableFiles = (() => {
  try {
    return execFileSync(
      "git",
      ["ls-files", "--cached", "--others", "--exclude-standard"],
      { cwd: root, encoding: "utf8" },
    )
      .split(/\r?\n/)
      .filter(Boolean)
      .sort();
  } catch {
    return files;
  }
})();

for (const file of requiredFiles) {
  check(files.includes(file), `缺少必要檔案：${file}`);
}

const forbiddenFiles = distributableFiles.filter(
  (file) =>
    file === ".env" ||
    file.startsWith("data/") ||
    /\.(?:sqlite|sqlite-shm|sqlite-wal|db|log)$/i.test(file) ||
    (file.startsWith("library/inbox/") &&
      file !== "library/inbox/.gitkeep"),
);
check(
  forbiddenFiles.length === 0,
  `公開版本含有本機資料：${forbiddenFiles.join(", ")}`,
);

const packageJson = JSON.parse(
  await readFile(path.join(root, "package.json"), "utf8"),
);
check(packageJson.name === "stylebase-design-inspiration-library", "package 名稱錯誤");
check(packageJson.version === "1.2.0", "package 版本必須是 1.2.0");
check(packageJson.license === "MIT", "package license 必須是 MIT");
check(
  packageJson.engines?.node === ">=24.0.0",
  "Node.js 最低版本必須是 >=24.0.0",
);

const license = await readFile(path.join(root, "LICENSE"), "utf8");
check(license.startsWith("MIT License"), "LICENSE 不是 MIT License");

const readme = await readFile(path.join(root, "README.md"), "utf8");
check(readme.includes("127.0.0.1:4177"), "README 缺少本機網址");
check(readme.includes("Send to Codex"), "README 缺少明確 AI 觸發說明");
check(readme.includes("MIT License"), "README 缺少授權說明");
const readmeZh = await readFile(path.join(root, "README.zh-CN.md"), "utf8");
check(readmeZh.includes("127.0.0.1:4177"), "README.zh-CN 缺少本機網址");
check(readmeZh.includes("送交 Codex"), "README.zh-CN 缺少明確 AI 觸發說明");
check(readmeZh.includes("MIT License"), "README.zh-CN 缺少授權說明");

const textExtensions = new Set([
  ".css",
  ".html",
  ".js",
  ".json",
  ".md",
  ".mjs",
  ".ps1",
  ".txt",
  ".yml",
  ".yaml",
]);
const secretPatterns = [
  /\bsk-[A-Za-z0-9_-]{20,}\b/g,
  /\bghp_[A-Za-z0-9]{20,}\b/g,
  /\bgithub_pat_[A-Za-z0-9_]{20,}\b/g,
  /\bAKIA[0-9A-Z]{16}\b/g,
];

for (const file of files) {
  if (!textExtensions.has(path.extname(file).toLowerCase())) continue;
  const content = await readFile(path.join(root, ...file.split("/")), "utf8");
  for (const pattern of secretPatterns) {
    pattern.lastIndex = 0;
    check(!pattern.test(content), `疑似憑證出現在：${file}`);
  }
}

const markdownFiles = files.filter((file) => file.endsWith(".md"));
const linkPattern = /!?\[[^\]]*]\(([^)]+)\)/g;

for (const file of markdownFiles) {
  const content = await readFile(path.join(root, ...file.split("/")), "utf8");
  for (const match of content.matchAll(linkPattern)) {
    const rawTarget = match[1].trim().replace(/^<|>$/g, "");
    const target = rawTarget.split(/\s+["']/)[0];
    if (
      !target ||
      target.startsWith("#") ||
      /^(?:https?:|mailto:)/i.test(target)
    ) {
      continue;
    }

    const [targetPath] = target.split("#");
    const resolved = path.resolve(
      path.dirname(path.join(root, ...file.split("/"))),
      decodeURIComponent(targetPath),
    );
    const withinRoot =
      resolved === root || resolved.startsWith(`${root}${path.sep}`);
    check(withinRoot, `Markdown 連結離開專案範圍：${file} → ${target}`);
    if (withinRoot) {
      check(
        await exists(resolved),
        `Markdown 連結不存在：${file} → ${target}`,
      );
    }
  }
}

if (failures.length > 0) {
  console.error(`Release validation failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`Release validation passed: ${checks} checks, ${files.length} files.`);
}
