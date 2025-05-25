// src/typings.d.ts
declare module 'prerender.config' {
  const config: {
    routes: Array<string | {
      path: string;
      renderMode: string;
      getPrerenderParams: () => Promise<Array<{ [key: string]: any }>>;
    }>;
  };
  export default config;
}