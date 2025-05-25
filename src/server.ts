// Reemplazar contenido de src/server.ts con:
import 'zone.js/node';
import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr/node';
import express from 'express';
import { existsSync } from 'fs';
import { join } from 'path';
import { AppServerModule } from './main.server';

export function app(): express.Express {
  const server = express();
  const distFolder = join(process.cwd(), 'dist/pt3/browser');
  const indexHtml = existsSync(join(distFolder, 'index.original.html'))
    ? join(distFolder, 'index.original.html')
    : join(distFolder, 'index.html');

  const commonEngine = new CommonEngine();

  server.set('view engine', 'html');
  server.set('views', distFolder);

  server.get('*.*', express.static(distFolder));

  server.get('*', (req, res, next) => {
    commonEngine
      .render({
        bootstrap: AppServerModule,
        documentFilePath: indexHtml,
        url: req.url,
        publicPath: distFolder,
        providers: [{ provide: APP_BASE_HREF, useValue: req.baseUrl }],
      })
      .then((html) => res.send(html))
      .catch((err) => next(err));
  });

  return server;
}

const port = process.env['PORT'] || 4000;
app().listen(port, () => 
  console.log(`Server running on http://localhost:${port}`));