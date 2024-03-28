import glob from "tiny-glob";
import { resolve } from "../utils/resolve";

export const getStyles = async (path: string): Promise<string[]> => {
  const files = await glob(`${path}/*.css`);
  const styles = files.filter((file) => !file.includes("layout"));

  return styles.map((file) => {
    return resolve(file);
  });
};
