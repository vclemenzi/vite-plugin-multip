export const isPackage = (modulesIds: string[]): boolean => {
  return modulesIds.some((id) => id.includes("node_modules"))
}
