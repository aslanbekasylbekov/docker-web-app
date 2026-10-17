const express = require("express");
const { Pool } = require("pg");

const PORT = process.env.PORT || 3000;
const APP_NAME = process.env.APP_NAME || "Docker Web App";
const APP_ENV = process.env.APP_ENV || "development";

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function initDb() {
  for (let attempt = 1; attempt <= 15; attempt++) {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS visits (
          id         SERIAL PRIMARY KEY,
          visited_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE TABLE IF NOT EXISTS messages (
          id         SERIAL PRIMARY KEY,
          author     TEXT NOT NULL,
          text       TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `);
      console.log("Database is ready");
      return;
    } catch (err) {
      console.log(`Waiting for database (attempt ${attempt})...`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  throw new Error("Database is not available");
}

const app = express();
app.use(express.json());

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
  );

app.get("/", async (req, res) => {
  await pool.query("INSERT INTO visits DEFAULT VALUES");
  const { rows: [{ count }] } = await pool.query("SELECT COUNT(*) FROM visits");
  const { rows: messages } = await pool.query(
    "SELECT author, text FROM messages ORDER BY id DESC LIMIT 10"
  );

  const list = messages.length
    ? messages.map((m) => `<li><b>${escapeHtml(m.author)}:</b> ${escapeHtml(m.text)}</li>`).join("")
    : "<li>No messages yet</li>";

  res.send(`<!DOCTYPE html>
<html>
<head>
  <title>${APP_NAME}</title>
</head>
<body>
  <h1>${APP_NAME}</h1>
  <p>Hello from Docker!</p>
  <p>Environment: ${APP_ENV}</p>
  <p>You are visitor #${count}</p>
  <h2>Guestbook</h2>
  <ul>${list}</ul>
</body>
</html>`);
});

app.get("/api/messages", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM messages ORDER BY id");
  res.json(rows);
});

app.post("/api/messages", async (req, res) => {
  const author = (req.body?.author || "").trim();
  const text = (req.body?.text || "").trim();
  if (!author || !text) {
    return res.status(400).json({ error: "author and text are required" });
  }
  const { rows } = await pool.query(
    "INSERT INTO messages (author, text) VALUES ($1, $2) RETURNING *",
    [author, text]
  );
  res.status(201).json(rows[0]);
});

app.get("/api/stats", async (req, res) => {
  const { rows } = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM visits)::int   AS total_visits,
      (SELECT COUNT(*) FROM messages)::int AS total_messages,
      (SELECT MAX(visited_at) FROM visits) AS last_visit
  `);
  res.json(rows[0]);
});

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`${APP_NAME} is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });