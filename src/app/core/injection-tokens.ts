import { InjectionToken } from '@angular/core';

declare global {
  interface Window {
    PRERENDER_CONFIG: any;
  }
}

export const PRERENDER_CONFIG = new InjectionToken<any>('PrerenderConfig');