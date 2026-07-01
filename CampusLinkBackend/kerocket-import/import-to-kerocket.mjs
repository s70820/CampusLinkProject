/**
 * Import campuslink-full-demo.sql into Kerocket MySQL (works with caching_sha2_password).
 * Usage: set DATABASE_URL then: node import-to-kerocket.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('Set DATABASE_URL, e.g. mysql://user:pass@host:port/app');
  process.exit(1);
}

function parseDatabaseUrl(raw) {
  const u = new URL(raw);
  return {
    host: u.hostname,
    port: Number(u.port || 3306),
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.replace(/^\//, '') || 'app',
  };
}

function splitStatements(sql) {
  const statements = [];
  let current = '';
  let inSingle = false;
  let inDouble = false;
  let escape = false;

  for (let i = 0; i < sql.length; i += 1) {
    const ch = sql[i];
    current += ch;

    if (escape) {
      escape = false;
      continue;
    }
    if (ch === '\\') {
      escape = true;
      continue;
    }
    if (!inDouble && ch === "'") {
      inSingle = !inSingle;
      continue;
    }
    if (!inSingle && ch === '"') {
      inDouble = !inDouble;
      continue;
    }
    if (!inSingle && !inDouble && ch === ';') {
      const trimmed = current.trim();
      if (trimmed && !trimmed.startsWith('--')) {
        statements.push(trimmed);
      }
      current = '';
    }
  }

  const tail = current.trim();
  if (tail && !tail.startsWith('--')) {
    statements.push(tail);
  }
  return statements.filter((statement) => {
    const upper = statement.toUpperCase();
    return !upper.includes('@OLD_CHARACTER_SET_CLIENT')
      && !upper.includes('@OLD_CHARACTER_SET_RESULTS')
      && !upper.includes('@OLD_COLLATION_CONNECTION')
      && !upper.includes('@OLD_TIME_ZONE')
      && !upper.includes('@OLD_UNIQUE_CHECKS')
      && !upper.includes('@OLD_FOREIGN_KEY_CHECKS')
      && !upper.includes('@OLD_SQL_MODE')
      && !upper.includes('@OLD_SQL_NOTES');
  });
}

async function connect(cfg) {
  return mysql.createConnection({
    ...cfg,
    multipleStatements: false,
    connectTimeout: 120_000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10_000,
  });
}

async function wipeDatabase(conn, database) {
  await conn.query(`USE \`${database}\``);
  await conn.query('SET FOREIGN_KEY_CHECKS = 0');
  const [tables] = await conn.query('SHOW TABLES');
  for (const row of tables) {
    const tableName = Object.values(row)[0];
    await conn.query(`DROP TABLE IF EXISTS \`${tableName}\``);
  }
  console.log(`Dropped ${tables.length} existing table(s).`);
}

async function main() {
  const cfg = parseDatabaseUrl(url);
  console.log(`Connecting to ${cfg.host}:${cfg.port}/${cfg.database} ...`);

  let conn = await connect(cfg);
  await conn.query('SET SESSION wait_timeout = 28800');
  await conn.query('SET SESSION net_read_timeout = 600');
  await conn.query('SET SESSION net_write_timeout = 600');
  try {
    await conn.query('SET SESSION max_allowed_packet = 67108864');
  } catch {
    // Some hosts disallow changing packet size.
  }

  const header = fs.readFileSync(path.join(__dirname, '00-use-app.sql'), 'utf8');
  const dump = fs.readFileSync(path.join(__dirname, 'campuslink-full-demo.sql'), 'utf8');

  console.log('Preparing database...');
  for (const statement of splitStatements(header)) {
    await conn.query(statement);
  }
  await wipeDatabase(conn, cfg.database);

  const statements = splitStatements(dump);

  console.log(`Executing ${statements.length} SQL statements...`);

  let done = 0;
  for (const statement of statements) {
    try {
      await conn.query(statement);
    } catch (err) {
      if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNRESET') {
        console.log('Reconnecting...');
        await conn.end().catch(() => {});
        conn = await connect(cfg);
        await conn.query(`USE \`${cfg.database}\``);
        await conn.query(statement);
      } else {
        throw err;
      }
    }
    done += 1;
    if (done % 25 === 0 || done === statements.length) {
      console.log(`  ${done}/${statements.length}`);
    }
  }

  const [[{ users }]] = await conn.query('SELECT COUNT(*) AS users FROM user');
  const [[{ programmes }]] = await conn.query('SELECT COUNT(*) AS programmes FROM programme');
  const [roles] = await conn.query('SELECT role, COUNT(*) AS cnt FROM user GROUP BY role');

  console.log('\nImport complete:');
  console.log(`  users: ${users}`);
  console.log(`  programmes: ${programmes}`);
  console.table(roles);

  await conn.end();
  console.log('\nNext: Restart Kerocket app, then test sarahdemo335@gmail.com / sarah123');
}

main().catch((err) => {
  console.error('Import failed:', err.message);
  process.exit(1);
});
