import { resolve as nodeResolve } from "path";
import { normalizePath } from "vite";

export const resolve = (...paths: string[]) =>
  normalizePath(nodeResolve(...paths));
