import 'dotenv/config';
import { createApp } from './app.js';
import { getPool, closePool } from './config/db.js';

const port = Number(process.env.PORT || 3001);
const app = createApp();
const server = app.listen(port, () => console.log(`FootFisio API escuchando en http://localhost:${port}`));

async function shutdown() {
  server.close(async () => { await closePool(); process.exit(0); });
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
