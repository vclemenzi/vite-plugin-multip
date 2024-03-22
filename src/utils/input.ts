import { dirname } from "path";
import { resolve } from "./resolve";

export const getInputs = (
  pages: string[],
  root: string
): [Record<string, string>, string] => {
  let framework = "";

  const entries = pages.map((page) => {
    // Get framework from file extension
    if (!framework) framework = page.split(".").pop() || "";

    const name = dirname(page);

    if (name === "." || !name) return "index";

    return name;
  });

  const input = entries.reduce((acc: Record<string, string>, page) => {
    const fileName = "index.html";

    if (page === "index") {
      acc[page] = resolve(root, fileName);
      return acc;
    }

    acc[page] = resolve(root, page, fileName);

    return acc;
  }, {});

  return [input, framework];
};
