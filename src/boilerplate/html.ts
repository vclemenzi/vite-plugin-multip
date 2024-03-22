import { minify } from "html-minifier-terser";
import type { Config } from "../types";
import fs from "fs";

export const html = async (body: string, config?: Config, layout?: string) => {
  let code = "";

  if (layout && fs.existsSync(layout)) {
    const customHtml = fs.readFileSync(layout, "utf-8");

    code = customHtml.replace("<slot />", body);
  } else {
    code = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title></title>
        </head>
        <body>
          ${body}
        </body>
      </html>`;
  }

  const result = await minify(code, {
    collapseWhitespace: config?.minify?.collapseWhitespace || true,
    removeComments: config?.minify?.removeComments || true,
    ...config?.minify,
  });

  return result;
};
