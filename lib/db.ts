import "server-only";
import mysql, { type Pool, type RowDataPacket, type ResultSetHeader } from "mysql2/promise";

const globalForDb = globalThis as unknown as { swarupPool?: Pool };

export const pool: Pool =
  globalForDb.swarupPool ??
  mysql.createPool({
    host: process.env.DATABASE_HOST || "127.0.0.1",
    port: Number(process.env.DATABASE_PORT || 3306),
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    charset: "utf8mb4",
    connectionLimit: 6,
    decimalNumbers: true,
    dateStrings: false,
  });

if (process.env.NODE_ENV !== "production") globalForDb.swarupPool = pool;

export async function query<T extends RowDataPacket>(sql: string, params: unknown[] = []): Promise<T[]> {
  const [rows] = await pool.query<T[]>(sql, params);
  return rows;
}

export async function execute(sql: string, params: unknown[] = []): Promise<ResultSetHeader> {
  const [res] = await pool.execute<ResultSetHeader>(sql, params as never[]);
  return res;
}
