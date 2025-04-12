import fs from "fs";
import markdownit from "markdown-it";
import { fixNestedPath } from "../../utils/path";

export const markdown = (
  file: string,
  css: string[],
  scripts: string[],
  dev: boolean,
  root: string
): string => {
  const content = fs.readFileSync(file, "utf-8");
  const { generateImports } = fixNestedPath(file, root, dev);

  const md = markdownit();

  const html = md.render(content);

  return `
    <div id="app">${html}</div>
    <script type="module">
    ${generateImports(css)}
    ${generateImports(scripts)}
    </script>
  `;
};
