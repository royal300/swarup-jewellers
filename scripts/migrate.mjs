// Applies db/schema.sql. Every statement is CREATE TABLE IF NOT EXISTS, so re-running is safe.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";
import { dbConfig, loadEnv } from "./env.mjs";

loadEnv();
const here = path.dirname(fileURLToPath(import.meta.url));
const sql = fs.readFileSync(path.join(here, "..", "db", "schema.sql"), "utf8");
const conn = await mysql.createConnection({ ...dbConfig(), multipleStatements: true });
await conn.query(sql);
const [tables] = await conn.query("SHOW TABLES");
console.log("schema ok:", tables.map((t) => Object.values(t)[0]).join(", "));
await conn.end();
