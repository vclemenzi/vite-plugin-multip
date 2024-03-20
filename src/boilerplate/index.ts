import type { Config } from "../types";
import { react } from "./frameworks/react";
import { svelte } from "./frameworks/svelte";
import { vue } from "./frameworks/vue";
import { html } from "./html";

export const generateBoilerplate = async (file: string, framework: string, config: Config): Promise<string> => {
  switch (framework) {
    case "svelte":
      return await html(svelte(file), config);
    case "vue":
      return await html(vue(file), config);
    case "tsx" || "jsx":
      return await html(react(file), config);
    default:
      return "";
  };
}