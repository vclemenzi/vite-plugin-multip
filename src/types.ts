import type { Options } from "html-minifier-terser";
import type { Target } from "rollup-plugin-copy";

export type Config = {
  directory?: string;
  page?: Page;
  framework?: string;
  customHtml?: string;
  minify?: Options;
  assets?: Target[];
};

export type Page = {
  title?: string | ((file: string) => string);
};
