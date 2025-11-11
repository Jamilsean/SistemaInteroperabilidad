// // export const API_BASE_URL = "https://nuiobackend.onrender.com/api/v1";
// export const API_BASE_URL = "https://nuiobackend.onrender.com/api/v1";
// export const nombre_sistema = "Sistema para la Interoperabilidad de repositorios INAIGEM";
// export const nombre_institucio= "Instituto Nacional de Investigación en Glaciares y Ecosistemas de Montaña";
// export const abreviatura_institucio= "INAIGEM";
// export const VITE_RECAPTCHA_SITE_KEY="tu_site_key_publica";
// export const REDIRECT_SSO = "https://intranet.inaigem.gob.pe/main/home";

// export const STORAGE_KEYS = {
//   ACCESS_TOKEN: "auth.access_token",
//   TOKEN: "auth.token_type",
//   EXPIRES_AT: "auth.expires_at", 
//   USER: "auth.user", 
// };
// src/config/env.ts
const requireEnv = (key: keyof ImportMetaEnv) => {
  const v = import.meta.env[key];
  if (!v) throw new Error(`Falta la variable ${key} en el .env`);
  return v;
};

export const API_BASE_URL = requireEnv('VITE_API_BASE_URL');
export const nombre_sistema = requireEnv('VITE_APP_NAME');
export const nombre_institucion = requireEnv('VITE_INSTITUTION_NAME');
export const abreviatura_institucio = requireEnv('VITE_INSTITUTION_ABBR');
export const REDIRECT_SSO = requireEnv('VITE_REDIRECT_SSO');

export const STORAGE_KEYS = {
  ACCESS_TOKEN: "auth.access_token",
  TOKEN: "auth.token_type",
  EXPIRES_AT: "auth.expires_at",
  USER: "auth.user",
} as const;
