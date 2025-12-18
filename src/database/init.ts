import pool from "./database";
import { readFileSync } from "fs";
import { join } from "path";

const queryDropTables = `
DROP TABLE IF EXISTS payment CASCADE;
DROP TABLE IF EXISTS order_item CASCADE;
DROP TABLE IF EXISTS review CASCADE;
DROP TABLE IF EXISTS "order" CASCADE;
DROP TABLE IF EXISTS product CASCADE;
DROP TABLE IF EXISTS address CASCADE;
DROP TABLE IF EXISTS category CASCADE;
DROP TABLE IF EXISTS "user" CASCADE;
DROP TABLE IF EXISTS token CASCADE;
`;

const queryInitTables = `
INSERT INTO category (name) VALUES ('Lego WeDo')
`;

const queryCreateTables = readFileSync(
  join(__dirname, "database.sql"),
  "utf-8"
);

pool
  .query(queryDropTables)
  .then(() => {
    console.log("Tables dropped successfully");
    return pool.query(queryCreateTables);
  })
  .then(() => {
    console.log("Tables created successfully");
    return pool.query(queryInitTables);
  })
  .then(() => {
    console.log("Category 'Lego WeDo' created successfully");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error initializing database:", err);
    process.exit(1);
  });
