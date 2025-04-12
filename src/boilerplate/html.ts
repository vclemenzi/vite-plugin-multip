import fs from "fs";
import { minify } from "html-minifier-terser";
import type { Config, Framework } from "../types";
import { getLayoutByType } from "../utils/layouts";
import { fixNestedPath } from "../utils/path";
import { resolve } from "../utils/resolve";

export const html = async (
  body: string,
  file: string,
  framework: Framework,
  config?: Config,
  layout?: string,
  dev?: boolean
) => {
  let code = "";

  if (layout && fs.existsSync(layout)) {
    code = fs.readFileSync(layout, "utf-8");

    code = code.replace("<slot />", body);
  } else if (fs.existsSync(resolve("index.html"))) {
    const content = fs.readFileSync(resolve("index.html"), "utf-8");

    code = content.replace("<slot />", body);

    if (code === content) {
      code = code.replace("</body>", `${body}</body>`);
    }
  } else {
    code = "";
  }

  if (!code) {
    // Catch-all for when no index.html is found
    // Pretty rare case, because without the index.html the dev mode doesn't work

    code = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>${config?.page?.title ? config.page.title : "Vite App"}</title>
        </head>
        <body>
          ${body}
        </body>
      </html>`;
  }

  const {fixPath} = fixNestedPath(file, config?.directory ?? "src/pages", dev?? false)

  const cssPath = await getLayoutByType(file, "{css,scss,sass,less}");
  const scriptPath = await getLayoutByType(file, "{ts,js}");

  if (cssPath) {
    code = code.replace(
      "</head>",
      `<script type="module">import "${fixPath(resolve(cssPath))}";</script></head>`
    )
  }

  if (scriptPath) {
    code = code.replace(
      "</body>",
      `<script type="module">import "${fixPath(scriptPath)}";</script></body>`
    )
  }

  if (framework.type === "react" && dev) {
    code = code.replace(
      "<head>",
      `<head>
      <script type="module" src="/@multip/refresh-runtime"></script>`
    )
  }

  // Inject @multip dev scripts
  if (dev) {
    code = code.replace(
      "</body>",
      `<script type="module" src="/@multip/dev"></script></body>`
    )
  }

  const result = await minify(code, {
    collapseWhitespace: config?.minify?.collapseWhitespace || true,
    removeComments: config?.minify?.removeComments || true,
    minifyCSS: config?.minify?.minifyCSS || true,
    minifyJS: config?.minify?.minifyJS || true,
    ...config?.minify,
  });

  return result;
};
