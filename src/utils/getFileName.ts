export const getFileName = (framework: string): string => {
  return `main.ts${framework === "tsx" ? "x" : ""}`
}
