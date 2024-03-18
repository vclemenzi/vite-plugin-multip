import { minify } from "html-minifier-terser";
import type { Config } from "../types";

export const html = async (body: string, config?: Config): Promise<string> => {
  const code = `
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

  const result = await minify(code, {
    collapseWhitespace: config?.minify?.collapseWhitespace || true,
    removeComments: config?.minify?.removeComments || true,
  });

  return result;
}
