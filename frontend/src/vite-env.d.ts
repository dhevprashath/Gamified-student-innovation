/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL for the InnoQuest API. Relative (e.g. `/api/v1`) in dev via the Vite
   *  proxy; absolute API origin in production (e.g. `https://api.innoquest.app/api/v1`). */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
