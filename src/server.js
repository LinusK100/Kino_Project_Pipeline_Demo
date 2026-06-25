// Kino-Server — liefert die statische UI aus und stellt die API bereit.
// Bewusst ohne Framework (nur Node-Standardbibliothek), damit die Live-Demo
// keine externen Abhaengigkeiten braucht und das Docker-Image winzig bleibt.

import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { getMovies } from './db.js';

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');

// Version + Startzeitpunkt des laufenden Containers. Die Version setzt der
// Deploy-Job auf den Commit-SHA (siehe .github/workflows/deploy.yml); beides
// macht in der Demo sichtbar, dass wirklich ein NEUER Container ausgeliefert
// wurde (Titel + Version + Startzeit aendern sich).
const VERSION = process.env.APP_VERSION || 'dev';
const STARTED_AT = new Date().toISOString();

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
};

function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

async function sendStatic(res, relPath) {
  try {
    const full = path.join(PUBLIC_DIR, relPath);
    // Pfad-Traversal verhindern: nur Dateien innerhalb von public/ ausliefern.
    if (!full.startsWith(PUBLIC_DIR)) throw new Error('forbidden');
    const body = await readFile(full);
    res.writeHead(200, { 'Content-Type': MIME[path.extname(full)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  // API: liefert die Daten, die die UI anzeigt (Server -> UI).
  if (url.pathname === '/api/health')
    return sendJson(res, 200, { status: 'ok', version: VERSION, startedAt: STARTED_AT });
  if (url.pathname === '/api/movies') return sendJson(res, 200, { movies: getMovies() });

  // UI: statische Dateien aus public/.
  if (url.pathname === '/') return sendStatic(res, 'index.html');
  return sendStatic(res, url.pathname.replace(/^\/+/, ''));
});

server.listen(PORT, () => {
  console.log(`Kino-UI laeuft auf http://localhost:${PORT}`);
});
