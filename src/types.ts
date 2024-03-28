import type { Options } from "html-minifier-terser";
import type { Target } from "rollup-plugin-copy";

export type Config = {
  directory?: string;
  page?: Page;
  minify?: Options;
  assets?: Target[];
  framework?: string;
};

export type Page = {
  title?: string | ((file: string) => string);
};
