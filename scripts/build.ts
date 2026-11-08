import { cpSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { load } from "js-yaml";
import { consola } from "consola";
import { friendsSchema } from "./friend-schema.js";

const LINK_FILE_PATH = new URL("../src/list.yml", import.meta.url);
const OUTPUT_FILE_PATH = new URL("../dist/linklist.json", import.meta.url);
const IMAGE_SOURCE_PATH = new URL("../src/img/", import.meta.url);
const IMAGE_OUTPUT_PATH = new URL("../dist/img/", import.meta.url);
const AVATAR_BASE_URL = "https://treasures-dist.sirvr.win/img/";

try {
  const source = readFileSync(LINK_FILE_PATH, "utf8");
  const data: unknown = load(source);
  const parsed = friendsSchema.safeParse(data);

  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const path = issue.path.length > 0 ? issue.path.join(".") : "(root)";
      consola.error(new Error(`${path}: ${issue.message}`));
    }
    process.exitCode = 1;
  } else {
    const result = Object.fromEntries(
      Object.entries(parsed.data).map(([name, friend]) => [
        name,
        {
          ...friend,
          avatar: new URL(encodeURIComponent(friend.avatar), AVATAR_BASE_URL)
            .href,
        },
      ]),
    );
    const outputPath = fileURLToPath(OUTPUT_FILE_PATH);

    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`, "utf8");
    cpSync(IMAGE_SOURCE_PATH, IMAGE_OUTPUT_PATH, { recursive: true });
    consola.success(`Generated ${outputPath}.`);
    consola.success("Copied src/img/ to dist/img/.");
  }
} catch (error) {
  consola.error(new Error("Failed to generate dist/linklist.json.", { cause: error }));
  process.exitCode = 1;
}
