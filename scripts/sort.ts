import { readFileSync, writeFileSync } from "node:fs";
import { dump, load } from "js-yaml";
import { consola } from "consola";

const LINK_FILE_PATH = new URL("../src/list.yml", import.meta.url);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function compareNames(a: string, b: string): number {
  const isAEnglish = /^[a-zA-Z]/.test(a);
  const isBEnglish = /^[a-zA-Z]/.test(b);

  if (isAEnglish !== isBEnglish) {
    return isAEnglish ? -1 : 1;
  }

  return a.localeCompare(b, "zh-CN");
}

try {
  const source = readFileSync(LINK_FILE_PATH, "utf8");
  const data: unknown = load(source);

  if (!isRecord(data)) {
    throw new TypeError("Expected list.yml to contain a YAML mapping.");
  }

  const sortedContent = Object.fromEntries(
    Object.entries(data).sort(([a], [b]) => compareNames(a, b)),
  );
  const content = dump(sortedContent, {
    indent: 2,
    lineWidth: -1,
    forceQuotes: false,
  });

  if (source === content) {
    consola.info("No changes detected.");
  } else {
    writeFileSync(LINK_FILE_PATH, content, "utf8");
    consola.success("list.yml sorted.");
  }
} catch (error) {
  consola.error(new Error("Failed to sort list.yml.", { cause: error }));
  process.exitCode = 1;
}
