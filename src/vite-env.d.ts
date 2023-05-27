/// <reference types="vite/client" />
interface ImportMetaEnv {
  VITE_TOKEN: string;
  VITE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
