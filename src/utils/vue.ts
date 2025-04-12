import { dirname, } from "path";
import glob from "tiny-glob";
import { relative } from "./path";
import { resolve } from "./resolve";

/**
 * deal with nested page
 */
export const getInitFile = async (id: string): Promise<string> => {
  const { deep } = relative(id, "src")

  for (let i = 0; i < deep; i++) {
    const init = await _getInitFile(id, i)
    if (init) {
      return init
    }
  }
  return ""
};

async function _getInitFile(id: string, deep = 1) {
  const path = resolve(dirname(id), "../".repeat(deep));
  const init = await glob("../**/init.{ts,js}", {
    cwd: path,
    filesOnly: true,
  });

  if (init.length < 1 || typeof init[0] != "string") return "";

  const nearestInit = init.sort((a, b) => {
    return a.split("/").length - b.split("/").length;
  });

  if (nearestInit.length < 1 || typeof nearestInit[0] != "string")
    throw new Error("Nearest init file not found");

  return resolve(path, nearestInit[0]);
}