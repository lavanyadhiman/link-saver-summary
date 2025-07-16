// init-db.ts
import { initializeDb } from './src/lib/db';

initializeDb().catch((err) => {
  console.error(err);
  process.exit(1);
});