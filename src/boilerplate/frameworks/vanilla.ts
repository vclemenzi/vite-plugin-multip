import fs from "fs";
import { analyzePageWarns } from "../../errors/analyzePageWarns";
import { fixNestedPath } from "../../utils/path";

export const vanilla = (
  file: string,
  css: string[],
  scripts: string[],
  dev: boolean,
  root: string
): string => {
  const html = fs.readFileSync(file, "utf-8");

  
  analyzePageWarns(html);
  const { generateImports } = fixNestedPath(file, root, dev)

  return `
    ${html}
    <script type="module">
      ${generateImports(css)}
      ${generateImports(scripts)}
    </script>
  `;
};
