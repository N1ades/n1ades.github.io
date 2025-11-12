import '@dotenvx/dotenvx/config'
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createServer } from './lib/server.ts';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { app, wss } = createServer();

app.use(express.json());


app.use('/assets', express.static('./dist/assets', {
  maxAge: '1y',
  immutable: true 
}));

app.use(express.static('./dist'));



wss.on('connection', (socket: any) => {
  socket.on('close', () => {

  });
});
