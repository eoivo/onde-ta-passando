import { spawn } from "node:child_process";
import { resolve } from "node:path";

const isWin = process.platform === "win32";
const npmCmd = isWin ? "npm.cmd" : "npm";

const services = [
  { name: "SERVER", cwd: resolve("server"), color: "\x1b[33m" }, // Amarelo
  { name: "CLIENT", cwd: resolve("client"), color: "\x1b[36m" }, // Ciano
];

const reset = "\x1b[0m";
const children = [];

function prefixStream(stream, label, color) {
  let buffer = "";
  stream.on("data", (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      process.stdout.write(`${color}[${label}]${reset} ${line}\n`);
    }
  });
  stream.on("end", () => {
    if (buffer.length > 0) {
      process.stdout.write(`${color}[${label}]${reset} ${buffer}\n`);
    }
  });
}

for (const svc of services) {
  const child = spawn(npmCmd, ["run", "dev"], {
    cwd: svc.cwd,
    env: { ...process.env, FORCE_COLOR: "1" },
    shell: isWin,
    stdio: ["ignore", "pipe", "pipe"],
  });

  children.push(child);
  prefixStream(child.stdout, svc.name, svc.color);
  prefixStream(child.stderr, svc.name, svc.color);

  child.on("exit", (code) => {
    if (code !== null && code !== 0) {
      process.stdout.write(`${svc.color}[${svc.name}]${reset} encerrou com código ${code}\n`);
    }
  });
}

function shutdown() {
  for (const child of children) {
    if (!child.killed) {
      if (isWin && child.pid) {
        spawn("taskkill", ["/pid", String(child.pid), "/f", "/t"], { stdio: "ignore" });
      } else {
        child.kill("SIGINT");
      }
    }
  }
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
