require('dotenv').config();

import * as functions from 'firebase-functions';
import next from 'next';
import path from 'path';

const app = next({
  conf: {
    distDir: `${path.relative(process.cwd(), __dirname)}/../functions/next`
  }
});
const handle = app.getRequestHandler();

export const nextApp = functions.https.onRequest(async (req, res) => {
  console.log('File: ' + req.originalUrl);
  return app.prepare().then(() => handle(req, res));
});

export * from './authorize';
