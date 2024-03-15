export type Config = {
  directory?: string;
  page?: Page;
};

export type Page = {
  title?: string | ((file: string) => string);
}
