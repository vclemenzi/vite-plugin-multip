export function relative(input: string, relativeRoot: string) {
  function split(path: string, relativeRoot: string) {
    const paths = path.split(relativeRoot)
    if (paths.length <= 1) {
      return {
        base: "",
        path: paths[0] ?? "",
      }
    }
    return {
      base: paths[0] ?? "",
      path: paths[1] ?? "",

    }
  }

  const { path, base } = split(input, relativeRoot)
  return {
    base,
    path,
    deep: path.split("/").filter(Boolean).length,
  }
}

/**
 * The fixPath method strongly associates the accessed page with the environment.
 * 
 *  When in development mode, all referenced resources must calculate paths relative to the current page, especially for multi-level nested pages. 
 * 
 * It cannot simply assume resources are located in a first-level subdirectory.
 */
export function fixNestedPath(input: string, relativeRoot: string, dev: boolean) {
  const { path, base, deep } = relative(input, relativeRoot)

  const fixPath = dev ? _fixPath : _rawPath

  function _fixPath(path_: string, _orElse: string = path_) {
    if (!path_) {
      return ""
    }
    const relativePath = path_.replace(base, "").replace(/^\//, "")
    if (deep <= 1) {
      return "./" + relativePath
    }
    return "../".repeat(deep - 1) + relativePath
  }
  function _rawPath(path_: string, orElse: string = path_) {
    return orElse
  }

  function generateImports(files: string[]) {
    return files.map((file) => `import '${fixPath(file)}';`).join("\n");
  }

  return {
    base,
    path: fixPath(relativeRoot + path, input),
    fixPath,
    generateImports
  }
}