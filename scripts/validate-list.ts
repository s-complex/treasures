import  { readFileSync } from "node:fs";
import { load } from "js-yaml";
import { consola } from 'consola';
import { friendsSchema } from "./friend-schema.js";

const LINK_FILE_PATH = new URL("../src/list.yml", import.meta.url);

const source = readFileSync(LINK_FILE_PATH, "utf8");
const data: unknown = load(source);
const result = friendsSchema.safeParse(data);

if (!result.success) {
  for (const issue of result.error.issues) {
    const path = issue.path.length > 0 ? issue.path.join(".") : "(root)";
    consola.error(new Error(`${path}: ${issue.message}`));
  }
  process.exitCode = 1;
} else {
  consola.success(`Validated ${Object.keys(result.data).length} entries in list.yml.`);
}
