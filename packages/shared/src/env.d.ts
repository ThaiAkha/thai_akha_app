declare module '*.svg' {
  const content: any;
  export default content;
}

// Vite env typing — accesso tipizzato a import.meta.env.VITE_* anche nel build
// isolato di shared (tsc). Runtime: Vite inlina le VITE_*; fuori da Vite il codice
// fa fallback (try/catch) a process.env.
interface ImportMetaEnv {
  readonly [key: string]: string | undefined;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
