interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_APP_NAME: string
  readonly VITE_INSTITUTION_NAME: string
  readonly VITE_INSTITUTION_ABBR: string
   readonly VITE_REDIRECT_SSO: string
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}
