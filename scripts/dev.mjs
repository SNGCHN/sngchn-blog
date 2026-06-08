import { spawn } from "node:child_process";

const isWindows = process.platform === "win32";

const commands = [
  {
    name: "velite",
    command: "pnpm",
    args: ["exec", "velite", "dev"],
  },
  {
    name: "next",
    command: "pnpm",
    args: ["exec", "next", "dev"],
  },
];

const children = new Set();
let isShuttingDown = false;

function stopAll(signal = "SIGTERM") {
  if (isShuttingDown) return;
  isShuttingDown = true;

  for (const child of children) {
    if (!child.killed) {
      child.kill(signal);
    }
  }
}

for (const commandConfig of commands) {
  const child = spawn(commandConfig.command, commandConfig.args, {
    stdio: "inherit",
    shell: isWindows,
    env: process.env,
  });

  children.add(child);

  child.on("exit", (code, signal) => {
    children.delete(child);

    if (isShuttingDown) return;

    if (code === 0 || signal) {
      stopAll();
      process.exit(code ?? 0);
    }

    console.error(`${commandConfig.name} exited with code ${code}.`);
    stopAll();
    process.exit(code ?? 1);
  });
}

process.on("SIGINT", () => {
  stopAll("SIGINT");
});

process.on("SIGTERM", () => {
  stopAll("SIGTERM");
});
