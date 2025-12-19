const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Create database file
const db = new sqlite3.Database(
  path.join(__dirname, "database.db"),
  (err) => {
    if (err) {
      console.error("Database connection failed", err);
    } else {
      console.log("✅ SQLite database connected");
    }
  }
);

// USERS TABLE (Login)
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT
  )
`);

// PATIENTS TABLE
db.run(`
  CREATE TABLE IF NOT EXISTS patients (
    id TEXT PRIMARY KEY,
    name TEXT,
    age INTEGER,
    gender TEXT,
    disease TEXT,
    contact TEXT,
    priority TEXT,
    doctor_assigned TEXT,
    status TEXT
  )
`);

// DOCTORS TABLE
db.run(`
  CREATE TABLE IF NOT EXISTS doctors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    specialization TEXT,
    availability TEXT,
    contact TEXT,
    status TEXT
  )
`);

// STAFF TABLE
db.run(`
  CREATE TABLE IF NOT EXISTS staff (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    role TEXT,
    shift TEXT,
    contact TEXT
  )
`);

// APPOINTMENTS TABLE
db.run(`
  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id TEXT,
    doctor_id INTEGER,
    date TEXT,
    time TEXT,
    priority TEXT,
    status TEXT,
    diagnosis TEXT,
    treatment TEXT
  )
`);

module.exports = db;
