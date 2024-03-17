import { exec } from "child_process";

export const hotupdate = () => {
  exec("npx vite build --mode development", (err) => {
    if (err) {
      console.error(err);
      return;
    }

    const timestamp = new Date().toLocaleTimeString();
    console.log(
      `\x1b[2m${timestamp}\x1b[32m [vite-plugin-multip]\x1b[0m Build completed`
    );
  });
};
