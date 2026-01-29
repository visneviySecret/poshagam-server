import { spawn } from "child_process";
import { readdirSync } from "fs";
import { join, resolve } from "path";

const migrationsDir = resolve(__dirname, "migrations");

const run = (command: string, args: string[]) =>
  new Promise<number>((resolvePromise, rejectPromise) => {
    const child = spawn(command, args, { stdio: "inherit", shell: true });
    child.on("error", rejectPromise);
    child.on("close", (code) => resolvePromise(code ?? 0));
  });

const main = async () => {
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".ts"))
    .sort((a, b) => a.localeCompare(b));

  for (const file of files) {
    const fullPath = join(migrationsDir, file);
    const code = await run("ts-node", [fullPath]);
    if (code !== 0) {
      process.exit(code);
    }
  }
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

