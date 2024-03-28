export const generateImports = (files: string[]) => {
  return files.map((file) => `import '${file}';`).join("\n");
};
