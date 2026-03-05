import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";

const db = new Database("agridrone.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS fields (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    farmer_id TEXT NOT NULL,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    boundary TEXT, -- JSON string of coordinates
    crop_type TEXT
  );

  CREATE TABLE IF NOT EXISTS flights (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    field_id INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    end_time DATETIME,
    FOREIGN KEY(field_id) REFERENCES fields(id)
  );

  CREATE TABLE IF NOT EXISTS analysis_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    flight_id INTEGER NOT NULL,
    image_url TEXT,
    analysis_json TEXT,
    severity TEXT, -- low, medium, high, critical
    is_anomaly BOOLEAN DEFAULT 0,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(flight_id) REFERENCES flights(id)
  );

  CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    field_id INTEGER NOT NULL,
    severity TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT 0,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(field_id) REFERENCES fields(id)
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/fields", (req, res) => {
    const fields = db.prepare("SELECT * FROM fields").all();
    res.json(fields);
  });

  app.post("/api/fields", (req, res) => {
    const { name, farmer_id, lat, lng, boundary, crop_type } = req.body;
    const info = db.prepare(
      "INSERT INTO fields (name, farmer_id, lat, lng, boundary, crop_type) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(name, farmer_id, lat, lng, JSON.stringify(boundary), crop_type);
    res.json({ id: info.lastInsertRowid });
  });

  app.get("/api/flights", (req, res) => {
    const flights = db.prepare(`
      SELECT f.*, fi.name as field_name 
      FROM flights f 
      JOIN fields fi ON f.field_id = fi.id
      ORDER BY f.start_time DESC
    `).all();
    res.json(flights);
  });

  app.post("/api/flights", (req, res) => {
    const { field_id } = req.body;
    const info = db.prepare("INSERT INTO flights (field_id, status) VALUES (?, 'active')").run(field_id);
    res.json({ id: info.lastInsertRowid });
  });

  app.patch("/api/flights/:id", (req, res) => {
    const { status } = req.body;
    db.prepare("UPDATE flights SET status = ?, end_time = CURRENT_TIMESTAMP WHERE id = ?").run(status, req.params.id);
    res.json({ success: true });
  });

  app.get("/api/analysis", (req, res) => {
    const analysis = db.prepare(`
      SELECT a.*, f.field_id, fi.name as field_name
      FROM analysis_results a
      JOIN flights f ON a.flight_id = f.id
      JOIN fields fi ON f.field_id = fi.id
      ORDER BY a.timestamp DESC
    `).all();
    res.json(analysis);
  });

  app.post("/api/analysis", (req, res) => {
    const { flight_id, image_url, analysis_json, severity, is_anomaly } = req.body;
    const info = db.prepare(
      "INSERT INTO analysis_results (flight_id, image_url, analysis_json, severity, is_anomaly) VALUES (?, ?, ?, ?, ?)"
    ).run(flight_id, image_url, JSON.stringify(analysis_json), severity, is_anomaly ? 1 : 0);
    
    // Auto-create alert for high/critical
    if (severity === 'high' || severity === 'critical') {
      const flight = db.prepare("SELECT field_id FROM flights WHERE id = ?").get(flight_id);
      db.prepare("INSERT INTO alerts (field_id, severity, message) VALUES (?, ?, ?)")
        .run(flight.field_id, severity, `Critical issue detected: ${analysis_json.issue || 'Unknown'}`);
    }

    res.json({ id: info.lastInsertRowid });
  });

  app.get("/api/alerts", (req, res) => {
    const alerts = db.prepare(`
      SELECT a.*, fi.name as field_name
      FROM alerts a
      JOIN fields fi ON a.field_id = fi.id
      ORDER BY a.timestamp DESC
    `).all();
    res.json(alerts);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
